import React from 'react';
import MarkerCard from './MarkerCard';

const MarkerGrid = ({ markers, setMarkers, isPercentageMode }) => {
  const handleUpdateMarker = (updatedMarker) => {
    setMarkers(markers.map(m => m.MarkerName === updatedMarker.MarkerName ? updatedMarker : m));
  };

  return (
    <div className="markers-grid">
      {markers.map(marker => (
        <MarkerCard 
          key={marker.MarkerName} 
          marker={marker} 
          onUpdate={handleUpdateMarker} 
          isPercentageMode={isPercentageMode}
        />
      ))}
    </div>
  );
};

export default MarkerGrid;
