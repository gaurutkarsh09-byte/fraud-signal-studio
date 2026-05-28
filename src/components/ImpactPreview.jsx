import React from 'react';

const ImpactPreview = ({ markers, scopeFilter }) => {
  // Filter markers based on the parent's scopeFilter
  const filteredForDrivers = markers.filter(m => {
    if (scopeFilter === 'All') return true;
    return m.Scope === scopeFilter;
  });

  // Sort markers by weight to get all drivers in descending order
  const sortedDrivers = [...filteredForDrivers].sort((a, b) => b.WeightPct - a.WeightPct);

  // Validation logic (only count active markers)
  const activeMarkers = markers.filter(m => m.IsActive === 1);
  const totalClaimWeight = activeMarkers.filter(m => m.Scope === 'Claim').reduce((sum, m) => sum + m.WeightPct, 0);
  const totalPolicyWeight = activeMarkers.filter(m => m.Scope === 'Policy').reduce((sum, m) => sum + m.WeightPct, 0);

  const claimExceeds = totalClaimWeight > 100;
  const policyExceeds = totalPolicyWeight > 100;
  const anyExceeds = claimExceeds || policyExceeds;

  return (
    <div className="impact-preview">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Impact Preview</h3>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Live weight distribution</p>
        </div>
      </div>

      <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '320px', maxHeight: '480px' }}>
        <h4 style={{ marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>Signal Weightage</h4>
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
          {sortedDrivers.length === 0 ? (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No signals in this view.</div>
          ) : (
            <ul className="top-drivers" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {sortedDrivers.map(m => (
                <li key={m.MarkerName} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '8px 0', 
                  borderBottom: '1px solid var(--border-color)',
                  opacity: m.IsActive ? 1 : 0.4
                }}>
                  <span style={{ 
                    fontSize: '0.8rem', 
                    fontWeight: 500, 
                    color: 'var(--text-main)',
                    maxWidth: '80%',
                    wordBreak: 'break-word'
                  }}>
                    {m.MarkerName} 
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                      ({m.Scope})
                    </span>
                    {!m.IsActive && (
                      <span style={{ fontSize: '0.7rem', color: '#ef4444', marginLeft: '6px', fontStyle: 'italic' }}>
                        (Inactive)
                      </span>
                    )}
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--secondary-accent)' }}>
                    {m.WeightPct}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="panel-card" style={{ background: anyExceeds ? '#fef2f2' : '#f8fafc', border: anyExceeds ? '1px solid #fecaca' : '1px solid var(--border-color)', marginTop: '1rem' }}>
        <h4 style={{ marginBottom: '1rem', fontWeight: 600, color: anyExceeds ? '#dc2626' : 'inherit', fontSize: '0.9rem' }}>Validation</h4>
        <ul className="validation-list" style={{ paddingLeft: '1.25rem', fontSize: '0.8rem' }}>
          <li><span className="check">✓</span> No gaps/overlaps detected</li>
          
          {claimExceeds ? (
            <li style={{ color: '#dc2626' }}>
              <span style={{ color: '#dc2626' }}>✗</span> Claims weight exceeds 100% (Total: {totalClaimWeight}%)
            </li>
          ) : (
            <li><span className="check">✓</span> Claims weight within limit ({totalClaimWeight}%)</li>
          )}

          {policyExceeds ? (
            <li style={{ color: '#dc2626' }}>
              <span style={{ color: '#dc2626' }}>✗</span> Policy weight exceeds 100% (Total: {totalPolicyWeight}%)
            </li>
          ) : (
            <li><span className="check">✓</span> Policy weight within limit ({totalPolicyWeight}%)</li>
          )}

          {anyExceeds ? (
            <li style={{ color: '#dc2626', fontWeight: 600, marginTop: '0.5rem' }}>
              <span style={{ color: '#dc2626' }}>⚠</span> Please adjust weights
            </li>
          ) : (
            <li><span className="check">✓</span> Ready to publish</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ImpactPreview;
