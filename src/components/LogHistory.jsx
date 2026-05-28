import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Calendar, 
  User, 
  Mail, 
  Layers, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';

const LogHistory = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [areaFilter, setAreaFilter] = useState('All');
  
  // Expanded card tracking (set of request IDs)
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [copiedId, setCopiedId] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/requests');
      if (!response.ok) {
        throw new Error('Failed to retrieve logs');
      }
      const data = await response.json();
      setRequests(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not connect to backend server. Make sure the API server is running on port 3001.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const toggleExpand = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCopySpec = (id, specText) => {
    if (specText) {
      navigator.clipboard.writeText(specText);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleExpandAll = () => {
    setExpandedIds(new Set(filteredRequests.map(r => r.id)));
  };

  const handleCollapseAll = () => {
    setExpandedIds(new Set());
  };

  // Extract unique areas for filtering
  const uniqueAreas = ['All', ...new Set(requests.map(r => r.area))];

  // Filter requests
  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.llmOutput && req.llmOutput.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
    const matchesArea = areaFilter === 'All' || req.area === areaFilter;

    return matchesSearch && matchesStatus && matchesArea;
  });

  // Count summaries
  const totalCount = requests.length;
  const approvedCount = requests.filter(r => r.status === 'Approved').length;
  const underReviewCount = requests.filter(r => r.status === 'Under Review').length;
  const pendingCount = requests.filter(r => r.status === 'Pending Review').length;

  return (
    <div style={{ padding: '2rem 3rem', flex: 1, background: 'var(--bg-color)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => navigate('/intake')}
            style={{ 
              background: 'white', 
              border: '1px solid var(--border-color)', 
              borderRadius: '50%', 
              width: '40px', 
              height: '40px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer', 
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              color: 'var(--secondary-accent)',
              transition: 'all 0.15s ease'
            }}
            title="Back to Signal Request"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary-accent)', letterSpacing: '-0.025em' }}>Log History</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
              Detailed audit trail of all Fraud Signal proposals submitted for business analysis review.
            </p>
          </div>
        </div>
        
        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={handleExpandAll} 
            className="btn" 
            style={{ fontSize: '0.8rem', background: '#e2e8f0', color: 'var(--secondary-accent)', borderRadius: '6px', padding: '6px 12px' }}
          >
            Expand All
          </button>
          <button 
            onClick={handleCollapseAll} 
            className="btn" 
            style={{ fontSize: '0.8rem', background: '#e2e8f0', color: 'var(--secondary-accent)', borderRadius: '6px', padding: '6px 12px' }}
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', maxWidth: '1400px' }}>
        <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '1.25rem 1.5rem', background: 'white' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Proposals</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary-accent)' }}>{totalCount}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>requests</span>
          </div>
        </div>
        
        <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '1.25rem 1.5rem', background: 'white' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Review</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0ea5e9' }}>{pendingCount}</span>
            <span style={{ fontSize: '0.75rem', color: '#0ea5e9', fontWeight: 600 }}>{totalCount > 0 ? `${Math.round((pendingCount/totalCount)*100)}%` : '0%'}</span>
          </div>
        </div>

        <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '1.25rem 1.5rem', background: 'white' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Under Review</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b' }}>{underReviewCount}</span>
            <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600 }}>{totalCount > 0 ? `${Math.round((underReviewCount/totalCount)*100)}%` : '0%'}</span>
          </div>
        </div>

        <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '1.25rem 1.5rem', background: 'white' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Approved</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981' }}>{approvedCount}</span>
            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>{totalCount > 0 ? `${Math.round((approvedCount/totalCount)*100)}%` : '0%'}</span>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="panel-card" style={{ padding: '1.25rem', background: 'white', maxWidth: '1400px', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            <Search size={18} />
          </span>
          <input 
            type="text" 
            placeholder="Search by ID, business question, contact name, or spec content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '0.6rem 1rem 0.6rem 2.5rem', 
              borderRadius: '8px', 
              border: '1px solid var(--border-color)', 
              outline: 'none',
              fontSize: '0.9rem',
              color: 'var(--text-main)'
            }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          
          {/* Area Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Area:</span>
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                outline: 'none',
                background: 'white',
                fontSize: '0.85rem',
                fontWeight: 500,
                color: 'var(--text-main)',
                cursor: 'pointer'
              }}
            >
              {uniqueAreas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status:</span>
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              {['All', 'Pending Review', 'Under Review', 'Approved'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  style={{
                    padding: '5px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: 'none',
                    background: statusFilter === status ? 'white' : 'transparent',
                    color: statusFilter === status ? 'var(--secondary-accent)' : 'var(--text-muted)',
                    boxShadow: statusFilter === status ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {status === 'Pending Review' ? 'Pending' : status}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Logs Table / Card List */}
      <div style={{ maxWidth: '1400px' }}>
        {loading ? (
          <div className="panel-card" style={{ background: 'white', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <span className="spinner" style={{ width: '32px', height: '32px', border: '3px solid var(--primary-accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></span>
            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Fetching logs from server...</span>
          </div>
        ) : error ? (
          <div className="panel-card" style={{ background: '#fff1f2', border: '1px solid #fecdd3', padding: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', color: '#be123c' }}>
            <AlertTriangle size={24} />
            <div>
              <h4 style={{ fontWeight: 700 }}>Connection Error</h4>
              <p style={{ fontSize: '0.875rem', marginTop: '4px' }}>{error}</p>
            </div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="panel-card" style={{ background: 'white', padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <h4 style={{ fontWeight: 600, color: 'var(--secondary-accent)' }}>No requests found</h4>
            <p style={{ fontSize: '0.875rem', marginTop: '4px' }}>Try adjusting your search query or filter selection.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filteredRequests.map((req) => {
              const isExpanded = expandedIds.has(req.id);
              
              // Status Styling
              let statusBg = '#fee2e2';
              let statusColor = '#ef4444';
              if (req.status === 'Approved') {
                statusBg = '#d1fae5';
                statusColor = '#10b981';
              } else if (req.status === 'Under Review') {
                statusBg = '#fef3c7';
                statusColor = '#f59e0b';
              } else if (req.status === 'Pending Review') {
                statusBg = '#e0f2fe';
                statusColor = '#0ea5e9';
              }

              return (
                <div 
                  key={req.id} 
                  className="panel-card"
                  style={{ 
                    background: 'white', 
                    padding: '1.5rem', 
                    boxShadow: isExpanded ? '0 10px 25px -5px rgba(0,0,0,0.05)' : '0 2px 4px rgba(0,0,0,0.02)',
                    border: isExpanded ? '1px solid var(--primary-accent)' : '1px solid var(--border-color)',
                    transition: 'all 0.2s ease',
                    overflow: 'hidden'
                  }}
                >
                  {/* Card Collapsed View / Header */}
                  <div 
                    onClick={() => toggleExpand(req.id)}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, paddingRight: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, background: '#f1f5f9', color: 'var(--secondary-accent)', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                          {req.id}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', background: '#e0e7ff', color: '#4f46e5' }}>
                          <span style={{ opacity: 0.7, marginRight: '4px' }}>Area:</span>
                          {req.area === 'Others' ? (req.areaOthers || 'Custom') : req.area}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                          <Calendar size={13} />
                          {new Date(req.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div style={{ 
                        fontSize: '1rem', 
                        fontWeight: 700, 
                        color: 'var(--secondary-accent)',
                        marginTop: '4px',
                        lineHeight: '1.4',
                        // Limit lines if collapsed
                        display: '-webkit-box',
                        WebkitLineClamp: isExpanded ? 'unset' : '1',
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {req.question}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        padding: '4px 10px', 
                        borderRadius: '12px', 
                        background: statusBg, 
                        color: statusColor, 
                        textTransform: 'uppercase',
                        letterSpacing: '0.025em'
                      }}>
                        {req.status}
                      </span>
                      {isExpanded ? <ChevronUp size={20} color="var(--text-muted)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
                    </div>
                  </div>

                  {/* Card Expanded Details View */}
                  {isExpanded && (
                    <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      
                      {/* Meta Information Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Requester Details</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--secondary-accent)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <User size={14} /> {req.contactName}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Mail size={14} /> <a href={`mailto:${req.contactEmail}`} style={{ color: 'var(--primary-accent)', textDecoration: 'none' }}>{req.contactEmail}</a>
                            </span>
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Scope & Thresholds</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                              <strong>Event:</strong> {req.eventConcerning || 'Not specified'}
                            </span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                              <strong>Threshold:</strong> {req.timingThreshold || 'Not specified'}
                            </span>
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Output Requirements</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                              <strong>Format:</strong> {req.desiredOutput}
                            </span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                              <strong>Details:</strong> {req.additionalDetails || 'None'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Threat / Risk Content */}
                      <div>
                        <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--secondary-accent)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Threat Description / Risk Vector</h5>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5, background: '#fffbeb', borderLeft: '3px solid #f59e0b', padding: '10px 14px', borderRadius: '0 8px 8px 0' }}>
                          {req.riskContent}
                        </p>
                      </div>

                      {/* Technical Specification Console */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--secondary-accent)', textTransform: 'uppercase', letterSpacing: '0.025em' }}>AI Logic Spec Output</h5>
                          {req.llmOutput && (
                            <button 
                              type="button" 
                              onClick={() => handleCopySpec(req.id, req.llmOutput)}
                              style={{ 
                                background: 'white', 
                                border: '1px solid var(--border-color)', 
                                padding: '4px 10px', 
                                borderRadius: '6px', 
                                fontSize: '0.75rem', 
                                cursor: 'pointer', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '4px',
                                color: copiedId === req.id ? '#10b981' : '#64748b',
                                transition: 'all 0.15s'
                              }}
                            >
                              {copiedId === req.id ? (
                                <>
                                  <Check size={12} /> Copied!
                                </>
                              ) : (
                                <>
                                  <Copy size={12} /> Copy Spec
                                </>
                              )}
                            </button>
                          )}
                        </div>
                        {req.llmOutput ? (
                          <div style={{ 
                            background: '#1e293b', 
                            borderRadius: '8px', 
                            padding: '1.25rem', 
                            color: '#e2e8f0', 
                            fontSize: '0.825rem', 
                            fontFamily: 'monospace', 
                            whiteSpace: 'pre-wrap', 
                            lineHeight: 1.5,
                            border: '1px solid #334155',
                            maxHeight: '400px',
                            overflowY: 'auto'
                          }}>
                            {req.llmOutput}
                          </div>
                        ) : (
                          <div style={{ padding: '1rem', background: '#f1f5f9', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', italic: 'true', textAlign: 'center' }}>
                            No technical specification was generated for this proposal.
                          </div>
                        )}
                      </div>

                      {/* BA Email review draft details */}
                      {req.emailDraft && (
                        <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '1.25rem' }}>
                          <details style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 14px' }}>
                            <summary style={{ cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-accent)', userSelect: 'none' }}>
                              View Automated BA Review Notification Email Draft
                            </summary>
                            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                              <div><strong>From:</strong> {req.emailDraft.from}</div>
                              <div><strong>To:</strong> {req.emailDraft.to}</div>
                              <div><strong>Subject:</strong> {req.emailDraft.subject}</div>
                              <div style={{ 
                                background: 'white', 
                                border: '1px solid var(--border-color)', 
                                padding: '10px', 
                                borderRadius: '4px', 
                                whiteSpace: 'pre-wrap', 
                                fontFamily: 'sans-serif', 
                                color: '#334155', 
                                lineHeight: '1.4',
                                marginTop: '4px' 
                              }}>
                                {req.emailDraft.body}
                              </div>
                            </div>
                          </details>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default LogHistory;
