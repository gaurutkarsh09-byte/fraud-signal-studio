// Data based on Dim_ScoreMixConfig
export const scenarios = [
  { ScenarioId: 'SCEN-001', Scenario: 'Base (70/30)', ClaimWeightPct: 70, PolicyWeightPct: 30, CreatedBy: 'System', CreatedOn: '2026-05-19', IsActive: 1 },
  { ScenarioId: 'SCEN-002', Scenario: 'PolicyHeavy', ClaimWeightPct: 60, PolicyWeightPct: 40, CreatedBy: 'System', CreatedOn: '2026-05-20', IsActive: 0 }
];

const lowMedHighBands = [
  { Band: 'Low', MinValue: 0, MaxValue: 1, Score: 0 },
  { Band: 'Medium', MinValue: 2, MaxValue: 3, Score: 2 },
  { Band: 'High', MinValue: 4, MaxValue: 999999, Score: 5 }
];

const lowHighBands = [
  { Band: 'Low', MinValue: 0, MaxValue: 0, Score: 0 },
  { Band: 'High', MinValue: 1, MaxValue: 999999, Score: 5 }
];

// Data grouped from Dim_MarkerScoringConfig
export const initialMarkers = [
  // --- CLAIMS MARKERS (10) - All must have Low, Medium, and High bands ---
  {
    MarkerName: 'Beneficiary Change Clustering Risk Band',
    Scope: 'Claim',
    WeightPct: 16,
    IsActive: 1,
    bands: JSON.parse(JSON.stringify(lowMedHighBands))
  },
  {
    MarkerName: 'Beneficiary Change Frequency Risk Band',
    Scope: 'Claim',
    WeightPct: 8,
    IsActive: 1,
    bands: JSON.parse(JSON.stringify(lowMedHighBands))
  },
  {
    MarkerName: 'Beneficiary Change Recency Risk Band',
    Scope: 'Claim',
    WeightPct: 5,
    IsActive: 1,
    bands: JSON.parse(JSON.stringify(lowMedHighBands))
  },
  {
    MarkerName: 'Coverage Change-to-Loss Risk Band',
    Scope: 'Claim',
    WeightPct: 13,
    IsActive: 1,
    bands: JSON.parse(JSON.stringify(lowMedHighBands))
  },
  {
    MarkerName: 'Elderly / Complex Riders / Suspicious Beneficiary Flag',
    Scope: 'Claim',
    WeightPct: 4,
    IsActive: 1,
    bands: JSON.parse(JSON.stringify(lowMedHighBands))
  },
  {
    MarkerName: 'Issue-to-Loss Timing Risk Band',
    Scope: 'Claim',
    WeightPct: 14,
    IsActive: 1,
    bands: JSON.parse(JSON.stringify(lowMedHighBands))
  },
  {
    MarkerName: 'Reporting Lag Risk Band',
    Scope: 'Claim',
    WeightPct: 12,
    IsActive: 1,
    bands: JSON.parse(JSON.stringify(lowMedHighBands))
  },
  {
    MarkerName: 'Unendorsed Bank Account Change Flag',
    Scope: 'Claim',
    WeightPct: 10,
    IsActive: 1,
    bands: JSON.parse(JSON.stringify(lowMedHighBands))
  },
  {
    MarkerName: 'Weak Beneficiary Relationship Flag',
    Scope: 'Claim',
    WeightPct: 10,
    IsActive: 1,
    bands: JSON.parse(JSON.stringify(lowMedHighBands))
  },
  {
    MarkerName: 'Address change before withdrawl',
    Scope: 'Claim',
    WeightPct: 8,
    IsActive: 1,
    bands: JSON.parse(JSON.stringify(lowMedHighBands))
  },

  // --- POLICY MARKERS (26) ---
  // Policy Flags (Low, High bands)
  {
    MarkerName: 'AdverseReversalCodeFlag',
    Scope: 'Policy',
    WeightPct: 4,
    IsActive: 1,
    bands: JSON.parse(JSON.stringify(lowHighBands))
  },
  {
    MarkerName: 'AgentRegionMismatchFlag',
    Scope: 'Policy',
    WeightPct: 4,
    IsActive: 1,
    bands: JSON.parse(JSON.stringify(lowHighBands))
  },
  {
    MarkerName: 'BestInterestFormMissingFlag',
    Scope: 'Policy',
    WeightPct: 4,
    IsActive: 1,
    bands: JSON.parse(JSON.stringify(lowHighBands))
  },
  {
    MarkerName: 'BestInterestInconsistencyFlag',
    Scope: 'Policy',
    WeightPct: 4,
    IsActive: 1,
    bands: JSON.parse(JSON.stringify(lowHighBands))
  },
  {
    MarkerName: 'EarlySurrenderFlag',
    Scope: 'Policy',
    WeightPct: 4,
    IsActive: 1,
    bands: JSON.parse(JSON.stringify(lowHighBands))
  },
  {
    MarkerName: 'HighRiskBeneficiaryFlag',
    Scope: 'Policy',
    WeightPct: 4,
    IsActive: 1,
    bands: JSON.parse(JSON.stringify(lowHighBands))
  },
  {
    MarkerName: 'MaterialChangeFlag',
    Scope: 'Policy',
    WeightPct: 4,
    IsActive: 1,
    bands: JSON.parse(JSON.stringify(lowHighBands))
  },
  {
    MarkerName: 'MultiPolicyPACFailFlag',
    Scope: 'Policy',
    WeightPct: 4,
    IsActive: 1,
    bands: JSON.parse(JSON.stringify(lowHighBands))
  },
  {
    MarkerName: 'NSFReversalPatternFlag',
    Scope: 'Policy',
    WeightPct: 4,
    IsActive: 1,
    bands: JSON.parse(JSON.stringify(lowHighBands))
  },
  {
    MarkerName: 'SharedInstrumentHighRiskFlag',
    Scope: 'Policy',
    WeightPct: 4,
    IsActive: 1,
    bands: JSON.parse(JSON.stringify(lowHighBands))
  },
  {
    MarkerName: 'SmokerStatusDowngradeFlag',
    Scope: 'Policy',
    WeightPct: 4,
    IsActive: 1,
    bands: JSON.parse(JSON.stringify(lowHighBands))
  },
  {
    MarkerName: 'SplitRolesFlag',
    Scope: 'Policy',
    WeightPct: 4,
    IsActive: 1,
    bands: JSON.parse(JSON.stringify(lowHighBands))
  },
  {
    MarkerName: 'SuitabilityElapsedTimeShortFlag',
    Scope: 'Policy',
    WeightPct: 4,
    IsActive: 1,
    bands: JSON.parse(JSON.stringify(lowHighBands))
  },
  {
    MarkerName: 'SuitabilityNIGOBypassFlag',
    Scope: 'Policy',
    WeightPct: 4,
    IsActive: 1,
    bands: JSON.parse(JSON.stringify(lowHighBands))
  },
  {
    MarkerName: 'ThirdPartyPayorFlag',
    Scope: 'Policy',
    WeightPct: 4,
    IsActive: 1,
    bands: JSON.parse(JSON.stringify(lowHighBands))
  },

  // Policy Counts (Low, Medium, High bands)
  {
    MarkerName: 'EarlyBeneficiaryChangeCount',
    Scope: 'Policy',
    WeightPct: 4,
    IsActive: 1,
    bands: JSON.parse(JSON.stringify(lowMedHighBands))
  },
  {
    MarkerName: 'EarlyEndorsementCount',
    Scope: 'Policy',
    WeightPct: 4,
    IsActive: 1,
    bands: JSON.parse(JSON.stringify(lowMedHighBands))
  },
  {
    MarkerName: 'PACFailCount',
    Scope: 'Policy',
    WeightPct: 4,
    IsActive: 1,
    bands: JSON.parse(JSON.stringify(lowMedHighBands))
  },
  {
    MarkerName: 'SharedPaymentInstrumentCount',
    Scope: 'Policy',
    WeightPct: 4,
    IsActive: 1,
    bands: JSON.parse(JSON.stringify(lowMedHighBands))
  },

  // Policy Rates, Frequencies, etc. (Low, Medium, High bands)
  {
    MarkerName: 'AdverseReversalRate',
    Scope: 'Policy',
    WeightPct: 4,
    IsActive: 1,
    bands: JSON.parse(JSON.stringify(lowMedHighBands))
  },
  {
    MarkerName: 'HighValueLoanFrequency',
    Scope: 'Policy',
    WeightPct: 4,
    IsActive: 1,
    bands: JSON.parse(JSON.stringify(lowMedHighBands))
  },
  {
    MarkerName: 'PremiumReversalFrequency',
    Scope: 'Policy',
    WeightPct: 4,
    IsActive: 1,
    bands: JSON.parse(JSON.stringify(lowMedHighBands))
  },

  // Retained Old Policy Markers (Not in table, but requested to keep old ones)
  // Lapse immediately before/after claim (Flag -> Low/High)
  {
    MarkerName: 'Lapse immediately before/after claim',
    Scope: 'Policy',
    WeightPct: 3,
    IsActive: 1,
    bands: JSON.parse(JSON.stringify(lowHighBands))
  },
  // Unsecured advances to agents (Low/Med/High)
  {
    MarkerName: 'Unsecured advances to agents',
    Scope: 'Policy',
    WeightPct: 3,
    IsActive: 1,
    bands: JSON.parse(JSON.stringify(lowMedHighBands))
  },
  // Agent attrition / declining sales (Low/Med/High)
  {
    MarkerName: 'Agent attrition / declining sales',
    Scope: 'Policy',
    WeightPct: 3,
    IsActive: 1,
    bands: JSON.parse(JSON.stringify(lowMedHighBands))
  },
  // Payee relationship & resident mismatch (Flag -> Low/High)
  {
    MarkerName: 'Payee relationship & resident mismatch',
    Scope: 'Policy',
    WeightPct: 3,
    IsActive: 1,
    bands: JSON.parse(JSON.stringify(lowHighBands))
  }
];
