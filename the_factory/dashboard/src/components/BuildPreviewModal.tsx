import React, { useState, useEffect, useRef } from 'react';
import { X, Copy, Terminal, Calendar, GitBranch, Smartphone, Play, Square, RefreshCw, AlertTriangle, Check, Settings } from 'lucide-react';
import { BuildEntry } from '../lib/builds';
import { previewAPI, PreviewStatus, PreviewLog } from '../lib/previewAPI';

interface BuildPreviewModalProps {
  build: BuildEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

const BuildPreviewModal: React.FC<BuildPreviewModalProps> = ({ build, isOpen, onClose }) => {
  const [previewStatus, setPreviewStatus] = useState<PreviewStatus | null>(null);
  const [logs, setLogs] = useState<PreviewLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logStreamRef = useRef<(() => void) | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const loadStatus = async () => {
    try {
      const status = await previewAPI.getStatus();
      setPreviewStatus(status);
    } catch (err) {
      console.error('Failed to load preview status:', err);
      setError('Failed to load preview status');
    }
  };

  const setupLogStream = () => {
    if (logStreamRef.current) {
      logStreamRef.current();
    }

    logStreamRef.current = previewAPI.createLogStream(
      (log) => {
        setLogs(prevLogs => [...prevLogs.slice(-99), log]); // Keep last 100 logs
      },
      (error) => {
        console.error('Log stream error:', error);
        setError('Log stream connection error');
      }
    );
  };

  // Load initial status and set up log streaming
  useEffect(() => {
    if (isOpen && build) {
      loadStatus();
      setupLogStream();
    }

    return () => {
      if (logStreamRef.current) {
        logStreamRef.current();
        logStreamRef.current = null;
      }
    };
  }, [isOpen, build]);

  // Auto-scroll logs to bottom
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleLaunchPreview = async () => {
    if (!build) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await previewAPI.startPreview(build.buildId);
      if (!result.success) {
        setError(result.message || 'Failed to start preview');
      } else {
        await loadStatus(); // Refresh status
      }
    } catch (err) {
      console.error('Failed to launch preview:', err);
      setError('Failed to launch preview');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopPreview = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await previewAPI.stopPreview();
      if (!result.success) {
        setError(result.message || 'Failed to stop preview');
      } else {
        await loadStatus(); // Refresh status
        setLogs([]); // Clear logs
      }
    } catch (err) {
      console.error('Failed to stop preview:', err);
      setError('Failed to stop preview');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLaunchIOSSimulator = async () => {
    if (!build) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if preview is already running
      if (isPreviewRunning) {
        // If already running, just open iOS
        const iosResult = await previewAPI.openIOS();
        if (!iosResult.success) {
          setError(iosResult.message || 'Failed to open iOS Simulator');
        }
      } else {
        // Start preview first, then automatically launch iOS
        const startResult = await previewAPI.startPreview(build.buildId);
        if (!startResult.success) {
          setError(startResult.message || 'Failed to start preview');
          return;
        }

        // Wait for Metro to start
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Refresh status
        await loadStatus();
        
        // Then launch iOS Simulator
        const iosResult = await previewAPI.openIOS();
        if (!iosResult.success) {
          setError(`Preview started but failed to open iOS Simulator: ${iosResult.message || 'Unknown error'}`);
        }
      }
    } catch (err) {
      console.error('Failed to launch iOS Simulator:', err);
      setError('Failed to launch iOS Simulator');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenIOS = async () => {
    try {
      const result = await previewAPI.openIOS();
      if (!result.success) {
        setError(result.message || 'Failed to open iOS simulator');
      }
    } catch (err) {
      console.error('Failed to open iOS:', err);
      setError('Failed to open iOS simulator');
    }
  };

  const handleResetWatchman = async () => {
    try {
      const result = await previewAPI.resetWatchman();
      if (!result.success) {
        setError(result.message || 'Failed to reset Watchman');
      }
    } catch (err) {
      console.error('Failed to reset Watchman:', err);
      setError('Failed to reset Watchman');
    }
  };

  const formatLogTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'error': return '❌';
      case 'warn': return '⚠️';
      default: return 'ℹ️';
    }
  };

  const renderLogMessage = (message: string) => {
    // Check if this is a QR code data URL
    if (message.startsWith('QR_CODE_DATA:')) {
      const dataUrl = message.replace('QR_CODE_DATA:', '');
      return (
        <div className="qr-code-container" style={{ margin: '10px 0' }}>
          <img 
            src={dataUrl} 
            alt="QR Code for Expo connection" 
            style={{ 
              border: '2px solid #333',
              borderRadius: '8px',
              backgroundColor: 'white',
              padding: '10px',
              display: 'block'
            }}
          />
        </div>
      );
    }
    
    // Regular message
    return <span className="log-message">{message}</span>;
  };

  // Early return after all hooks are declared
  if (!isOpen || !build) return null;

  const allSteps = build.preview.instructions.join(' && ');
  const isPreviewRunning = previewStatus?.running && previewStatus?.session?.buildId === build.buildId;
  const currentSession = previewStatus?.session;
  const localExecEnabled = previewStatus?.enabled;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content build-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Preview Build: {build.name}</h2>
            <div className="build-meta">
              <span className={`status-badge ${build.status}`}>
                {build.status}
              </span>
              <span className={`mode-badge ${build.origin.mode}`}>
                {build.origin.mode}
              </span>
              <span className="framework-badge">
                {build.framework}
              </span>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="build-details">
          <div className="build-info-section">
            <h3><Smartphone size={16} /> Build Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Build ID:</label>
                <span className="monospace">{build.buildId}</span>
              </div>
              <div className="info-item">
                <label>Build Path:</label>
                <span className="monospace">{build.buildPath}</span>
              </div>
              <div className="info-item">
                <label>Created:</label>
                <span><Calendar size={14} /> {formatDate(build.createdAt)}</span>
              </div>
              {build.origin.runId && (
                <div className="info-item">
                  <label>Run ID:</label>
                  <span className="monospace"><GitBranch size={14} /> {build.origin.runId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Local Execution Section */}
          {localExecEnabled !== undefined && (
            <div className="build-info-section">
              <h3><Play size={16} /> Local Execution</h3>
              
              {!localExecEnabled && (
                <div className="preview-disabled">
                  <AlertTriangle size={16} />
                  <span>Local execution is disabled. Enable with DASHBOARD_ENABLE_LOCAL_EXEC=1</span>
                </div>
              )}

              {localExecEnabled && (
                <>
                  {/* Action Buttons */}
                  <div className="preview-actions">
                    <button 
                      className="btn btn-primary"
                      onClick={handleLaunchPreview}
                      disabled={isLoading || isPreviewRunning}
                    >
                      {isLoading ? <RefreshCw size={16} className="spinning" /> : <Play size={16} />}
                      Launch Preview
                    </button>

                    <button 
                      className="btn btn-success"
                      onClick={handleLaunchIOSSimulator}
                      disabled={isLoading}
                      title="Setup iOS connection (provides manual connection instructions)"
                    >
                      {isLoading ? <RefreshCw size={16} className="spinning" /> : <Smartphone size={16} />}
                      Setup iOS Connection
                    </button>
                    
                    {isPreviewRunning && (
                      <button 
                        className="btn btn-secondary"
                        onClick={handleStopPreview}
                        disabled={isLoading}
                      >
                        <Square size={16} />
                        Stop Preview
                      </button>
                    )}

                    {isPreviewRunning && (
                      <button 
                        className="btn btn-outline"
                        onClick={handleOpenIOS}
                        title="Open app in iOS Simulator (Metro must be running)"
                      >
                        <Smartphone size={16} />
                        Open in iOS
                      </button>
                    )}

                    <button 
                      className="btn btn-outline"
                      onClick={handleResetWatchman}
                      title="Reset Watchman (if Metro bundler issues)"
                    >
                      <Settings size={16} />
                      Reset Watchman
                    </button>
                  </div>

                  {/* Status Area */}
                  <div className="preview-status">
                    <div className="status-item">
                      <label>Status:</label>
                      <span className={`status-indicator ${isPreviewRunning ? 'running' : 'stopped'}`}>
                        {isPreviewRunning ? '🟢 Running' : '🔴 Stopped'}
                      </span>
                    </div>
                    
                    {isPreviewRunning && currentSession && (
                      <>
                        <div className="status-item">
                          <label>Port:</label>
                          <span className="monospace">{currentSession.port}</span>
                        </div>
                        
                        {currentSession.expoUrl && (
                          <div className="status-item">
                            <label>Expo URL:</label>
                            <span className="monospace">{currentSession.expoUrl}</span>
                            <button 
                              className="copy-button"
                              onClick={() => copyToClipboard(currentSession.expoUrl!)}
                              title="Copy Expo URL"
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                        )}

                        <div className="status-item">
                          <label>Started:</label>
                          <span>{formatDate(currentSession.startedAt)}</span>
                        </div>

                        <div className="platform-hints">
                          <span className={`platform-status ${currentSession.platformHints.iosReady ? 'ready' : 'not-ready'}`}>
                            iOS: {currentSession.platformHints.iosReady ? '✅' : '⏳'}
                          </span>
                          <span className={`platform-status ${currentSession.platformHints.androidReady ? 'ready' : 'not-ready'}`}>
                            Android: {currentSession.platformHints.androidReady ? '✅' : '⏳'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Fixups Applied */}
                  {isPreviewRunning && currentSession?.fixupsApplied && currentSession.fixupsApplied.length > 0 && (
                    <div className="fixups-applied">
                      <h4><Check size={14} /> Fixups Applied</h4>
                      <ul className="fixups-list">
                        {currentSession.fixupsApplied.map((fixup, index) => (
                          <li key={index} className="fixup-item">
                            <Check size={12} />
                            {fixup}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Error Display */}
                  {error && (
                    <div className="preview-error">
                      <AlertTriangle size={16} />
                      <span>{error}</span>
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => setError(null)}
                      >
                        Dismiss
                      </button>
                    </div>
                  )}

                  {/* Logs Panel */}
                  <div className="logs-panel">
                    <h4><Terminal size={14} /> Live Logs</h4>
                    <div className="logs-container">
                      {logs.length === 0 ? (
                        <div className="logs-empty">No logs yet...</div>
                      ) : (
                        logs.map((log, index) => (
                          <div key={index} className={`log-entry log-${log.level}`}>
                            <span className="log-timestamp">{formatLogTimestamp(log.timestamp)}</span>
                            <span className="log-level">{getLogIcon(log.level)}</span>
                            <span className="log-source">[{log.source}]</span>
                            {renderLogMessage(log.message)}
                          </div>
                        ))
                      )}
                      <div ref={logsEndRef} />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Manual Instructions Section */}
          <div className="build-info-section">
            <h3><Terminal size={16} /> Manual Instructions</h3>
            <p className="instructions-note">
              Copy and run these commands in your terminal to preview the build manually:
            </p>
            
            <div className="command-section">
              <h4>Individual Steps:</h4>
              {build.preview.instructions.map((instruction, index) => (
                <div key={index} className="command-item">
                  <code>{instruction}</code>
                  <button 
                    className="copy-button"
                    onClick={() => copyToClipboard(instruction)}
                    title="Copy command"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="command-section">
              <h4>All Steps (Combined):</h4>
              <div className="command-item">
                <code>{allSteps}</code>
                <button 
                  className="copy-button"
                  onClick={() => copyToClipboard(allSteps)}
                  title="Copy all commands"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>

            <div className="launch-info">
              <h4>Recommended Launch Command:</h4>
              <div className="command-item">
                <code>{build.launch.recommended}</code>
                <button 
                  className="copy-button"
                  onClick={() => copyToClipboard(build.launch.recommended)}
                  title="Copy launch command"
                >
                  <Copy size={14} />
                </button>
              </div>
              {build.launch.notes && (
                <p className="launch-notes">{build.launch.notes}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildPreviewModal;