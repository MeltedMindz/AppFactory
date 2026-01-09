import React, { useState, useEffect, useMemo } from 'react';
import { Eye } from 'lucide-react';
import { 
  loadLeaderboard, 
  LeaderboardEntry, 
  calculateStats,
  filterEntries,
  getUniqueRuns,
  getUniqueMarkets,
  SortField,
  SortDirection
} from '../lib/leaderboard';
import StatsCards from './StatsCards';
import FilterControls from './FilterControls';
import LeaderboardTable from './LeaderboardTable';
import DetailModal from './DetailModal';

interface LeaderboardPageProps {
  onNavigateToBuilds: () => void;
}

const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ onNavigateToBuilds }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [runFilter, setRunFilter] = useState('all');
  const [marketFilter, setMarketFilter] = useState('all');
  const [costProfileFilter, setCostProfileFilter] = useState('all');
  const [backendFilter, setBackendFilter] = useState('all');
  const [aiFilter, setAiFilter] = useState('all');
  const [complexityFilter, setComplexityFilter] = useState('all');
  
  // Sort states (not used in global view - always global_rank asc)
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Modal state
  const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);

  useEffect(() => {
    loadLeaderboard()
      .then(data => {
        setEntries(data.entries);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filteredAndSortedEntries = useMemo(() => {
    let filtered = filterEntries(entries, searchTerm, runFilter, marketFilter);
    
    // Apply build profile filters
    if (costProfileFilter !== 'all') {
      filtered = filtered.filter(entry => entry.cost_profile === costProfileFilter);
    }
    
    if (backendFilter !== 'all') {
      const requiresBackend = backendFilter === 'yes';
      filtered = filtered.filter(entry => entry.backend_required === requiresBackend);
    }
    
    if (aiFilter !== 'all') {
      filtered = filtered.filter(entry => (entry.ai_required || 'none') === aiFilter);
    }
    
    if (complexityFilter !== 'all') {
      filtered = filtered.filter(entry => (entry.mvp_complexity || 'M') === complexityFilter);
    }
    
    // ALWAYS sort by global_rank asc in Global View
    return [...filtered].sort((a, b) => {
      const rankA = Number(a.global_rank) || Infinity;
      const rankB = Number(b.global_rank) || Infinity;
      return rankA - rankB;
    });
  }, [entries, searchTerm, runFilter, marketFilter, costProfileFilter, backendFilter, aiFilter, complexityFilter]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, runFilter, marketFilter, costProfileFilter, backendFilter, aiFilter, complexityFilter]);

  // Pagination calculations
  const totalEntries = filteredAndSortedEntries.length;
  const totalPages = Math.ceil(totalEntries / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedEntries = filteredAndSortedEntries.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const stats = useMemo(() => calculateStats(entries), [entries]);
  const availableRuns = useMemo(() => getUniqueRuns(entries), [entries]);
  const availableMarkets = useMemo(() => getUniqueMarkets(entries), [entries]);

  const handleSort = (field: SortField) => {
    // Sorting disabled in Global View - always use global_rank asc
    // This function kept for compatibility but does nothing
  };

  const handleSelectEntry = (entry: LeaderboardEntry) => {
    setSelectedEntry(entry);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedEntry(null);
  };

  if (loading) {
    return (
      <div className="leaderboard-page">
        <div className="loading-state">
          <h3>Loading leaderboard...</h3>
          <p>Please ensure the leaderboard data is synced</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard-page">
        <div className="error-state">
          <h3>Failed to load leaderboard</h3>
          <p>{error}</p>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
            Make sure to run <code>npm run sync</code> to copy the latest leaderboard data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-page">
      <header className="header">
        <div className="header-content">
          <div className="header-top">
            <h1>App Factory Leaderboard</h1>
            <button className="view-builds-button" onClick={onNavigateToBuilds}>
              <Eye size={16} />
              View Builds
            </button>
          </div>
          <p>Performance rankings of AI-generated mobile app ideas across all runs</p>
        </div>
      </header>

      <main className="main">
        <StatsCards stats={stats} />
        
        <FilterControls
          searchTerm={searchTerm}
          runFilter={runFilter}
          marketFilter={marketFilter}
          minScore={0}
          viewMode="global"
          costProfileFilter={costProfileFilter}
          backendFilter={backendFilter}
          aiFilter={aiFilter}
          complexityFilter={complexityFilter}
          availableRuns={availableRuns}
          availableMarkets={availableMarkets}
          onSearchChange={setSearchTerm}
          onRunFilterChange={setRunFilter}
          onMarketFilterChange={setMarketFilter}
          onMinScoreChange={() => {}}
          onViewModeChange={() => {}}
          onCostProfileFilterChange={setCostProfileFilter}
          onBackendFilterChange={setBackendFilter}
          onAiFilterChange={setAiFilter}
          onComplexityFilterChange={setComplexityFilter}
        />

        <div className="content-wrapper">
          <div className="table-section">
            <LeaderboardTable
              entries={paginatedEntries}
              sortField={sortField}
              sortDirection={sortDirection}
              selectedEntry={selectedEntry}
              viewMode="global"
              onSort={handleSort}
              onSelectEntry={handleSelectEntry}
            />
            
            {totalEntries > 0 && (
              <div className="pagination">
                <div className="pagination-info">
                  Showing {startIndex + 1}–{Math.min(endIndex, totalEntries)} of {totalEntries} entries
                </div>
                <div className="pagination-controls">
                  <button
                    className="pagination-button"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <div className="page-info">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="page-jump">
                    <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Go to:</span>
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={currentPage}
                      onChange={(e) => {
                        const page = parseInt(e.target.value);
                        if (!isNaN(page)) {
                          handlePageChange(page);
                        }
                      }}
                    />
                  </div>
                  <button
                    className="pagination-button"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <DetailModal 
        entry={selectedEntry}
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onNavigateToBuilds={onNavigateToBuilds}
      />
    </div>
  );
};

export default LeaderboardPage;