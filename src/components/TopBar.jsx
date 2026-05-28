import React from 'react';

const TopBar = ({ 
  scenarios, 
  activeScenario, 
  setActiveScenario, 
  searchQuery, 
  setSearchQuery, 
  onSave, 
  onPublish, 
  isPercentageMode, 
  setIsPercentageMode,
  currentUser,
  setCurrentUser
}) => {
  // Filter scenarios to only show ones created by current user or by 'System'
  const filteredScenarios = scenarios.filter(s => s.CreatedBy === currentUser || s.CreatedBy === 'System');

  return (
    <div className="topbar">
      <div className="topbar-left">
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Scenario:</span>
        <select 
          className="scenario-select"
          value={activeScenario?.Scenario || ''}
          onChange={(e) => {
            const selected = scenarios.find(s => s.Scenario === e.target.value);
            if(selected) setActiveScenario(selected);
          }}
        >
          {filteredScenarios.map(s => (
            <option key={s.ScenarioId} value={s.Scenario}>
              {s.Scenario}
            </option>
          ))}
        </select>
        <button className="btn btn-secondary" onClick={onSave}>Save Draft</button>
        <button className="btn btn-primary" onClick={onPublish}>Preview & Publish</button>
      </div>
      <div className="topbar-right">
        {/* User switching badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', padding: '0.35rem 0.85rem', borderRadius: '9999px', border: '1px solid var(--border-color)', marginRight: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Logged in:</span>
          <select 
            value={currentUser} 
            onChange={(e) => setCurrentUser(e.target.value)} 
            style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary-accent)', cursor: 'pointer', paddingRight: '4px' }}
          >
            <option value="System">System Admin</option>
            <option value="John Doe">John Doe (Analyst)</option>
            <option value="Jane Smith">Jane Smith (Manager)</option>
          </select>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer', marginRight: '0.5rem' }}>
          <input 
            type="checkbox" 
            checked={isPercentageMode} 
            onChange={(e) => setIsPercentageMode(e.target.checked)} 
          />
          View as %
        </label>
        <input 
          type="text" 
          placeholder="Search signals..." 
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  );
};

export default TopBar;
