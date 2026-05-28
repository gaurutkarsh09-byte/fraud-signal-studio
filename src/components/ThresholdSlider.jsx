import React from 'react';

const ThresholdSlider = ({ bands, onBandsUpdate, isPercentageMode }) => {
  const lowBand = bands.find(b => b.Band === 'Low');
  const medBand = bands.find(b => b.Band === 'Medium');
  const highBand = bands.find(b => b.Band === 'High');

  // If there are only two bands (Low/High), we render a simpler version
  const isTwoBand = !medBand;

  const visualMax = highBand?.MaxValue && highBand.MaxValue > 0 ? highBand.MaxValue : 10;

  // Helper to convert real value to display value
  const toDisplayValue = (val) => {
    if (!isPercentageMode) return val;
    return Math.round(((val || 0) / visualMax) * 100);
  };

  // Helper to convert display value to real value
  const fromDisplayValue = (displayVal) => {
    if (!isPercentageMode) return displayVal;
    return Math.round((displayVal / 100) * visualMax);
  };

  const handleSliderChange = (e, index) => {
    const rawInput = parseInt(e.target.value) || 0;
    const val = fromDisplayValue(rawInput); // Convert % back to real number if in % mode
    
    let newBands = [...bands];

    if (isTwoBand) {
      if (index === 1) {
        newBands = newBands.map(b => 
          b.Band === 'Low' ? { ...b, MaxValue: val } : 
          b.Band === 'High' ? { ...b, MinValue: val + 1 } : b
        );
      } else if (index === 3) {
        newBands = newBands.map(b => b.Band === 'High' ? { ...b, MaxValue: rawInput } : b); // rawInput because HighMax is absolute
      }
    } else {
      if (index === 1) {
        newBands = newBands.map(b => 
          b.Band === 'Low' ? { ...b, MaxValue: val } : 
          b.Band === 'Medium' ? { ...b, MinValue: val + 1 } : b
        );
      } else if (index === 2) {
        newBands = newBands.map(b => 
          b.Band === 'Medium' ? { ...b, MaxValue: val } : 
          b.Band === 'High' ? { ...b, MinValue: val + 1 } : b
        );
      } else if (index === 3) {
        newBands = newBands.map(b => b.Band === 'High' ? { ...b, MaxValue: rawInput } : b); // rawInput because HighMax is absolute
      }
    }
    onBandsUpdate(newBands);
  };

  const handleScoreChange = (bandName, newScore) => {
    const newBands = bands.map(b => 
      b.Band === bandName ? { ...b, Score: newScore } : b
    );
    onBandsUpdate(newBands);
  };
  
  let p1 = 0, p2 = 0;
  if (!isTwoBand && lowBand && medBand) {
    p1 = Math.min(((lowBand.MaxValue || 0) / visualMax) * 100, 100);
    p2 = Math.min(((medBand.MaxValue || 0) / visualMax) * 100, 100);
  } else if (isTwoBand && lowBand) {
    p1 = Math.min(((lowBand.MaxValue || 0) / visualMax) * 100, 100);
  }

  // The range inputs themselves always operate on the display values directly
  const rangeMax = isPercentageMode ? 100 : visualMax;

  return (
    <div className="threshold-visualizer">
      <div className="band-labels">
        <span>Low</span>
        {!isTwoBand && <span>Medium</span>}
        <span>High</span>
      </div>
      
      {/* Interactive slider representation */}
      <div className="custom-slider-container" style={{ position: 'relative', height: '20px', margin: '10px 0' }}>
        {/* Track Background */}
        <div style={{ position: 'absolute', top: '8px', left: 0, right: 0, height: '6px', background: 'var(--band-bg)', borderRadius: '3px' }}></div>
        
        {/* Segments (Visual representation) */}
        {!isTwoBand ? (
          <>
            <div style={{ position: 'absolute', top: '8px', left: 0, width: `${p1}%`, height: '6px', background: '#93c5fd', borderRadius: '3px 0 0 3px' }}></div>
            <div style={{ position: 'absolute', top: '8px', left: `${p1}%`, width: `${p2 - p1}%`, height: '6px', background: 'var(--secondary-accent)' }}></div>
            <div style={{ position: 'absolute', top: '8px', left: `${p2}%`, right: 0, height: '6px', background: 'var(--primary-accent)', borderRadius: '0 3px 3px 0' }}></div>
          </>
        ) : (
          <>
            <div style={{ position: 'absolute', top: '8px', left: 0, width: `${p1}%`, height: '6px', background: '#93c5fd', borderRadius: '3px 0 0 3px' }}></div>
            <div style={{ position: 'absolute', top: '8px', left: `${p1}%`, right: 0, height: '6px', background: 'var(--primary-accent)', borderRadius: '0 3px 3px 0' }}></div>
          </>
        )}

        {/* Input thumbs */}
        <input 
          type="range" 
          min="0" 
          max={rangeMax} 
          value={toDisplayValue(lowBand?.MaxValue || 0)}
          onChange={(e) => handleSliderChange(e, 1)}
          className="multi-range"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 3 }}
        />
        {!isTwoBand && (
          <input 
            type="range" 
            min="0" 
            max={rangeMax} 
            value={toDisplayValue(medBand?.MaxValue || 0)}
            onChange={(e) => handleSliderChange(e, 2)}
            className="multi-range"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 4 }}
          />
        )}
      </div>

      {/* Exact Input Fields */}
      <div className="threshold-inputs" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span>Low Max {isPercentageMode ? '(%)' : ''}:</span>
          <input type="number" value={toDisplayValue(lowBand?.MaxValue || 0)} onChange={(e) => handleSliderChange(e, 1)} style={{ width: '45px', padding: '2px' }} />
        </div>
        {!isTwoBand && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span>Med Max {isPercentageMode ? '(%)' : ''}:</span>
            <input type="number" value={toDisplayValue(medBand?.MaxValue || 0)} onChange={(e) => handleSliderChange(e, 2)} style={{ width: '45px', padding: '2px' }} />
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-end' }}>
          <span>High Max:</span>
          {/* High Max is always an absolute number, it sets the scale, so we don't apply percentage mode to it */}
          <input type="number" value={highBand?.MaxValue || 10} onChange={(e) => handleSliderChange(e, 3)} style={{ width: '60px', padding: '2px' }} />
        </div>
      </div>

      <div className="score-inputs">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <input 
            type="number" 
            className="score-input"
            value={lowBand?.Score || 0}
            onChange={(e) => handleScoreChange('Low', parseInt(e.target.value) || 0)}
          />
          <span style={{ marginTop: '4px' }}>Score</span>
        </div>

        {!isTwoBand && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <input 
              type="number" 
              className="score-input"
              value={medBand?.Score || 0}
              onChange={(e) => handleScoreChange('Medium', parseInt(e.target.value) || 0)}
            />
            <span style={{ marginTop: '4px' }}>Score</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <input 
            type="number" 
            className="score-input"
            style={{ background: 'var(--primary-accent)' }}
            value={highBand?.Score || 0}
            onChange={(e) => handleScoreChange('High', parseInt(e.target.value) || 0)}
          />
          <span style={{ marginTop: '4px' }}>Score</span>
        </div>
      </div>
    </div>
  );
};

export default ThresholdSlider;
