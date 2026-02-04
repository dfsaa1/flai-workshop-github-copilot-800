import React, { useState, useEffect } from 'react';

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = `https://${process.env.REACT_APP_CODESPACE_NAME}-8000.app.github.dev/api/leaderboard/`;

  useEffect(() => {
    console.log('Leaderboard component - API URL:', API_URL);
    
    fetch(API_URL)
      .then(response => {
        console.log('Leaderboard - Response status:', response.status);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Leaderboard - Fetched data:', data);
        const leaderboardData = data.results || data;
        console.log('Leaderboard - Processed data:', leaderboardData);
        setLeaderboard(Array.isArray(leaderboardData) ? leaderboardData : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Leaderboard - Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [API_URL]);

  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  const getRankBadgeClass = (rank) => {
    if (rank === 1) return 'bg-warning text-dark';
    if (rank === 2) return 'bg-secondary';
    if (rank === 3) return 'bg-danger';
    return 'bg-primary';
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="loading-spinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error!</h4>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>🏆 Leaderboard</h2>
        <span className="badge bg-primary">{leaderboard.length} Competitors</span>
      </div>

      {leaderboard.length > 0 && (
        <div className="row mb-4">
          {leaderboard.slice(0, 3).map((entry, index) => (
            <div key={entry.user_id || index} className="col-md-4 mb-3">
              <div className={`card text-center ${index === 0 ? 'border-warning' : index === 1 ? 'border-secondary' : 'border-danger'}`} style={{borderWidth: '3px'}}>
                <div className="card-body">
                  <h1 className="display-1">{getMedalEmoji(index + 1)}</h1>
                  <h5 className="card-title">{entry.username}</h5>
                  <p className="card-text">
                    <strong className="text-danger">{entry.total_calories.toLocaleString()}</strong> calories
                  </p>
                  <p className="text-muted">
                    {entry.activity_count} activities
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Full Rankings</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover mb-0">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>User</th>
                  <th>Total Calories</th>
                  <th>Total Activities</th>
                  <th>Avg per Activity</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length > 0 ? (
                  leaderboard.map((entry, index) => {
                    const avgCalories = entry.activity_count > 0 
                      ? (entry.total_calories / entry.activity_count).toFixed(0) 
                      : 0;
                    return (
                      <tr key={entry.user_id || index} className={index < 3 ? 'table-active' : ''}>
                        <td>
                          <span className={`badge ${getRankBadgeClass(index + 1)}`}>
                            {getMedalEmoji(index + 1)}
                          </span>
                        </td>
                        <td><strong>{entry.username}</strong></td>
                        <td>
                          <span className="badge bg-danger">
                            {entry.total_calories.toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-info">
                            {entry.activity_count}
                          </span>
                        </td>
                        <td>
                          <span className="text-muted">
                            {avgCalories} cal/activity
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">No leaderboard data found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {leaderboard.length > 0 && (
        <div className="alert alert-info mt-4" role="alert">
          <strong>Tip:</strong> Complete more activities and burn more calories to climb the leaderboard! 🔥
        </div>
      )}
    </div>
  );
}

export default Leaderboard;
