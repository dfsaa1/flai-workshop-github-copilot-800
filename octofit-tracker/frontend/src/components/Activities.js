import React, { useState, useEffect } from 'react';

function Activities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all');

  const API_URL = `https://${process.env.REACT_APP_CODESPACE_NAME}-8000.app.github.dev/api/activities/`;

  useEffect(() => {
    console.log('Activities component - API URL:', API_URL);
    
    fetch(API_URL)
      .then(response => {
        console.log('Activities - Response status:', response.status);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Activities - Fetched data:', data);
        const activitiesData = data.results || data;
        console.log('Activities - Processed data:', activitiesData);
        setActivities(Array.isArray(activitiesData) ? activitiesData : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Activities - Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [API_URL]);

  const activityTypes = [...new Set(activities.map(a => a.activity_type).filter(Boolean))];
  
  const filteredActivities = filterType === 'all' 
    ? activities 
    : activities.filter(a => a.activity_type === filterType);

  const totalCalories = filteredActivities.reduce((sum, a) => sum + (a.calories || a.calories_burned || 0), 0);
  const totalDistance = filteredActivities.reduce((sum, a) => sum + (a.distance || 0), 0);

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="loading-spinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading activities...</p>
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
        <h2>🏃 Activities</h2>
        <span className="badge bg-primary">{activities.length} Total Activities</span>
      </div>

      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card">
            <div className="card-body text-center">
              <h6 className="text-muted">Total Calories Burned</h6>
              <h3 className="text-danger">{totalCalories.toLocaleString()}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card">
            <div className="card-body text-center">
              <h6 className="text-muted">Total Distance</h6>
              <h3 className="text-success">{totalDistance.toFixed(2)} km</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card">
            <div className="card-body text-center">
              <h6 className="text-muted">Filtered Activities</h6>
              <h3 className="text-info">{filteredActivities.length}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <label htmlFor="filterSelect" className="form-label">Filter by Activity Type</label>
              <select 
                className="form-select" 
                id="filterSelect"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Activities</option>
                {activityTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Type</th>
              <th>Duration (min)</th>
              <th>Distance (km)</th>
              <th>Calories</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredActivities.length > 0 ? (
              filteredActivities.map(activity => (
                <tr key={activity._id || activity.id}>
                  <td><span className="badge bg-secondary">{activity._id || activity.id}</span></td>
                  <td><strong>{activity.user_id || activity.user || 'Unknown'}</strong></td>
                  <td><span className="badge bg-primary">{activity.activity_type || 'N/A'}</span></td>
                  <td>{activity.duration || 0}</td>
                  <td>{activity.distance || 0}</td>
                  <td><span className="badge bg-danger">{activity.calories || activity.calories_burned || 0}</span></td>
                  <td>{activity.date ? new Date(activity.date).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center text-muted">
                  {filterType !== 'all' ? `No ${filterType} activities found` : 'No activities found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredActivities.length > 0 && (
        <div className="mt-3 text-muted text-end">
          Showing {filteredActivities.length} of {activities.length} activities
        </div>
      )}
    </div>
  );
}

export default Activities;
