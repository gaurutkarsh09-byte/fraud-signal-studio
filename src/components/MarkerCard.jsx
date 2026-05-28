import React from 'react';
import ThresholdSlider from './ThresholdSlider';

const MarkerCard = ({ marker, onUpdate, isPercentageMode }) => {
  const toggleActive = () => {
    onUpdate({ ...marker, IsActive: marker.IsActive ? 0 : 1 });
  };

  const handleBandsUpdate = (updatedBands) => {
    onUpdate({ ...marker, bands: updatedBands });
  };

  const handleWeightChange = (e) => {
    const val = parseInt(e.target.value) || 0;
    onUpdate({ ...marker, WeightPct: val });
  };

  return (
    <div className="marker-card">
      <div className="card-header">
        <div>
          <div className="card-title">{marker.MarkerName}</div>
          <div className="badge-group" style={{ alignItems: 'center' }}>
            <span className="badge">{marker.Scope}</span>
            <div className="badge" style={{ background: '#334155', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Wt 
              <input 
                type="number" 
                value={marker.WeightPct} 
                onChange={handleWeightChange}
                style={{
                  width: '45px', // increased width
                  background: 'transparent', 
                  border: '1px solid rgba(255,255,255,0.3)', 
                  color: 'white', 
                  borderRadius: '4px',
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  padding: '2px'
                }}
              />
              %
            </div>
          </div>
        </div>
        <label className="toggle-switch">
          <input 
            type="checkbox" 
            checked={marker.IsActive === 1} 
            onChange={toggleActive} 
          />
          <span className="slider"></span>
        </label>
      </div>

      <ThresholdSlider 
        bands={marker.bands} 
        onBandsUpdate={handleBandsUpdate} 
        isPercentageMode={isPercentageMode}
      />
    </div>
  );
};

export default MarkerCard;
