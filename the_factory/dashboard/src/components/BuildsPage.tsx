import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Play, Search, Filter, Calendar, GitBranch, Terminal } from 'lucide-react';
import { loadBuilds, BuildEntry, filterBuilds, sortBuilds, calculateBuildStats } from '../lib/builds';
import BuildPreviewModal from './BuildPreviewModal';

interface BuildsPageProps {
  onNavigateBack: () => void;
}

const BuildsPage: React.FC<BuildsPageProps> = ({ onNavigateBack }) => {
  const [builds, setBuilds] = useState<BuildEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [modeFilter, setModeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Modal state
  const [selectedBuild, setSelectedBuild] = useState<BuildEntry | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadBuilds()
      .then(data => {
        setBuilds(data.builds || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filteredAndSortedBuilds = useMemo(() => {
    const filtered = filterBuilds(builds, searchTerm, modeFilter, statusFilter);
    return sortBuilds(filtered, sortBy);
  }, [builds, searchTerm, modeFilter, statusFilter, sortBy]);

  const stats = useMemo(() => calculateBuildStats(builds), [builds]);

  const handlePreviewBuild = (build: BuildEntry) => {
    setSelectedBuild(build);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedBuild(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="builds-page">
        <div className="loading-state">
          <h3>Loading builds...</h3>
          <p>Please ensure the builds data is synced</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="builds-page">
        <div className="error-state">
          <h3>Failed to load builds</h3>
          <p>{error}</p>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
            Make sure to run <code>npm run sync</code> to copy the latest builds data.
          </p>
          <button className="back-button" onClick={onNavigateBack}>
            <ArrowLeft size={16} /> Back to Leaderboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="builds-page">
      <header className="builds-header">
        <div className="header-content">
          <div className="header-top">
            <button className="back-button" onClick={onNavigateBack}>
              <ArrowLeft size={16} /> Back to Leaderboard
            </button>
            <h1>App Factory Builds</h1>
          </div>
          <p>Complete React Native apps ready for preview and deployment</p>
        </div>
      </header>

      <main className="builds-main">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Builds</h3>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card">
            <h3>Successful</h3>
            <div className="stat-value success">{stats.successful}</div>
          </div>
          <div className="stat-card">
            <h3>Failed</h3>
            <div className="stat-value failed">{stats.failed}</div>
          </div>
          <div className="stat-card">
            <h3>Success Rate</h3>
            <div className="stat-value">{stats.successRate}%</div>
          </div>
          <div className="stat-card">
            <h3>Dream Mode</h3>
            <div className="stat-value">{stats.dreamBuilds}</div>
          </div>
          <div className="stat-card">
            <h3>Pipeline Mode</h3>
            <div className="stat-value">{stats.pipelineBuilds}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="builds-filters">
          <div className="filter-group">
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search builds..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          
          <div className="filter-group">
            <Filter size={16} />
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Modes</option>
              <option value="dream">Dream Mode</option>
              <option value="pipeline">Pipeline Mode</option>
            </select>
          </div>

          <div className="filter-group">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="filter-group">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
              className="filter-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Builds List */}
        <div className="builds-list">
          {filteredAndSortedBuilds.length === 0 ? (
            <div className="empty-state">
              <h3>No builds found</h3>
              <p>No builds match your current filters. Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            filteredAndSortedBuilds.map((build) => (
              <div key={build.buildId} className="build-card">
                <div className="build-main-info">
                  <div className="build-header">
                    <h3 className="build-name">{build.name}</h3>
                    <div className="build-badges">
                      <span className={`status-badge ${build.status}`}>
                        {build.status}
                      </span>
                      <span className={`mode-badge ${build.origin.mode}`}>
                        {build.origin.mode}
                      </span>
                    </div>
                  </div>
                  
                  <div className="build-details">
                    <div className="build-detail">
                      <Terminal size={14} />
                      <span className="monospace">{build.buildPath}</span>
                    </div>
                    <div className="build-detail">
                      <Calendar size={14} />
                      <span>{formatDate(build.createdAt)}</span>
                    </div>
                    {build.origin.runId && (
                      <div className="build-detail">
                        <GitBranch size={14} />
                        <span className="monospace">{build.origin.runId}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="build-actions">
                  <button
                    className="preview-button"
                    onClick={() => handlePreviewBuild(build)}
                    disabled={!build.preview.enabled}
                  >
                    <Play size={16} />
                    Preview Build
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <BuildPreviewModal
        build={selectedBuild}
        isOpen={modalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default BuildsPage;