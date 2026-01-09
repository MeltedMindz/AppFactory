import React, { useState } from 'react';
import LeaderboardPage from './components/LeaderboardPage';
import BuildsPage from './components/BuildsPage';

function App() {
  const [currentPage, setCurrentPage] = useState<'leaderboard' | 'builds'>('leaderboard');

  const navigateToBuilds = () => {
    setCurrentPage('builds');
  };

  const navigateToLeaderboard = () => {
    setCurrentPage('leaderboard');
  };

  return (
    <div className="app">
      {currentPage === 'leaderboard' ? (
        <LeaderboardPage onNavigateToBuilds={navigateToBuilds} />
      ) : (
        <BuildsPage onNavigateBack={navigateToLeaderboard} />
      )}
    </div>
  );
}

export default App;