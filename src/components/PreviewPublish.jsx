import React, { useState } from 'react';
import { initialMarkers, scenarios as initialScenarios } from '../data/mockData';

const PreviewPublish = ({ markers, scenariosList, onClose, onSuccess }) => {

  const getAuditReport = () => {
    const reports = [];

    // 1. Audit Current Scenarios (Modified or Added)
    scenariosList.forEach(currentScenario => {
      const origScenario = initialScenarios.find(s => s.ScenarioId === currentScenario.ScenarioId);
      
      if (!origScenario) {
        // Newly added scenario
        reports.push({
          ScenarioId: currentScenario.ScenarioId,
          ScenarioName: currentScenario.Scenario,
          CreatedBy: currentScenario.CreatedBy,
          CreatedOn: currentScenario.CreatedOn,
          type: 'added',
          highLevelChanges: [
            `Initial Claim Weight: ${currentScenario.ClaimWeightPct}%`,
            `Initial Policy Weight: ${currentScenario.PolicyWeightPct}%`,
            `Active Status: ${currentScenario.IsActive === 1 ? 'Yes' : 'No'}`
          ],
          markerChanges: [] // Markers are in their baseline state, no diffs needed
        });
        return;
      }

      // Existing scenario: Calculate high-level changes
      const highLevelChanges = [];
      if (origScenario.Scenario !== currentScenario.Scenario) {
        highLevelChanges.push(`Renamed: "${origScenario.Scenario}" ➔ "${currentScenario.Scenario}"`);
      }
      if (origScenario.ClaimWeightPct !== currentScenario.ClaimWeightPct) {
        highLevelChanges.push(`Claim Weight: ${origScenario.ClaimWeightPct}% ➔ ${currentScenario.ClaimWeightPct}%`);
      }
      if (origScenario.PolicyWeightPct !== currentScenario.PolicyWeightPct) {
        highLevelChanges.push(`Policy Weight: ${origScenario.PolicyWeightPct}% ➔ ${currentScenario.PolicyWeightPct}%`);
      }
      if (origScenario.IsActive !== currentScenario.IsActive) {
        highLevelChanges.push(`Active Status: ${origScenario.IsActive === 1 ? 'Active' : 'Inactive'} ➔ ${currentScenario.IsActive === 1 ? 'Active' : 'Inactive'}`);
      }

      // Calculate internal marker changes for this scenario
      const markerChanges = [];
      const scenarioMarkers = currentScenario.markers || [];
      
      scenarioMarkers.forEach(currentMarker => {
        const originalMarker = initialMarkers.find(m => m.MarkerName === currentMarker.MarkerName);
        if (!originalMarker) return; // Baseline static markers match by name

        const diffs = [];
        if (originalMarker.WeightPct !== currentMarker.WeightPct) {
          diffs.push(`Weight: ${originalMarker.WeightPct}% ➔ ${currentMarker.WeightPct}%`);
        }
        if (originalMarker.IsActive !== currentMarker.IsActive) {
          diffs.push(`Active: ${originalMarker.IsActive === 1 ? 'Yes' : 'No'} ➔ ${currentMarker.IsActive === 1 ? 'Yes' : 'No'}`);
        }

        // Compare bands
        currentMarker.bands.forEach((currentBand, bIdx) => {
          const origBand = originalMarker.bands[bIdx];
          if (origBand) {
            if (origBand.MinValue !== currentBand.MinValue || origBand.MaxValue !== currentBand.MaxValue) {
              diffs.push(`Band ${currentBand.Band} Range: ${origBand.MinValue}-${origBand.MaxValue} ➔ ${currentBand.MinValue}-${currentBand.MaxValue}`);
            }
            if (origBand.Score !== currentBand.Score) {
              diffs.push(`Band ${currentBand.Band} Score: ${origBand.Score} ➔ ${currentBand.Score}`);
            }
          }
        });

        if (diffs.length > 0) {
          markerChanges.push({
            name: currentMarker.MarkerName,
            diffs: diffs
          });
        }
      });

      if (highLevelChanges.length > 0 || markerChanges.length > 0) {
        reports.push({
          ScenarioId: currentScenario.ScenarioId,
          ScenarioName: currentScenario.Scenario,
          CreatedBy: currentScenario.CreatedBy,
          CreatedOn: currentScenario.CreatedOn,
          type: 'modified',
          highLevelChanges,
          markerChanges
        });
      }
    });

    // 2. Audit Deleted Scenarios
    initialScenarios.forEach(orig => {
      if (!scenariosList.find(s => s.ScenarioId === orig.ScenarioId)) {
        reports.push({
          ScenarioId: orig.ScenarioId,
          ScenarioName: orig.Scenario,
          CreatedBy: orig.CreatedBy,
          type: 'deleted',
          highLevelChanges: [`Scenario Template Deleted`],
          markerChanges: []
        });
      }
    });

    return reports;
  };

  const auditReports = getAuditReport();
  const hasChanges = auditReports.length > 0;
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const response = await fetch('http://localhost:3001/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markers, scenarios: scenariosList })
      });
      const result = await response.json();
      if (result.success) {
        let msg = "Configuration published successfully!\n\nFile saved to: " + result.path;
        if (result.powerBiStatus) {
          msg += "\n\nPower BI Status: " + result.powerBiStatus.message;
        }
        alert(msg);
        if (onSuccess) onSuccess();
      } else {
        alert("Error publishing: " + result.message);
      }
    } catch (error) {
      alert("Failed to connect to backend server.\n\nPlease make sure you started the backend server with 'npm start' in the server folder.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div style={{ padding: onClose ? '1rem 0' : '2rem 3rem', flex: 1, background: 'var(--bg-color)', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', maxWidth: '1000px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--secondary-accent)' }}>Review & Publish</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
            Inspect scenario template updates, fraud signal details, and trigger baseline synchronization.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {onClose && (
            <button 
              className="btn btn-secondary" 
              onClick={onClose}
              style={{ 
                padding: '0.75rem 2rem',
                fontSize: '0.95rem'
              }}
            >
              Cancel
            </button>
          )}
          <button 
            className="btn btn-primary" 
            onClick={handlePublish}
            disabled={!hasChanges || isPublishing}
            style={{ 
              opacity: hasChanges && !isPublishing ? 1 : 0.5, 
              cursor: hasChanges && !isPublishing ? 'pointer' : 'not-allowed', 
              padding: '0.75rem 2rem',
              fontSize: '0.95rem'
            }}
          >
            {isPublishing ? "Publishing..." : "Confirm & Publish to Excel"}
          </button>
        </div>
      </div>

      {!hasChanges ? (
        <div style={{ background: 'white', padding: '4rem 2rem', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-color)', color: 'var(--text-muted)', maxWidth: '1000px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <h3 style={{ marginBottom: '0.5rem', fontWeight: 600, color: 'var(--secondary-accent)' }}>No Changes Detected</h3>
          <p style={{ marginBottom: '1.5rem' }}>All scenario configurations and indicator thresholds perfectly match the current baseline files.</p>
          {onClose && (
            <button className="btn btn-secondary" onClick={onClose} style={{ padding: '0.6rem 1.5rem' }}>Close</button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1000px' }}>
          {auditReports.map((report, idx) => {
            const isAdded = report.type === 'added';
            const isDeleted = report.type === 'deleted';
            
            let borderColor = 'var(--primary-accent)';
            let typeBadge = 'Modified';
            let badgeBg = '#fef3c7';
            let badgeText = '#d97706';

            if (isAdded) {
              borderColor = '#10b981';
              typeBadge = 'New Template';
              badgeBg = '#d1fae5';
              badgeText = '#065f46';
            } else if (isDeleted) {
              borderColor = '#ef4444';
              typeBadge = 'Deleted';
              badgeBg = '#fee2e2';
              badgeText = '#991b1b';
            }

            return (
              <div 
                key={report.ScenarioId || idx} 
                className="panel-card" 
                style={{ 
                  borderLeft: `5px solid ${borderColor}`,
                  padding: '1.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.8rem', background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                      {report.ScenarioId}
                    </span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--secondary-accent)' }}>
                      {report.ScenarioName}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '12px', background: badgeBg, color: badgeText, fontWeight: 700, textTransform: 'uppercase' }}>
                      {typeBadge}
                    </span>
                    <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '12px', background: '#f1f5f9', color: '#475569', fontWeight: 600 }}>
                      By: {report.CreatedBy}
                    </span>
                  </div>
                </div>

                {/* High-level config changes */}
                {report.highLevelChanges.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h5 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 700 }}>Mix Properties</h5>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {report.highLevelChanges.map((change, i) => (
                        <li key={i} style={{ fontSize: '0.85rem', color: isDeleted ? '#ef4444' : 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: borderColor }}>•</span> {change}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Nested Marker Diffs */}
                {report.markerChanges.length > 0 && (
                  <div>
                    <h5 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 700 }}>Indicator Threshold & Weight Adjustments</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                      {report.markerChanges.map((marker, mIdx) => (
                        <div key={mIdx} style={{ padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--secondary-accent)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {marker.name}
                          </div>
                          <ul style={{ listStyle: 'none', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            {marker.diffs.map((d, dIdx) => (
                              <li key={dIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                                <span style={{ color: 'var(--primary-accent)' }}>›</span>
                                <span>{d}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PreviewPublish;
