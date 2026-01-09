import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { LeaderboardEntry, formatCoreLoop } from '../lib/leaderboard';
import BuildRedirectSection from './BuildRedirectSection';

interface DetailModalProps {
  entry: LeaderboardEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToBuilds?: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ entry, isOpen, onClose, onNavigateToBuilds }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !entry) return null;

  const coreLoopSteps = formatCoreLoop(entry.core_loop);

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content" role="dialog" aria-labelledby="modal-title" aria-modal="true">
        <div className="modal-header">
          <h2 id="modal-title">{entry.idea_name}</h2>
          <button 
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="detail-section">
            <h3>Basic Information</h3>
            <p><strong>Idea ID:</strong> {entry.idea_id}</p>
            <p><strong>Idea Slug:</strong> {entry.idea_slug}</p>
            <p><strong>Global Rank:</strong> #{entry.global_rank || 'N/A'}</p>
            <p><strong>Score:</strong> {entry.score.toFixed(2)}</p>
            <p><strong>Market:</strong> {entry.market}</p>
            <p><strong>Run ID:</strong> {entry.run_id}</p>
            <p><strong>Run Date:</strong> {new Date(entry.run_date).toLocaleDateString()}</p>
          </div>

          <div className="detail-section">
            <h3>Product Details</h3>
            <p><strong>Target User:</strong> {entry.target_user}</p>
            <div>
              <strong>Core Loop:</strong>
              {coreLoopSteps.length > 1 ? (
                <ul className="core-loop-list">
                  {coreLoopSteps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              ) : (
                <p>{entry.core_loop}</p>
              )}
            </div>
            <div>
              <strong>Evidence Summary:</strong>
              <p>{entry.evidence_summary}</p>
            </div>
          </div>

          {(entry.cost_profile || entry.backend_required !== undefined || entry.ai_required) && (
            <div className="detail-section">
              <h3>Build Profile</h3>
              <p><strong>Cost Profile:</strong> {entry.cost_profile || '—'}</p>
              <p><strong>Backend Required:</strong> {entry.backend_required !== undefined ? (entry.backend_required ? 'Yes' : 'No') : '—'}</p>
              {entry.backend_notes && <p><strong>Backend Notes:</strong> {entry.backend_notes}</p>}
              
              <p><strong>External API Required:</strong> {entry.external_api_required !== undefined ? (entry.external_api_required ? 'Yes' : 'No') : '—'}</p>
              {entry.external_api_list && entry.external_api_list.length > 0 && (
                <p><strong>External APIs:</strong> {entry.external_api_list.join(', ')}</p>
              )}
              {entry.external_api_cost_risk && <p><strong>API Cost Risk:</strong> {entry.external_api_cost_risk}</p>}
              
              <p><strong>AI Required:</strong> {entry.ai_required || '—'}</p>
              {entry.ai_usage_notes && <p><strong>AI Usage Notes:</strong> {entry.ai_usage_notes}</p>}
              
              <p><strong>Data Sensitivity:</strong> {entry.data_sensitivity || '—'}</p>
              <p><strong>MVP Complexity:</strong> {entry.mvp_complexity || '—'}</p>
              <p><strong>Build Effort Estimate:</strong> {entry.build_effort_estimate || '—'}</p>
              <p><strong>Ops Cost Estimate:</strong> {entry.ops_cost_estimate || '—'}</p>
              <p><strong>Review Risk:</strong> {entry.review_risk || '—'}</p>
              
              {entry.reason_to_build_now && <p><strong>Reason to Build Now:</strong> {entry.reason_to_build_now}</p>}
              {entry.reason_to_skip && <p><strong>Reason to Skip:</strong> {entry.reason_to_skip}</p>}
            </div>
          )}

          <BuildRedirectSection 
            ideaSlug={entry.idea_slug}
            ideaName={entry.idea_name}
            runId={entry.run_id}
            onNavigateToBuilds={onNavigateToBuilds}
          />

          {entry.source_paths && (
            <div className="detail-section">
              <h3>Source Paths</h3>
              <p><strong>Run Directory:</strong> <code className="source-path">{entry.source_paths.run_dir}</code></p>
              <p><strong>Stage 01 JSON:</strong> <code className="source-path">{entry.source_paths.stage01_json}</code></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailModal;