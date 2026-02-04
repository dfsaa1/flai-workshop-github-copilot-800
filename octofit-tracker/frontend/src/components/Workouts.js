import React, { useState, useEffect } from 'react';

function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  const API_URL = `https://${process.env.REACT_APP_CODESPACE_NAME}-8000.app.github.dev/api/workouts/`;

  useEffect(() => {
    console.log('Workouts component - API URL:', API_URL);
    
    fetch(API_URL)
      .then(response => {
        console.log('Workouts - Response status:', response.status);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Workouts - Fetched data:', data);
        const workoutsData = data.results || data;
        console.log('Workouts - Processed data:', workoutsData);
        setWorkouts(Array.isArray(workoutsData) ? workoutsData : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Workouts - Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [API_URL]);

  const handleViewWorkout = (workout) => {
    setSelectedWorkout(workout);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedWorkout(null);
  };

  const difficulties = [...new Set(workouts.map(w => w.difficulty || w.difficulty_level).filter(Boolean))];
  
  const filteredWorkouts = filterDifficulty === 'all'
    ? workouts
    : workouts.filter(w => (w.difficulty || w.difficulty_level) === filterDifficulty);

  const getDifficultyBadgeClass = (difficulty) => {
    const diff = difficulty?.toLowerCase();
    if (diff === 'beginner' || diff === 'easy') return 'bg-success';
    if (diff === 'intermediate' || diff === 'medium') return 'bg-warning text-dark';
    if (diff === 'advanced' || diff === 'hard') return 'bg-danger';
    return 'bg-secondary';
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="loading-spinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading workouts...</p>
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
        <h2>💪 Workout Suggestions</h2>
        <span className="badge bg-primary">{workouts.length} Workouts Available</span>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <label htmlFor="difficultyFilter" className="form-label">Filter by Difficulty</label>
              <select 
                className="form-select"
                id="difficultyFilter"
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
              >
                <option value="all">All Difficulties</option>
                {difficulties.map(diff => (
                  <option key={diff} value={diff}>{diff}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        {filteredWorkouts.map(workout => (
          <div key={workout._id || workout.id} className="col-md-6 col-lg-4 mb-3">
            <div className="card h-100">
              <div className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">{workout.name}</h5>
                  <span className={`badge ${getDifficultyBadgeClass(workout.difficulty || workout.difficulty_level)}`}>
                    {workout.difficulty || workout.difficulty_level}
                  </span>
                </div>
              </div>
              <div className="card-body">
                <p className="card-text">{workout.description}</p>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="badge bg-info">{workout.type || workout.category}</span>
                  <span className="text-muted small">⏱️ {workout.duration} min</span>
                </div>
                <p className="text-muted small mb-0">
                  📝 {workout.exercises && Array.isArray(workout.exercises) 
                    ? workout.exercises.length 
                    : 0} exercises
                </p>
              </div>
              <div className="card-footer bg-transparent">
                <button 
                  className="btn btn-sm btn-primary w-100"
                  onClick={() => handleViewWorkout(workout)}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredWorkouts.length === 0 && (
        <div className="alert alert-info" role="alert">
          No workouts found for the selected filter.
        </div>
      )}

      <div className="card mt-4">
        <div className="card-header">
          <h5>All Workouts</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Difficulty</th>
                  <th>Duration (min)</th>
                  <th>Exercises</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkouts.length > 0 ? (
                  filteredWorkouts.map(workout => (
                    <tr key={workout._id || workout.id}>
                      <td><strong>{workout.name}</strong></td>
                      <td><span className="badge bg-info">{workout.type || workout.category}</span></td>
                      <td>
                        <span className={`badge ${getDifficultyBadgeClass(workout.difficulty || workout.difficulty_level)}`}>
                          {workout.difficulty || workout.difficulty_level}
                        </span>
                      </td>
                      <td>{workout.duration}</td>
                      <td>
                        <span className="badge bg-secondary">
                          {workout.exercises && Array.isArray(workout.exercises) 
                            ? workout.exercises.length 
                            : 0}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => handleViewWorkout(workout)}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">No workouts found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bootstrap Modal for Workout Details */}
      {showModal && selectedWorkout && (
        <>
          <div className="modal show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{selectedWorkout.name}</h5>
                  <button type="button" className="btn-close" onClick={handleCloseModal} aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <span className={`badge ${getDifficultyBadgeClass(selectedWorkout.difficulty || selectedWorkout.difficulty_level)} me-2`}>
                      {selectedWorkout.difficulty || selectedWorkout.difficulty_level}
                    </span>
                    <span className="badge bg-info me-2">
                      {selectedWorkout.type || selectedWorkout.category}
                    </span>
                    <span className="badge bg-secondary">
                      ⏱️ {selectedWorkout.duration} minutes
                    </span>
                  </div>
                  <h6>Description</h6>
                  <p>{selectedWorkout.description}</p>
                  <hr />
                  <h6>Exercises</h6>
                  {selectedWorkout.exercises && Array.isArray(selectedWorkout.exercises) && selectedWorkout.exercises.length > 0 ? (
                    <div className="list-group">
                      {selectedWorkout.exercises.map((exercise, idx) => (
                        <div key={idx} className="list-group-item">
                          <div className="d-flex w-100 justify-content-between">
                            <h6 className="mb-1">{exercise.name || exercise}</h6>
                            {exercise.sets && exercise.reps && (
                              <small>{exercise.sets} sets × {exercise.reps} reps</small>
                            )}
                          </div>
                          {exercise.description && (
                            <p className="mb-1 small text-muted">{exercise.description}</p>
                          )}
                          {exercise.duration && (
                            <small className="text-muted">Duration: {exercise.duration}</small>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted">No exercises listed</p>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-success">Start Workout</button>
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

      {filteredWorkouts.length > 0 && (
        <div className="mt-3 text-muted text-end">
          Showing {filteredWorkouts.length} of {workouts.length} workouts
        </div>
      )}
    </div>
  );
}

export default Workouts;
