import React from 'react';

const QuickActionCard = ({ title, description, icon, onClick, color }) => {
  return (
    <div 
      className="quick-action-card" 
      onClick={onClick}
      style={{ borderLeftColor: color }}
    >
      <div className="action-icon" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className="action-content">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
      <div className="action-arrow">→</div>
    </div>
  );
};

export default QuickActionCard;