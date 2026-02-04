import React, { useState, useEffect } from 'react';

function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const API_URL = `https://${process.env.REACT_APP_CODESPACE_NAME}-8000.app.github.dev/api/teams/`;

  useEffect(() => {
    console.log('Teams component - API URL:', API_URL);
    
    fetch(API_URL)
      .then(response => {
        console.log('Teams - Response status:', response.status);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Teams - Fetched data:', data);
        const teamsData = data.results || data;
        console.log('Teams - Processed data:', teamsData);
        setTeams(Array.isArray(teamsData) ? teamsData : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Teams - Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [API_URL]);

  const handleViewDetails = (team) => {
    setSelectedTeam(team);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTeam(null);
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="loading-spinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading teams...</p>
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
        <h2>👥 Teams</h2>
        <span className="badge bg-primary">{teams.length} Total Teams</span>
      </div>

      <div className="row mb-4">
        {teams.map(team => (
          <div key={team.id} className="col-md-6 col-lg-4 mb-3">
            <div className="card h-100">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">{team.name}</h5>
                <span className="badge bg-info">
                  {team.members ? team.members.length : 0} members
                </span>
              </div>
              <div className="card-body">
                <p className="card-text">{team.description}</p>
                <p className="text-muted small">
                  <strong>Created:</strong> {new Date(team.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="card-footer bg-transparent">
                <button 
                  className="btn btn-sm btn-primary w-100"
                  onClick={() => handleViewDetails(team)}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {teams.length === 0 && (
        <div className="alert alert-info" role="alert">
          No teams found. Create your first team to get started!
        </div>
      )}

      <div className="card mt-4">
        <div className="card-header">
          <h5>Teams Overview</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Members</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teams.length > 0 ? (
                  teams.map(team => (
                    <tr key={team.id}>
                      <td><span className="badge bg-secondary">{team.id}</span></td>
                      <td><strong>{team.name}</strong></td>
                      <td>{team.description}</td>
                      <td>
                        <span className="badge bg-info">
                          {team.members ? team.members.length : 0}
                        </span>
                      </td>
                      <td>{new Date(team.created_at).toLocaleDateString()}</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-info"
                          onClick={() => handleViewDetails(team)}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">No teams found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bootstrap Modal */}
      {showModal && selectedTeam && (
        <>
          <div className="modal show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{selectedTeam.name}</h5>
                  <button type="button" className="btn-close" onClick={handleCloseModal} aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  <h6>Description</h6>
                  <p>{selectedTeam.description}</p>
                  <hr />
                  <div className="row">
                    <div className="col-4">
                      <strong>Team ID:</strong>
                      <p className="text-muted">{selectedTeam.id}</p>
                    </div>
                    <div className="col-4">
                      <strong>Members:</strong>
                      <p className="text-muted">
                        <span className="badge bg-info">
                          {selectedTeam.members ? selectedTeam.members.length : 0}
                        </span>
                      </p>
                    </div>
                    <div className="col-4">
                      <strong>Created:</strong>
                      <p className="text-muted">{new Date(selectedTeam.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </>
      )}
    </div>
  );
}

export default Teams;
