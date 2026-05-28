import React from 'react';
import { useNavigate } from 'react-router-dom';

const renderQuantumShield = (size = 140) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
    </defs>
    <path d="M50 5 L90 25 V65 C90 80 70 92 50 95 C30 92 10 80 10 65 V25 L50 5 Z" fill="url(#shieldGrad)" opacity="0.15" stroke="url(#shieldGrad)" strokeWidth="2" />
    <path d="M50 15 L80 30 V58 C80 70 65 80 50 83 C35 80 20 70 20 58 V30 L50 15 Z" fill="url(#shieldGrad)" opacity="0.3" />
    <path d="M50 30 L65 40 L50 50 L35 40 L50 30 Z" stroke="#6366f1" strokeWidth="3" strokeLinejoin="round" />
    <path d="M50 50 V70" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
    <circle cx="50" cy="50" r="4" fill="#38bdf8" />
    <circle cx="35" cy="40" r="3" fill="#6366f1" />
    <circle cx="65" cy="40" r="3" fill="#6366f1" />
  </svg>
);

const Intro = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(56, 189, 248, 0.15) 0%, transparent 40%), #0f172a',
      color: '#f8fafc',
      padding: '2.5rem 2rem',
      boxSizing: 'border-box',
      overflowY: 'auto',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <style>{`
        @keyframes pulseGlow {
          0% { transform: scale(1); opacity: 0.95; }
          50% { transform: scale(1.03); opacity: 1; filter: drop-shadow(0 0 15px rgba(99, 102, 241, 0.4)); }
          100% { transform: scale(1); opacity: 0.95; }
        }
        .interactive-logo {
          animation: pulseGlow 4s ease-in-out infinite;
        }
        .launch-btn {
          background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);
          box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .launch-btn:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 20px 35px -5px rgba(99, 102, 241, 0.6);
        }
        .feature-item {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 1.25rem;
          text-align: left;
          flex: 1;
          min-width: 250px;
        }
      `}</style>

      {/* Top Header */}
      <div style={{ display: 'flex', width: '100%', maxWidth: '1200px', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {renderQuantumShield(28)}
          </div>
          <span style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '0.15em', background: 'linear-gradient(135deg, #f8fafc 30%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            FRAUD SIGNAL STUDIO
          </span>
        </div>
        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '999px', padding: '4px 12px' }}>
          v2.4.0 Live
        </div>
      </div>

      {/* Middle Core Area */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '800px', margin: '2rem 0', textAlign: 'center', gap: '2.5rem' }}>
        
        {/* Selected Logo Display */}
        <div className="interactive-logo" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(30, 41, 59, 0.3)', borderRadius: '50%', padding: '1rem', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)' }}>
          {renderQuantumShield(140)}
        </div>

        {/* Studio Branding & Tagline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.04em', margin: 0, background: 'linear-gradient(135deg, #ffffff 30%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Fraud Signal Studio
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '640px', lineHeight: 1.6, fontWeight: 500, margin: '0 auto' }}>
            Next-generation fraud modeling and AI-driven signal synthesis. Design, simulate, and deploy complex fraud signals in seconds.
          </p>
        </div>

        {/* Get Started / Launch Button */}
        <div>
          <button 
            className="launch-btn"
            onClick={() => navigate('/mixer')}
            style={{
              padding: '0.9rem 2.5rem',
              borderRadius: '999px',
              border: 'none',
              color: 'white',
              fontSize: '1.05rem',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.025em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Launch Workspace 🚀
          </button>
        </div>
      </div>

      {/* Feature Showcases */}
      <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2.5rem', marginTop: '1rem' }}>
        <div className="feature-item">
          <div style={{ fontSize: '1.25rem', marginBottom: '8px' }}>🎛️</div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>Scenario Mixer</h4>
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px', lineHeight: 1.4 }}>
            Configure and simulate multiple marker configurations with real-time claims and policy weights tuning.
          </p>
        </div>

        <div className="feature-item">
          <div style={{ fontSize: '1.25rem', marginBottom: '8px' }}>⚡</div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>AI Logic Generation</h4>
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px', lineHeight: 1.4 }}>
            Instantly translate plain-text business risk questions into optimized SQL and DAX technical indicators.
          </p>
        </div>

        <div className="feature-item">
          <div style={{ fontSize: '1.25rem', marginBottom: '8px' }}>📂</div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>Active Log History</h4>
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px', lineHeight: 1.4 }}>
            Audit trail of generated indicators directly synced with backend excel spreadsheets for live team collaboration.
          </p>
        </div>
      </div>

    </div>
  );
};

export default Intro;
