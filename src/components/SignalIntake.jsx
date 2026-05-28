import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Send, X } from 'lucide-react';

const SignalIntake = ({ formData, setFormData, llmOutput, setLlmOutput }) => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [submittedRequestId, setSubmittedRequestId] = useState('');

  // Auto dismiss popup after 4 seconds
  useEffect(() => {
    let timer;
    if (showSuccessPopup) {
      timer = setTimeout(() => {
        setShowSuccessPopup(false);
      }, 4000);
    }
    return () => clearTimeout(timer);
  }, [showSuccessPopup]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateGenerate = () => {
    const newErrors = {};
    if (!formData.question.trim()) newErrors.question = 'Business Question is required to generate specifications.';
    if (formData.area === 'Others' && !formData.areaOthers.trim()) {
      newErrors.areaOthers = 'Please specify the custom Policy/Transaction Area.';
    }
    if (!formData.riskContent.trim()) newErrors.riskContent = 'Risk Content is required to analyze the threat model.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSubmit = () => {
    const newErrors = {};
    if (!formData.question.trim()) newErrors.question = 'Business Question is required.';
    if (formData.area === 'Others' && !formData.areaOthers.trim()) {
      newErrors.areaOthers = 'Please specify the custom Area.';
    }
    if (!formData.contactName.trim()) newErrors.contactName = 'Contact Person Name is required.';
    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Contact Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Invalid email address.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateSpec = async () => {
    if (!validateGenerate()) return;

    setIsGenerating(true);
    setLlmOutput('');

    try {
      const response = await fetch('http://localhost:3001/api/generate-llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        setLlmOutput(data.spec);
      } else {
        alert('Failed to generate technical specification: ' + data.message);
      }
    } catch (error) {
      alert('Could not establish connection to Fabric Data Agent.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateSubmit()) return;

    setIsSubmitting(true);

    const payload = {
      ...formData,
      llmOutput: llmOutput
    };

    try {
      const response = await fetch('http://localhost:3001/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (result.success) {
        setSubmittedRequestId(result.request?.id || 'REQ-000');
        setShowSuccessPopup(true);
        // Reset form
        setFormData({
          question: '',
          area: 'Policy Issuance/Application',
          areaOthers: '',
          eventConcerning: '',
          timingThreshold: '',
          riskContent: '',
          desiredOutput: 'Flag',
          additionalDetails: '',
          contactName: '',
          contactEmail: ''
        });
        setLlmOutput('');
      } else {
        alert('Error saving request: ' + result.message);
      }
    } catch (error) {
      alert('Failed to connect to API server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopySpec = () => {
    if (llmOutput) {
      navigator.clipboard.writeText(llmOutput);
      alert('Copied to clipboard!');
    }
  };

  return (
    <div style={{ padding: '2rem 3rem', flex: 1, background: 'var(--bg-color)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Styling injected for animations */}
      <style>{`
        @keyframes slideInLeftToRight {
          0% {
            transform: translateX(-150%) scale(0.9);
            opacity: 0;
          }
          100% {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }
        @keyframes flyAirplane {
          0% {
            transform: translate(-10px, 0px) scale(0.8) rotate(0deg);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translate(260px, -20px) scale(1.1) rotate(15deg);
            opacity: 0;
          }
        }
        @keyframes progressFill {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .success-popup {
          animation: slideInLeftToRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .airplane-animation {
          position: relative;
          width: 320px;
          height: 64px;
          background: #f8fafc;
          border: 1px dashed #cbd5e1;
          border-radius: 8px;
          overflow: hidden;
          margin: 1.25rem 0;
          display: flex;
          align-items: center;
          padding-left: 16px;
        }
        .airplane-icon {
          color: var(--primary-accent);
          position: absolute;
          animation: flyAirplane 3s ease-in-out infinite;
        }
        .progress-bar-fill {
          height: 100%;
          background: var(--success-color);
          animation: progressFill 4s linear forwards;
        }
      `}</style>

      {/* SUCCESS POPUP MODAL WITH SLIDE ANIMATION FROM LEFT TO RIGHT */}
      {showSuccessPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99999
        }}>
          <div 
            className="success-popup"
            style={{
              background: 'white',
              width: '420px',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--border-color)',
              padding: '2rem 1.75rem',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            {/* Close Button */}
            <button 
              onClick={() => setShowSuccessPopup(false)}
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <X size={18} />
            </button>

            {/* Success Header Icon */}
            <div style={{ color: 'var(--success-color)', marginBottom: '0.75rem' }}>
              <CheckCircle size={48} style={{ strokeWidth: 2.5 }} />
            </div>
            
            <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--secondary-accent)', margin: 0 }}>
              Proposal Submitted!
            </h4>
            
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.4 }}>
              Request <strong style={{ color: 'var(--secondary-accent)' }}>{submittedRequestId}</strong> registered successfully and sent to BA for review.
            </p>

            {/* Flying Paper Airplane Animation */}
            <div className="airplane-animation">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px', textAlign: 'left' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>Queueing for review...</span>
              </div>
              <div className="airplane-icon">
                <Send size={20} />
              </div>
            </div>

            {/* Action Button */}
            <button 
              className="btn btn-secondary"
              onClick={() => setShowSuccessPopup(false)}
              style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700 }}
            >
              Acknowledge
            </button>

            {/* Progress Bar (autodismiss timer visual) */}
            <div style={{ width: '100%', height: '3px', background: '#e2e8f0', borderRadius: '999px', marginTop: '1.25rem', overflow: 'hidden' }}>
              <div className="progress-bar-fill"></div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary-accent)', letterSpacing: '-0.025em' }}>Signal Request Portal</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
            Formulate business questions and automatically generate technical logic metrics from the Microsoft Fabric Data Agent.
          </p>
        </div>
        <button 
          onClick={() => navigate('/log-history')}
          className="btn btn-secondary"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '0.65rem 1.25rem', 
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(17, 42, 70, 0.15)',
            fontSize: '0.9rem',
            fontWeight: 600,
            transition: 'all 0.15s'
          }}
        >
          📋 Log History
        </button>
      </div>

      <div style={{ display: 'flex', gap: '2rem', maxWidth: '1400px', alignItems: 'flex-start' }}>
        
        {/* Left Card: Input fields Form */}
        <div className="panel-card" style={{ flex: 6, padding: '2rem', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--secondary-accent)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Business Signal Definition
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Business Question */}
            <div>
              <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                Business Question / Risk Description *
              </label>
              <textarea 
                name="question"
                className="form-input" 
                value={formData.question}
                onChange={handleChange}
                rows="3"
                placeholder="Describe the risk, unusual behavior, or pattern you want to detect (e.g. check for claim payments made to duplicate bank account details within a short window)..."
                style={{ width: '100%', borderColor: errors.question ? '#ef4444' : 'var(--border-color)' }}
              />
              {errors.question && <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>{errors.question}</span>}
            </div>

            {/* Area Selector + Custom Area Input */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                  Policy / Transaction Area
                </label>
                <select 
                  name="area"
                  className="form-input" 
                  value={formData.area}
                  onChange={handleChange}
                  style={{ width: '100%' }}
                >
                  <option value="Policy Issuance/Application">Policy Issuance/Application</option>
                  <option value="Billing/Payments">Billing/Payments</option>
                  <option value="Agent Activity">Agent Activity</option>
                  <option value="Claims/Benefits">Claims/Benefits</option>
                  <option value="Policy Changes/Endorsements">Policy Changes/Endorsements</option>
                  <option value="Party/Payee/Address">Party/Payee/Address</option>
                  <option value="Product/Coverage">Product/Coverage</option>
                  <option value="Others">Others (Custom Category)</option>
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 600, color: formData.area === 'Others' ? 'var(--text-main)' : 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Specify Area *
                </label>
                <input 
                  type="text" 
                  name="areaOthers"
                  className="form-input" 
                  value={formData.areaOthers}
                  onChange={handleChange}
                  disabled={formData.area !== 'Others'}
                  placeholder="Only active if Others is selected"
                  style={{ 
                    width: '100%', 
                    background: formData.area !== 'Others' ? '#f1f5f9' : 'white',
                    borderColor: errors.areaOthers ? '#ef4444' : 'var(--border-color)'
                  }}
                />
                {errors.areaOthers && <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>{errors.areaOthers}</span>}
              </div>
            </div>

            {/* Event Concerning & Timing */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                  Event or Data Concerning
                </label>
                <input 
                  type="text" 
                  name="eventConcerning"
                  className="form-input" 
                  value={formData.eventConcerning}
                  onChange={handleChange}
                  placeholder="e.g. payment reversal, beneficiary bank routing change"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                  Timing or Threshold
                </label>
                <input 
                  type="text" 
                  name="timingThreshold"
                  className="form-input" 
                  value={formData.timingThreshold}
                  onChange={handleChange}
                  placeholder="e.g. within 3 months of policy issue, or > $5,000"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Risk Content */}
            <div>
              <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                Risk Content / Threat Details *
              </label>
              <textarea 
                name="riskContent"
                className="form-input" 
                value={formData.riskContent}
                onChange={handleChange}
                rows="2"
                placeholder="Detail what risks or threat vectors you are trying to mitigate..."
                style={{ width: '100%', borderColor: errors.riskContent ? '#ef4444' : 'var(--border-color)' }}
              />
              {errors.riskContent && <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>{errors.riskContent}</span>}
            </div>

            {/* Output Desired & Add details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
              <div>
                <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                  Desired Output Format
                </label>
                <select 
                  name="desiredOutput"
                  className="form-input" 
                  value={formData.desiredOutput}
                  onChange={handleChange}
                  style={{ width: '100%' }}
                >
                  <option value="Flag">Flag (0/1)</option>
                  <option value="Count">Aggregation (Count)</option>
                  <option value="Alert">Alert (Warning Info)</option>
                  <option value="Rate">Rate/Percentage</option>
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                  Additional Details
                </label>
                <input 
                  type="text" 
                  name="additionalDetails"
                  className="form-input" 
                  value={formData.additionalDetails}
                  onChange={handleChange}
                  placeholder="Any regulatory references or audit requirements"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Contact Name & Email */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                  Contact Name *
                </label>
                <input 
                  type="text" 
                  name="contactName"
                  className="form-input" 
                  value={formData.contactName}
                  onChange={handleChange}
                  placeholder="Requester name"
                  style={{ width: '100%', borderColor: errors.contactName ? '#ef4444' : 'var(--border-color)' }}
                />
                {errors.contactName && <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>{errors.contactName}</span>}
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                  Contact Email *
                </label>
                <input 
                  type="text" 
                  name="contactEmail"
                  className="form-input" 
                  value={formData.contactEmail}
                  onChange={handleChange}
                  placeholder="your.name@company.com"
                  style={{ width: '100%', borderColor: errors.contactEmail ? '#ef4444' : 'var(--border-color)' }}
                />
                {errors.contactEmail && <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>{errors.contactEmail}</span>}
              </div>
            </div>

            {/* Form actions */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button 
                type="button" 
                onClick={handleGenerateSpec}
                className="btn btn-secondary"
                disabled={isGenerating}
                style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--primary-accent)', color: 'var(--primary-accent)', background: 'transparent', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
              >
                {isGenerating ? (
                  <>
                    <span className="spinner" style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid var(--primary-accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></span>
                    Generating logic...
                  </>
                ) : 'Generate Logic'}
              </button>

              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting}
                style={{ flex: 1, padding: '0.75rem' }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Signal Proposal'}
              </button>
            </div>

          </form>
        </div>

        {/* Right Card: Spec output console (AI Logic Console) */}
        <div style={{ flex: 5, display: 'flex', flexDirection: 'column', alignSelf: 'stretch' }}>
          
          {/* Spec Output Console (AI Logic Console) */}
          <div className="panel-card" style={{ padding: '1.5rem', background: '#1e293b', borderRadius: '12px', color: '#f8fafc', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', flex: 1, minHeight: '620px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', background: isGenerating ? '#f59e0b' : (llmOutput ? '#10b981' : '#64748b'), borderRadius: '50%' }}></span>
                AI Logic Console
              </h4>
              {llmOutput && (
                <button 
                  type="button" 
                  onClick={handleCopySpec}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  📋 Copy Spec
                </button>
              )}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', fontSize: '0.825rem', fontFamily: 'monospace', color: '#e2e8f0', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
              {isGenerating ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px', color: '#94a3b8' }}>
                  <span className="spinner" style={{ width: '24px', height: '24px', border: '3px solid #38bdf8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></span>
                  <span>Connecting to Microsoft Fabric Data Agent...</span>
                </div>
              ) : (
                llmOutput || (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', color: '#64748b', padding: '0 2rem' }}>
                    <span>Ready to process. Fill out the business question and click "Generate Technical Spec" to fetch recommendation.</span>
                  </div>
                )
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default SignalIntake;
