import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function Clock() {
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  useEffect(() => {
    const t = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(t);
  }, []);
  return <span className="taskbar-clock">{time}</span>;
}

function App() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(false);

  const handleSubmit = async () => {
    try {
      setError('');
      setResponse(null);
      setLoading(true);
      setProgress(true);
      const jsonData = JSON.parse(input);
      const res = await axios.post('https://bajaj-finserv-backend-iota.vercel.app/bfhl', jsonData);
      setResponse(res.data);
    } catch (err) {
      setError('Invalid JSON format or API error.');
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(false), 700);
    }
  };

  const handleClear = () => {
    setInput('');
    setResponse(null);
    setError('');
  };

  return (
    <>
      {/* Desktop */}
      <div className="desktop">
        {/* Main Window */}
        <div className="window" style={{ marginTop: '16px' }}>

          {/* Title Bar */}
          <div className="title-bar">
            <span className="title-bar-text">
              <span className="title-bar-icon">🌳</span>
              Graph &amp; Tree Intelligence Engine — Bajaj Finserv Challenge
            </span>
            <div className="title-bar-controls">
              <button title="Minimize">_</button>
              <button title="Maximize">□</button>
              <button title="Close">✕</button>
            </div>
          </div>

          {/* Menu Bar */}
          <div className="menu-bar">
            <span className="menu-item"><u>F</u>ile</span>
            <span className="menu-item"><u>E</u>dit</span>
            <span className="menu-item"><u>V</u>iew</span>
            <span className="menu-item"><u>H</u>elp</span>
          </div>

          {/* Window Body */}
          <div className="window-body">

            {/* Input Section */}
            <div>
              <label className="field-label">Enter JSON Payload:</label>
              <div className="sunken">
                <textarea
                  className="win-textarea"
                  rows={5}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={'{"data": ["A->B", "A->C", "B->D"]}'}
                  spellCheck={false}
                />
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="progress-bar-wrap">
                <div className={`progress-bar-fill ${progress ? 'active' : ''}`} />
              </div>
            </div>

            {/* Buttons */}
            <div className="btn-row">
              <button className="win-btn" onClick={handleClear}>Clear</button>
              <button className="win-btn" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Processing...' : 'Submit'}
              </button>
            </div>

            {/* Error Dialog */}
            {error && (
              <div className="error-box">
                <span className="error-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Response Section */}
            {response && (
              <>
                <hr className="win-divider" />

                {/* User Info */}
                <div>
                  <div className="section-header">► User Information</div>
                  <div className="info-grid">
                    <span className="info-label">User ID:</span>
                    <span>{response.user_id}</span>
                    <span className="info-label">Email:</span>
                    <span>{response.email_id}</span>
                    <span className="info-label">Roll Number:</span>
                    <span>{response.college_roll_number}</span>
                  </div>
                </div>

                <hr className="win-divider" />

                {/* Summary Cards */}
                <div>
                  <div className="section-header">► Summary</div>
                  <div className="summary-grid">
                    <div className="summary-card">
                      <span className="summary-value">{response.summary.total_trees}</span>
                      <span className="summary-label">Total Trees</span>
                    </div>
                    <div className="summary-card">
                      <span className="summary-value">{response.summary.total_cycles}</span>
                      <span className="summary-label">Total Cycles</span>
                    </div>
                    <div className="summary-card">
                      <span className="summary-value">{response.summary.largest_tree_root || '—'}</span>
                      <span className="summary-label">Deepest Root</span>
                    </div>
                  </div>
                </div>

                <hr className="win-divider" />

                {/* Invalid & Duplicates */}
                {(response.invalid_entries?.length > 0 || response.duplicate_edges?.length > 0) && (
                  <div>
                    <div className="section-header">► Flags</div>
                    <div className="info-grid">
                      {response.invalid_entries?.length > 0 && (
                        <>
                          <span className="info-label">Invalid Entries:</span>
                          <span>{response.invalid_entries.join(', ')}</span>
                        </>
                      )}
                      {response.duplicate_edges?.length > 0 && (
                        <>
                          <span className="info-label">Duplicate Edges:</span>
                          <span>{response.duplicate_edges.join(', ')}</span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <hr className="win-divider" />

                {/* JSON Output */}
                <div>
                  <div className="section-header">► Hierarchies (Raw JSON)</div>
                  <div className="sunken">
                    <pre className="json-output">
                      {JSON.stringify(response.hierarchies, null, 2)}
                    </pre>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Status Bar */}
          <div className="status-bar">
            <span className="status-panel">
              {loading ? '⏳ Processing request...' : response ? '✔ Done' : 'Ready'}
            </span>
            <span className="status-panel">POST /bfhl</span>
            <span className="status-panel">SRM Challenge 2026</span>
          </div>
        </div>
      </div>

      {/* Taskbar */}
      <div className="taskbar">
        <button className="start-btn">⊞ Start</button>
        <span className="status-panel" style={{ fontSize: '15px', padding: '2px 8px' }}>
          🌳 Graph Engine
        </span>
        <Clock />
      </div>
    </>
  );
}

export default App;