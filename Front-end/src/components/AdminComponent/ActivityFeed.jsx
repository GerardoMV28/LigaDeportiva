import React from 'react';

const ActivityFeed = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="activity-feed">
        <h2>Actividad Reciente</h2>
        <div className="no-activity">
          <p>No hay actividad reciente</p>
        </div>
      </div>
    );
  }

  return (
    <div className="activity-feed">
      <h2>Actividad Reciente</h2>
      <div className="activity-list">
        {activities.map((activity, index) => (
          <div key={activity._id || index} className="activity-item">
            <div className="activity-icon">🔔</div>
            <div className="activity-content">
              <p>{activity.message}</p>
              <span className="activity-time">
                {new Date(activity.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;