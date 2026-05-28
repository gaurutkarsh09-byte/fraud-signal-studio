import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import MarkerGrid from './components/MarkerGrid';
import ImpactPreview from './components/ImpactPreview';
import ScenarioMixer from './components/ScenarioMixer';
import PreviewPublish from './components/PreviewPublish';
import SignalIntake from './components/SignalIntake';
import LogHistory from './components/LogHistory';
import Intro from './components/Intro';
import { initialMarkers, scenarios as initialScenarios } from './data/mockData';

function MarkerStudio({ markers, setMarkers, scenariosList, activeScenario, setActiveScenario, currentUser, setCurrentUser }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isPercentageMode, setIsPercentageMode] = useState(false);
  const [scopeFilter, setScopeFilter] = useState('All');
  const [showPublishModal, setShowPublishModal] = useState(false);

  // Backend Save Function
  const handleSaveDraft = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markers, scenarios: scenariosList })
      });
      const result = await response.json();
      if (result.success) {
        alert("Draft saved successfully to Excel!\n" + result.path);
      } else {
        alert("Error saving draft: " + result.message);
      }
    } catch (error) {
      alert("Failed to connect to backend server. Make sure it is running on port 3001.");
    }
  };

  const filteredMarkers = markers.filter(m => {
    const matchesSearch = m.MarkerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesScope = scopeFilter === 'All' || m.Scope === scopeFilter;
    return matchesSearch && matchesScope;
  });

  return (
    <div className="main-area">
      <TopBar 
        scenarios={scenariosList} 
        activeScenario={activeScenario}
        setActiveScenario={setActiveScenario}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSave={handleSaveDraft}
        onPublish={() => setShowPublishModal(true)}
        isPercentageMode={isPercentageMode}
        setIsPercentageMode={setIsPercentageMode}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
      />
      <div className="content-layout">
        <div className="markers-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--secondary-accent)', letterSpacing: '-0.025em' }}>Fraud Signals</h3>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ 
                  background: 'var(--primary-accent)', 
                  color: 'white', 
                  padding: '4px 10px', 
                  borderRadius: '12px', 
                  fontSize: '0.75rem', 
                  fontWeight: 700,
                  boxShadow: '0 2px 4px rgba(99, 102, 241, 0.2)'
                }}>
                  Total: {markers.length}
                </span>
                <span style={{ 
                  background: '#f1f5f9', 
                  color: '#475569', 
                  padding: '4px 10px', 
                  borderRadius: '12px', 
                  fontSize: '0.75rem', 
                  fontWeight: 700,
                  border: '1px solid var(--border-color)'
                }}>
                  Policy: {markers.filter(m => m.Scope === 'Policy').length}
                </span>
                <span style={{ 
                  background: '#f1f5f9', 
                  color: '#475569', 
                  padding: '4px 10px', 
                  borderRadius: '12px', 
                  fontSize: '0.75rem', 
                  fontWeight: 700,
                  border: '1px solid var(--border-color)'
                }}>
                  Claims: {markers.filter(m => m.Scope === 'Claim').length}
                </span>
              </div>
            </div>
            
            {/* Scope Filter Radio Group */}
            <div className="scope-radio-group" style={{ 
              display: 'flex', 
              background: '#e2e8f0', 
              padding: '4px', 
              borderRadius: '8px', 
              border: '1px solid var(--border-color)' 
            }}>
              {[
                { value: 'All', label: 'Policy + Claims' },
                { value: 'Claim', label: 'Claims Only' },
                { value: 'Policy', label: 'Policy Only' }
              ].map(opt => (
                <label 
                  key={opt.value}
                  style={{
                    padding: '6px 14px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    background: scopeFilter === opt.value ? 'white' : 'transparent',
                    color: scopeFilter === opt.value ? 'var(--secondary-accent)' : 'var(--text-muted)',
                    boxShadow: scopeFilter === opt.value ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <input 
                    type="radio" 
                    name="scopeFilter" 
                    value={opt.value} 
                    checked={scopeFilter === opt.value} 
                    onChange={() => setScopeFilter(opt.value)} 
                    style={{ display: 'none' }}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <MarkerGrid 
            markers={filteredMarkers} 
            setMarkers={setMarkers} 
            isPercentageMode={isPercentageMode} 
          />
        </div>
        <ImpactPreview markers={markers} scopeFilter={scopeFilter} />
      </div>

      {/* Preview & Publish Modal */}
      {showPublishModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '2rem'
        }}>
          <div style={{
            background: 'var(--bg-color)',
            width: '100%',
            maxWidth: '1080px',
            maxHeight: '90vh',
            borderRadius: '12px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid var(--border-color)',
            overflowY: 'auto',
            padding: '2.5rem 3rem',
            position: 'relative'
          }}>
            <PreviewPublish 
              markers={markers}
              scenariosList={scenariosList}
              onClose={() => setShowPublishModal(false)}
              onSuccess={() => setShowPublishModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

const getInitialScenariosList = () => {
  return initialScenarios.map(s => ({
    ...s,
    markers: JSON.parse(JSON.stringify(initialMarkers))
  }));
};

function AppContent({
  scenariosList,
  setScenariosList,
  activeScenario,
  setActiveScenario,
  currentUser,
  setCurrentUser,
  intakeFormData,
  setIntakeFormData,
  intakeLlmOutput,
  setIntakeLlmOutput,
  handleUpdateActiveMarkers,
  handleSetActiveScenario
}) {
  const location = useLocation();
  const isIntroPage = location.pathname === '/';

  return (
    <div className={isIntroPage ? "intro-layout" : "app-container"}>
      {!isIntroPage && <Sidebar />}
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route 
          path="/mixer" 
          element={
            <ScenarioMixer 
              scenariosList={scenariosList} 
              setScenariosList={setScenariosList} 
              currentUser={currentUser}
            />
          } 
        />
        <Route 
          path="/studio" 
          element={
            <MarkerStudio 
              markers={activeScenario?.markers || []}
              setMarkers={handleUpdateActiveMarkers}
              scenariosList={scenariosList} 
              activeScenario={activeScenario} 
              setActiveScenario={handleSetActiveScenario} 
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
            />
          } 
        />
        <Route 
          path="/intake" 
          element={
            <SignalIntake 
              formData={intakeFormData}
              setFormData={setIntakeFormData}
              llmOutput={intakeLlmOutput}
              setLlmOutput={setIntakeLlmOutput}
            />
          } 
        />
        <Route 
          path="/log-history" 
          element={<LogHistory />} 
        />
      </Routes>
    </div>
  );
}

function App() {
  const [scenariosList, setScenariosList] = useState(getInitialScenariosList);
  const [activeScenario, setActiveScenario] = useState(() => {
    const list = getInitialScenariosList();
    return list.find(s => s.IsActive === 1) || list[0];
  });
  const [currentUser, setCurrentUser] = useState('System');

  const [intakeFormData, setIntakeFormData] = useState({
    question: '',
    area: 'Policy Issuance/Application',
    areaOthers: '',
    eventConcerning: '',
    timingThreshold: '',
    riskContent: '',
    desiredOutput: 'Binary',
    fixedCategories: '',
    additionalDetails: '',
    contactName: '',
    contactEmail: ''
  });
  const [intakeLlmOutput, setIntakeLlmOutput] = useState('');

  // Keep active scenario in sync if it gets renamed or deleted
  useEffect(() => {
    if (scenariosList.length > 0) {
      const exists = scenariosList.find(s => s.ScenarioId === activeScenario?.ScenarioId);
      if (!exists) {
        const defaultActive = scenariosList.find(s => s.IsActive === 1) || scenariosList[0];
        setActiveScenario(defaultActive);
      } else {
        // Update it in case weights or markers changed
        setActiveScenario(exists);
      }
    }
  }, [scenariosList, activeScenario?.ScenarioId]);

  const handleUpdateActiveMarkers = (newMarkers) => {
    const updatedList = scenariosList.map(s => {
      if (s.ScenarioId === activeScenario.ScenarioId) {
        const resolvedMarkers = typeof newMarkers === 'function' ? newMarkers(s.markers) : newMarkers;
        return { ...s, markers: resolvedMarkers };
      }
      return s;
    });
    setScenariosList(updatedList);
  };

  const handleSetActiveScenario = (scenario) => {
    const updatedList = scenariosList.map(s => ({
      ...s,
      IsActive: s.ScenarioId === scenario.ScenarioId ? 1 : 0
    }));
    setScenariosList(updatedList);
    setActiveScenario(updatedList.find(s => s.ScenarioId === scenario.ScenarioId));
  };

  // Automatically switch active scenario if current user doesn't have access to it anymore
  useEffect(() => {
    if (activeScenario) {
      const isAllowed = activeScenario.CreatedBy === currentUser || activeScenario.CreatedBy === 'System';
      if (!isAllowed && scenariosList.length > 0) {
        const allowedList = scenariosList.filter(s => s.CreatedBy === currentUser || s.CreatedBy === 'System');
        if (allowedList.length > 0) {
          const firstAllowed = allowedList.find(s => s.IsActive === 1) || allowedList[0];
          
          // inline active toggle update
          const updatedList = scenariosList.map(s => ({
            ...s,
            IsActive: s.ScenarioId === firstAllowed.ScenarioId ? 1 : 0
          }));
          setScenariosList(updatedList);
          setActiveScenario(updatedList.find(s => s.ScenarioId === firstAllowed.ScenarioId));
        }
      }
    }
  }, [currentUser, activeScenario?.ScenarioId, scenariosList]);

  return (
    <Router>
      <AppContent 
        scenariosList={scenariosList}
        setScenariosList={setScenariosList}
        activeScenario={activeScenario}
        setActiveScenario={handleSetActiveScenario}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        intakeFormData={intakeFormData}
        setIntakeFormData={setIntakeFormData}
        intakeLlmOutput={intakeLlmOutput}
        setIntakeLlmOutput={setIntakeLlmOutput}
        handleUpdateActiveMarkers={handleUpdateActiveMarkers}
        handleSetActiveScenario={handleSetActiveScenario}
      />
    </Router>
  );
}

export default App;
