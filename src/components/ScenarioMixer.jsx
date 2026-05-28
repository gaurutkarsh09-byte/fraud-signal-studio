import React from 'react';
import { initialMarkers } from '../data/mockData';

const ScenarioMixer = ({ scenariosList, setScenariosList, currentUser }) => {
  const handleAdd = () => {
    // Generate a unique Scenario ID
    const nextNum = scenariosList.length + 1;
    const scenarioId = `SCEN-${String(nextNum).padStart(3, '0')}`;
    const scenarioName = `Custom Config ${nextNum}`;
    
    // Deep copy default markers to this scenario so it acts as an independent template
    const scenarioMarkers = JSON.parse(JSON.stringify(initialMarkers));

    const newScenario = {
      ScenarioId: scenarioId,
      Scenario: scenarioName,
      ClaimWeightPct: 50,
      PolicyWeightPct: 50,
      CreatedBy: currentUser || 'System',
      CreatedOn: new Date().toISOString().split('T')[0],
      IsActive: 0,
      markers: scenarioMarkers
    };

    setScenariosList([...scenariosList, newScenario]);
  };

  const handleUpdate = (index, field, value) => {
    const updated = [...scenariosList];
    updated[index][field] = value;
    setScenariosList(updated);
  };

  const handleToggleActive = (index) => {
    // Exactly one scenario can be active at a time
    const updated = scenariosList.map((s, idx) => ({
      ...s,
      IsActive: idx === index ? 1 : 0
    }));
    setScenariosList(updated);
  };

  const handleDelete = (index) => {
    if (scenariosList.length <= 1) {
      alert("Cannot delete the only remaining scenario configuration.");
      return;
    }
    const target = scenariosList[index];
    if (target.CreatedBy === 'System') {
      const confirmDelete = window.confirm("This is a System baseline configuration. Are you sure you want to remove it?");
      if (!confirmDelete) return;
    }
    setScenariosList(scenariosList.filter((_, i) => i !== index));
  };

  return (
    <div style={{ padding: '2rem 3rem', flex: 1, background: 'var(--bg-color)', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', maxWidth: '1100px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--secondary-accent)' }}>Scenario Summary</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
            Manage risk scoring templates, blend indicators, and configure active operational profiles.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleAdd} style={{ padding: '0.65rem 1.5rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
          <span>+</span> Add New Scenario
        </button>
      </div>

      <div className="panel-card" style={{ maxWidth: '1100px', padding: '0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border-color)' }}>
              <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', width: '120px' }}>ID</th>
              <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Scenario Name</th>
              <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', width: '130px' }}>Claim Wt %</th>
              <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', width: '130px' }}>Policy Wt %</th>
              <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', width: '150px' }}>Created By</th>
              <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', width: '120px' }}>Created On</th>
              <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', width: '100px', textAlign: 'center' }}>Active</th>
              <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', width: '100px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {scenariosList.map((s, idx) => {
              const isSystem = s.CreatedBy === 'System';
              return (
                <tr key={s.ScenarioId || idx} className="mixer-row" style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.15s' }}>
                  {/* ID */}
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ 
                      background: s.IsActive === 1 ? '#e0f2fe' : '#f1f5f9', 
                      color: s.IsActive === 1 ? '#0369a1' : '#64748b', 
                      padding: '4px 10px', 
                      borderRadius: '12px', 
                      fontSize: '0.75rem', 
                      fontWeight: 700 
                    }}>
                      {s.ScenarioId || `SCEN-${String(idx+1).padStart(3, '0')}`}
                    </span>
                  </td>
                  
                  {/* Scenario Name */}
                  <td style={{ padding: '16px 20px' }}>
                    <input 
                      type="text" 
                      value={s.Scenario} 
                      onChange={e => handleUpdate(idx, 'Scenario', e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '6px 12px', 
                        borderRadius: '6px', 
                        border: '1px solid var(--border-color)', 
                        background: 'transparent',
                        outline: 'none',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--primary-accent)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                    />
                  </td>

                  {/* Claim Wt % */}
                  <td style={{ padding: '16px 20px' }}>
                    <input 
                      type="number" 
                      min="0"
                      max="100"
                      value={s.ClaimWeightPct} 
                      onChange={e => handleUpdate(idx, 'ClaimWeightPct', parseInt(e.target.value) || 0)}
                      style={{ 
                        width: '80px', 
                        padding: '6px 10px', 
                        borderRadius: '6px', 
                        border: '1px solid var(--border-color)', 
                        outline: 'none',
                        textAlign: 'center',
                        color: 'var(--text-main)',
                        background: 'transparent'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--primary-accent)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                    />
                  </td>

                  {/* Policy Wt % */}
                  <td style={{ padding: '16px 20px' }}>
                    <input 
                      type="number" 
                      min="0"
                      max="100"
                      value={s.PolicyWeightPct} 
                      onChange={e => handleUpdate(idx, 'PolicyWeightPct', parseInt(e.target.value) || 0)}
                      style={{ 
                        width: '80px', 
                        padding: '6px 10px', 
                        borderRadius: '6px', 
                        border: '1px solid var(--border-color)', 
                        outline: 'none',
                        textAlign: 'center',
                        color: 'var(--text-main)',
                        background: 'transparent'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--primary-accent)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                    />
                  </td>

                  {/* Created By */}
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ 
                      background: isSystem ? '#f1f5f9' : '#f3e8ff', 
                      color: isSystem ? '#475569' : '#7e22ce', 
                      padding: '4px 10px', 
                      borderRadius: '12px', 
                      fontSize: '0.75rem', 
                      fontWeight: 600 
                    }}>
                      {s.CreatedBy || 'System'}
                    </span>
                  </td>

                  {/* Created On */}
                  <td style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {s.CreatedOn || '2026-05-19'}
                  </td>

                  {/* Active Toggle */}
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={s.IsActive === 1} 
                        onChange={() => handleToggleActive(idx)} 
                      />
                      <span className="slider"></span>
                    </label>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    <button 
                      onClick={() => handleDelete(idx)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#ef4444', 
                        cursor: 'pointer', 
                        fontSize: '0.85rem', 
                        fontWeight: 600,
                        padding: '4px 8px',
                        borderRadius: '4px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#fee2e2'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScenarioMixer;
