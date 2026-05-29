require('dotenv').config();
const express = require('express');
const cors = require('cors');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { spawn } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json());

const EXCEL_FILE_PATH = path.join(__dirname, 'Configuration_Output.xlsx');

// Helper to trigger Power BI Dataset Refresh
async function triggerPowerBiRefresh() {
  const configPath = path.join(__dirname, 'powerbi_config.json');
  if (!fs.existsSync(configPath)) {
    return { success: false, message: 'powerbi_config.json file does not exist.' };
  }

  let config;
  try {
    const rawData = fs.readFileSync(configPath, 'utf8');
    config = JSON.parse(rawData);
  } catch (err) {
    return { success: false, message: `Failed to parse powerbi_config.json: ${err.message}` };
  }

  const { tenantId, clientId, clientSecret, workspaceId, datasetId } = config;
  const personalAccessToken = process.env.POWERBI_PERSONAL_ACCESS_TOKEN || config.personalAccessToken;

  // Validate configuration presence
  if (!workspaceId || !datasetId) {
    return { success: false, message: 'Incomplete workspaceId or datasetId parameters inside powerbi_config.json.' };
  }

  // 1. Check if a Personal Access Token is provided and active
  if (personalAccessToken && personalAccessToken.trim() && !personalAccessToken.includes('YOUR_')) {
    console.log('[Power BI Refresh] Personal Access Token detected. Triggering refresh directly...');
    return triggerRefreshApi(workspaceId, datasetId, personalAccessToken.trim());
  }

  // 2. Check if credentials are still placeholder values
  const hasPlaceholders = 
    tenantId.includes('YOUR_') || 
    clientId.includes('YOUR_') || 
    clientSecret.includes('YOUR_') || 
    workspaceId.includes('YOUR_') || 
    datasetId.includes('YOUR_');

  if (hasPlaceholders) {
    console.log('[Power BI Refresh] Placeholders detected. Mocking refresh trigger...');
    return { 
      success: true, 
      mocked: true, 
      message: `[MOCK SUCCESS] Power BI refresh simulated for Dataset ID: ${datasetId} in Workspace ID: ${workspaceId} using Client ID: ${clientId}.` 
    };
  }

  // 1. Get Access Token via OAuth2 Client Credentials
  return new Promise((resolve) => {
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    const postData = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'https://analysis.windows.net/powerbi/api/.default'
    }).toString();

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(tokenUrl, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          resolve({ 
            success: false, 
            message: `Azure AD Token request failed with status ${res.statusCode}: ${data}` 
          });
          return;
        }

        try {
          const json = JSON.parse(data);
          const accessToken = json.access_token;
          
          // 2. Trigger Refresh on Power BI Dataset
          triggerRefreshApi(workspaceId, datasetId, accessToken).then(resolve);
        } catch (err) {
          resolve({ success: false, message: `Failed to parse Azure AD response: ${err.message}` });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ success: false, message: `Azure AD request error: ${err.message}` });
    });

    req.write(postData);
    req.end();
  });
}

function triggerRefreshApi(workspaceId, datasetId, accessToken) {
  return new Promise((resolve) => {
    const refreshUrl = `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/datasets/${datasetId}/refreshes`;
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Length': '0'
      }
    };

    const req = https.request(refreshUrl, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // Power BI returns 202 Accepted on success
        if (res.statusCode === 202 || res.statusCode === 201 || res.statusCode === 200) {
          resolve({ 
            success: true, 
            message: `Power BI dataset refresh triggered successfully. Dataset ID: ${datasetId}` 
          });
        } else {
          resolve({ 
            success: false, 
            message: `Power BI API failed with status ${res.statusCode}: ${data}` 
          });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ success: false, message: `Power BI API request error: ${err.message}` });
    });

    req.end();
  });
}

app.post('/api/publish', async (req, res) => {
  try {
    const { markers, scenarios } = req.body;

    if (!scenarios) {
      return res.status(400).json({ success: false, message: 'Missing scenarios data.' });
    }

    // 1. Format Markers for Excel (Dim_MarkerScoringConfig) - pulling from each scenario!
    const markerRows = [];
    scenarios.forEach(s => {
      const scenarioMarkers = s.markers || markers || [];
      const scenarioId = s.ScenarioId || '';
      const scenarioName = s.Scenario || '';

      scenarioMarkers.forEach(m => {
        m.bands.forEach(b => {
          markerRows.push({
            ScenarioID: scenarioId,
            ScenarioName: scenarioName,
            MarkerName: m.MarkerName,
            Scope: m.Scope,
            WeightPct: m.WeightPct,
            IsActive: m.IsActive,
            Band: b.Band,
            MinValue: b.MinValue,
            MaxValue: b.MaxValue,
            Score: b.Score
          });
        });
      });
    });

    // 2. Format Scenarios for Excel (Dim_ScoreMixConfig)
    const scenarioRows = scenarios.map(s => ({
      ScenarioID: s.ScenarioId || '',
      ScenarioName: s.Scenario || '',
      ClaimWeightPct: s.ClaimWeightPct,
      PolicyWeightPct: s.PolicyWeightPct,
      CreatedBy: s.CreatedBy || 'System',
      CreatedOn: s.CreatedOn || '2026-05-19',
      IsActive: s.IsActive
    }));

    // Create a new workbook preserving the requests sheet if it exists
    let wb = xlsx.utils.book_new();
    let wsRequests = null;
    if (fs.existsSync(EXCEL_FILE_PATH)) {
      try {
        const oldWb = xlsx.readFile(EXCEL_FILE_PATH);
        if (oldWb.SheetNames.includes('Dim_SignalRequests')) {
          wsRequests = oldWb.Sheets['Dim_SignalRequests'];
        }
      } catch (err) {
        console.log('[Excel] Could not read existing workbook, creating a fresh one.', err);
      }
    }

    // Create worksheets
    const wsMarkers = xlsx.utils.json_to_sheet(markerRows);
    const wsScenarios = xlsx.utils.json_to_sheet(scenarioRows);

    // Append sheets to workbook
    xlsx.utils.book_append_sheet(wb, wsMarkers, 'Dim_MarkerScoringConfig');
    xlsx.utils.book_append_sheet(wb, wsScenarios, 'Dim_ScoreMixConfig');
    if (wsRequests) {
      xlsx.utils.book_append_sheet(wb, wsRequests, 'Dim_SignalRequests');
    }

    // Write to file
    xlsx.writeFile(wb, EXCEL_FILE_PATH);

    // Trigger Power BI Dataset refresh
    const powerBiStatus = await triggerPowerBiRefresh();

    res.status(200).json({ 
      success: true, 
      message: 'Configuration successfully published to Excel.', 
      path: EXCEL_FILE_PATH,
      powerBiStatus
    });
  } catch (error) {
    console.error('Error saving to Excel:', error);
    res.status(500).json({ success: false, message: 'Failed to write to Excel file.', error: error.message });
  }
});

const REQUESTS_FILE_PATH = path.join(__dirname, 'signal_requests.json');

// Helper to compile a highly tailored technical spec if python or credentials aren't set
const getMockLlmResponse = (body) => {
  const { question, area, areaOthers, eventConcerning, timingThreshold, riskContent, desiredOutput } = body;
  
  let recommendedTable = 'factaccountinghistory';
  let sqlLogic = 'SELECT * FROM factaccountinghistory WHERE ...';
  let daxMeasure = 'FraudScoreMeasure = ...';
  
  const qLower = (question || '').toLowerCase();
  const eLower = (eventConcerning || '').toLowerCase();
  const rLower = (riskContent || '').toLowerCase();
  
  if (qLower.includes('beneficiary') || eLower.includes('beneficiary')) {
    recommendedTable = 'factpartynamedata';
    sqlLogic = `SELECT 
  pb.PolicyID, 
  pb.BeneficiaryID, 
  pb.ChangeDate, 
  p.IssueDate, 
  DATEDIFF(day, p.IssueDate, pb.ChangeDate) AS DaysSinceIssue
FROM factpartynamedata pb
JOIN factpolicycontractdata p ON pb.PolicyID = p.PolicyID
WHERE DATEDIFF(day, p.IssueDate, pb.ChangeDate) <= 30;`;
    
    daxMeasure = `EarlyBeneficiaryChangeFlag = 
VAR DaysSinceIssue = DATEDIFF(SELECTEDVALUE(factpolicycontractdata[IssueDate]), SELECTEDVALUE(factpartynamedata[ChangeDate]), DAY)
RETURN IF(DaysSinceIssue <= 30, 1, 0)`;
  } else if (qLower.includes('reversal') || eLower.includes('reversal') || qLower.includes('payment')) {
    recommendedTable = 'factaccountinghistory';
    sqlLogic = `SELECT 
  TransactionID, 
  PolicyID, 
  TransactionAmount, 
  TransactionType, 
  PaymentStatus, 
  TransactionDate
FROM factaccountinghistory
WHERE TransactionType = 'Reversal' 
  AND TransactionAmount > 5000 
  AND PaymentStatus = 'Completed';`;
    
    daxMeasure = `HighValueReversalCount = 
CALCULATE(
  COUNT(factaccountinghistory[TransactionID]),
  factaccountinghistory[TransactionType] = "Reversal",
  factaccountinghistory[TransactionAmount] > 5000
)`;
  } else if (qLower.includes('distance') || qLower.includes('address') || eLower.includes('address')) {
    recommendedTable = 'dimplaces';
    sqlLogic = `SELECT 
  c.CustomerID, 
  c.AddressLine, 
  a.AgentID, 
  a.OfficeLocation,
  GEO_DISTANCE(c.Latitude, c.Longitude, a.Latitude, a.Longitude) as DistanceMiles
FROM dimplaces c
JOIN Dim_Agent a ON c.AgentID = a.AgentID
WHERE GEO_DISTANCE(c.Latitude, c.Longitude, a.Latitude, a.Longitude) > 500;`;
    
    daxMeasure = `AddressDistanceOutlier = 
VAR Dist = [CalculatedDistanceMiles]
RETURN IF(Dist > 500, 1, 0)`;
  } else {
    sqlLogic = `SELECT 
  TransactionID, 
  CustomerID, 
  TransactionAmount, 
  TransactionDate
FROM factaccountinghistory
WHERE TransactionAmount > 10000 
  AND DATEDIFF(month, TransactionDate, GETDATE()) <= 6;`;
    
    daxMeasure = `HighRiskTransactionAlert = 
IF(SUM(factaccountinghistory[TransactionAmount]) > 10000, 1, 0)`;
  }

  return `### Microsoft Fabric Data Agent Technical Specification

Here is the automatically generated technical logic for the requested indicator.

#### 1. Recommended Data Mapping
* **Primary Target Table**: \`${recommendedTable}\`
* **Suggested Attributes**:
  * \`CustomerID\`, \`PolicyID\`
  * \`EventDate\`, \`TransactionType\`
  * \`RiskWeight\`

#### 2. SQL Implementation (Lakehouse Query)
\`\`\`sql
-- Proposed detection logic
${sqlLogic}
\`\`\`

#### 3. Power BI Semantic Model Representation (DAX)
\`\`\`dax
${daxMeasure}
\`\`\`

#### 4. Verification & Unit Test Guidance
* **Positive Test Case**: Input record matching criteria (e.g. within timing window and threshold). Expect Output = \`TRUE\` / \`1\`.
* **Negative Test Case**: Input record outside window. Expect Output = \`FALSE\` / \`0\`.
* **Integration Considerations**: Ensure daily refresh schedule triggers on base table: \`${recommendedTable}\`.
`;
};

// Helper to save all requests to Excel
const saveRequestsToExcel = () => {
  try {
    let list = [];
    if (fs.existsSync(REQUESTS_FILE_PATH)) {
      list = JSON.parse(fs.readFileSync(REQUESTS_FILE_PATH, 'utf8'));
    }
    
    const requestRows = list.map(r => ({
      RequestID: r.id,
      BusinessQuestion: r.question,
      Area: r.area + (r.area === 'Others' ? ` (${r.areaOthers || ''})` : ''),
      EventConcerning: r.eventConcerning,
      TimingThreshold: r.timingThreshold,
      RiskContent: r.riskContent,
      DesiredOutput: r.desiredOutput === 'Fixed Category' ? `Fixed Category: ${r.fixedCategories || ''}` : r.desiredOutput,
      AdditionalDetails: r.additionalDetails,
      ContactName: r.contactName,
      ContactEmail: r.contactEmail,
      Status: r.status,
      SubmittedAt: r.submittedAt,
      FabricTechnicalSpec: r.llmOutput || ''
    }));

    let wb;
    if (fs.existsSync(EXCEL_FILE_PATH)) {
      wb = xlsx.readFile(EXCEL_FILE_PATH);
    } else {
      wb = xlsx.utils.book_new();
    }

    const wsRequests = xlsx.utils.json_to_sheet(requestRows);

    if (wb.SheetNames.includes('Dim_SignalRequests')) {
      wb.Sheets['Dim_SignalRequests'] = wsRequests;
    } else {
      xlsx.utils.book_append_sheet(wb, wsRequests, 'Dim_SignalRequests');
    }

    xlsx.writeFile(wb, EXCEL_FILE_PATH);
    console.log('[Excel] Successfully synced Dim_SignalRequests to Excel.');
  } catch (error) {
    console.error('[Excel] Failed to sync requests to Excel:', error);
  }
};

// Helper to read requests from Excel if file and sheet exist
const readRequestsFromExcel = () => {
  if (!fs.existsSync(EXCEL_FILE_PATH)) {
    return null;
  }
  try {
    const wb = xlsx.readFile(EXCEL_FILE_PATH);
    if (!wb.SheetNames.includes('Dim_SignalRequests')) {
      return null;
    }
    const ws = wb.Sheets['Dim_SignalRequests'];
    const rows = xlsx.utils.sheet_to_json(ws);
    
    // Read the current JSON list to preserve any fields not saved in Excel (like custom email drafts)
    let existingRequestsMap = {};
    if (fs.existsSync(REQUESTS_FILE_PATH)) {
      try {
        const raw = fs.readFileSync(REQUESTS_FILE_PATH, 'utf8');
        const list = JSON.parse(raw);
        list.forEach(req => {
          existingRequestsMap[req.id] = req;
        });
      } catch (err) {
        console.error('[Excel Sync] Could not parse existing json file:', err);
      }
    }

    return rows.map(r => {
      const id = r.RequestID || '';
      const existing = existingRequestsMap[id] || {};
      
      // Reconstruct area and areaOthers from "Area" column
      let area = r.Area || '';
      let areaOthers = '';
      if (area.includes('Others (')) {
        const match = area.match(/Others \(([^)]+)\)/);
        if (match) {
          area = 'Others';
          areaOthers = match[1];
        }
      }

      // Reconstruct desiredOutput and fixedCategories from "DesiredOutput" column
      let desiredOutput = r.DesiredOutput || '';
      let fixedCategories = '';
      if (desiredOutput.startsWith('Fixed Category: ')) {
        fixedCategories = desiredOutput.replace('Fixed Category: ', '');
        desiredOutput = 'Fixed Category';
      }

      // Automatically generate or update the email draft with the Excel-defined status
      const status = r.Status || 'Pending Review';
      let emailDraft = existing.emailDraft;
      if (!emailDraft) {
        emailDraft = {
          from: 'fraud-signal-portal@company.com',
          to: 'ba-review-team@company.com',
          subject: `[REVIEW REQUIRED] New Fraud Signal Proposal - ${id}`,
          body: `Hi Business Analyst Team,\n\nA new Fraud Signal request is marked as ${status}:\n\n- Request ID: ${id}\n- Contact Person: ${r.ContactName || ''}\n- Area: ${area}\n- Business Question: ${r.BusinessQuestion || ''}\n- Status: ${status}`
        };
      } else {
        // If status changed, update subject or body to reflect it
        emailDraft.subject = `[${status.toUpperCase()}] Fraud Signal Proposal - ${id}`;
      }

      return {
        id: id,
        question: r.BusinessQuestion || '',
        area: area,
        areaOthers: areaOthers,
        eventConcerning: r.EventConcerning || '',
        timingThreshold: r.TimingThreshold || '',
        riskContent: r.RiskContent || '',
        desiredOutput: desiredOutput,
        fixedCategories: fixedCategories,
        additionalDetails: r.AdditionalDetails || '',
        contactName: r.ContactName || '',
        contactEmail: r.ContactEmail || '',
        status: status,
        submittedAt: r.SubmittedAt || new Date().toISOString(),
        llmOutput: r.FabricTechnicalSpec || '',
        emailDraft: emailDraft
      };
    });
  } catch (error) {
    console.error('[Excel Sync] Failed to read from Excel:', error);
    return null;
  }
};

app.get('/api/requests', (req, res) => {
  try {
    const excelRequests = readRequestsFromExcel();
    if (excelRequests && excelRequests.length > 0) {
      // Save it to JSON file to keep it synced
      fs.writeFileSync(REQUESTS_FILE_PATH, JSON.stringify(excelRequests, null, 2));
      return res.status(200).json(excelRequests);
    }

    if (!fs.existsSync(REQUESTS_FILE_PATH)) {
      const defaults = [
        {
          id: 'REQ-001',
          question: 'Detect instances where claim payments are routed to a duplicate bank routing or account number within a tight period.',
          area: 'Claims/Benefits',
          areaOthers: '',
          eventConcerning: 'Payment routing or beneficiary change activity',
          timingThreshold: 'Within 30 days of claims submission',
          riskContent: 'Agents or bad actors setting up duplicate payouts to route money to the same account.',
          desiredOutput: 'Alert',
          additionalDetails: 'High priority query.',
          contactName: 'Jane Doe',
          contactEmail: 'jane.doe@company.com',
          status: 'Under Review',
          submittedAt: '2026-05-25T10:00:00Z',
          llmOutput: `### Microsoft Fabric Data Agent Technical Specification

#### 1. Recommended Data Mapping
* **Primary Target Table**: \`factpartynamedata\`

#### 2. SQL Implementation (Lakehouse Query)
\`\`\`sql
SELECT pb.PolicyID, pb.BeneficiaryID, pb.ChangeDate
FROM factpartynamedata pb
JOIN factpolicycontractdata p ON pb.PolicyID = p.PolicyID
WHERE DATEDIFF(day, p.IssueDate, pb.ChangeDate) <= 30;
\`\`\`
`,
          emailDraft: {
            from: 'fabric.agent@company.com',
            to: 'jane.doe@company.com',
            subject: '[BA Review Requested] Fraud Signal Proposal - REQ-001',
            body: "Hi BA Team,\n\nA new Fraud Signal Proposal has been submitted and is ready for your review.\n\nProposal Details:\n- ID: REQ-001\n- Requester: Jane Doe\n- Area: Claims/Benefits\n- Business Question: Detect instances where claim payments are routed to a duplicate bank routing or account number within a tight period."
          }
        }
      ];
      fs.writeFileSync(REQUESTS_FILE_PATH, JSON.stringify(defaults, null, 2));
      saveRequestsToExcel();
      return res.status(200).json(defaults);
    }
    const raw = fs.readFileSync(REQUESTS_FILE_PATH, 'utf8');
    res.status(200).json(JSON.parse(raw));
  } catch (error) {
    console.error('Error reading requests:', error);
    res.status(500).json({ success: false, message: 'Failed to read requests.', error: error.message });
  }
});

app.post('/api/generate-llm', (req, res) => {
  const { question, area, areaOthers, eventConcerning, timingThreshold, riskContent, desiredOutput, fixedCategories, additionalDetails } = req.body;
  
  const promptText = `You are helping a Fraud Marker Studio application. Create a production-oriented fraud marker technical specification using ONLY the configured Fabric Data Agent tables and metadata tables.

Return the answer in this exact structure:
1. Marker Name
2. Business Objective
3. Fraud/Risk Rationale
4. Required Tables
5. Required Columns
6. Join Logic/Grain
7. Marker Logic
8. SQL or Pseudo-SQL
9. Output Fields
10. Confidence Score (0-100)
11. Assumptions
12. Limitations
13. BA/SME Review Recommendation

Rules:
- Use metadata tables first where helpful: meta_column_dictionary, meta_table_catalog, meta_suggested_keys, meta_journey_table_mapping, meta_pdf_table_requirements.
- Use only these business tables if relevant: dimcompanyagents, dimparties, dimplaces, factaccountinghistory, factadvancecommissiondetails, factagentbalances, factagentbonus, factagentdata, factclaimdata, factclaimdetaildata, factclaimdetailhistory, factclaimfollowupdata, factcoverages, factpartynamedata, factpendingpolicydata, factpolicybenefitdata, factpolicybillingoffers, factpolicybillingrecords, factpolicycontractdata, factpolicyevents, factproducts, factproductcoverages.
- Do not invent unavailable columns/tables. If uncertain, mention metadata verification needed.
- A marker is not proof of fraud. Use potential fraud marker/risk indicator language.
- If confidence <80, include verification comments. If confidence <55, state BA/SME review required before production use.
- Include SQL/pseudo-SQL with comments and practical output fields.

Fraud Signal Request:
Business Question: ${question || ''}
Policy/Transaction Area: ${area || ''} ${area === 'Others' ? `(${areaOthers || ''})` : ''}
Event Concerning: ${eventConcerning || ''}
Timing/Threshold: ${timingThreshold || ''}
Risk Content: ${riskContent || ''}
Desired Output: ${desiredOutput || ''} ${desiredOutput === 'Fixed Category' ? `(Categories: ${fixedCategories || ''})` : ''}
Additional Details: ${additionalDetails || ''}`;

  console.log('[Fabric Bridge] Invoking fabric_helper.py...');
  
  const pythonCommand = process.env.PYTHON_COMMAND || (process.platform === 'win32' ? 'python' : 'python3');
  const pythonProcess = spawn(pythonCommand, ['-X', 'utf8',path.join(__dirname, 'fabric_helper.py'), promptText], {
    cwd: __dirname,
    env: { ...process.env, 
           PYTHONUTF8: '1',
           PYTHONIOENCODING: 'utf-8'
    }
  });
  
  let output = '';
  let errorOutput = '';
  
  pythonProcess.stdout.on('data', (data) => {
    output += data.toString();
  });
  
  pythonProcess.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });
  
  pythonProcess.on('close', (code) => {
    if (code === 0 && output.trim()) {
      res.status(200).json({ success: true, spec: output.trim() });
    } else {
      console.log(`[Fabric Bridge] Python exited with code ${code}. Error: ${errorOutput}. Falling back to mock spec.`);
      const mockSpec = getMockLlmResponse(req.body);
      res.status(200).json({ success: true, spec: mockSpec, mocked: true });
    }
  });
});

app.post('/api/requests', (req, res) => {
  try {
    const newRequest = req.body;
    let list = [];
    if (fs.existsSync(REQUESTS_FILE_PATH)) {
      const raw = fs.readFileSync(REQUESTS_FILE_PATH, 'utf8');
      list = JSON.parse(raw);
    }
    const nextNum = list.length + 1;
    const padNum = String(nextNum).padStart(3, '0');
    newRequest.id = `REQ-${padNum}`;
    newRequest.status = 'Pending Review';
    newRequest.submittedAt = new Date().toISOString();
    
    // Auto draft the review email body for backend automation hooks
    const emailDraft = {
      from: 'fraud-signal-portal@company.com',
      to: 'ba-review-team@company.com',
      subject: `[REVIEW REQUIRED] New Fraud Signal Proposal - REQ-${padNum}`,
      body: `Hi Business Analyst Team,

A new Fraud Signal request has been submitted for review:

- Request ID: REQ-${padNum}
- Contact Person: ${newRequest.contactName} (${newRequest.contactEmail})
- Area: ${newRequest.area} ${newRequest.area === 'Others' ? `(${newRequest.areaOthers || ''})` : ''}
- Business Question: ${newRequest.question}
- Event Concerning: ${newRequest.eventConcerning}
- Timing/Threshold: ${newRequest.timingThreshold}
- Risk Content: ${newRequest.riskContent}
- Desired Output: ${newRequest.desiredOutput}
- Additional Details: ${newRequest.additionalDetails || 'N/A'}

==================================================
MICROSOFT FABRIC DATA AGENT TECHNICAL SPECIFICATION
==================================================
${newRequest.llmOutput || 'No technical specification generated.'}

Please review and publish this signal configuration to staging.
`
    };
    newRequest.emailDraft = emailDraft;
    
    list.unshift(newRequest);
    fs.writeFileSync(REQUESTS_FILE_PATH, JSON.stringify(list, null, 2));
    
    // Sync to Excel
    saveRequestsToExcel();
    
    // Append to email log for backend mailers to fetch
    const mailLogPath = path.join(__dirname, 'mail_log.txt');
    const mailLogEntry = `\n\n========================================\nDATE: ${new Date().toISOString()}\nTO: ${emailDraft.to}\nSUBJECT: ${emailDraft.subject}\n\n${emailDraft.body}\n========================================`;
    fs.appendFileSync(mailLogPath, mailLogEntry, 'utf8');
    
    res.status(200).json({ success: true, request: newRequest });
  } catch (error) {
    console.error('Error saving request:', error);
    res.status(500).json({ success: false, message: 'Failed to save request.', error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
  console.log(`Excel files will be saved to: ${EXCEL_FILE_PATH}`);
});
