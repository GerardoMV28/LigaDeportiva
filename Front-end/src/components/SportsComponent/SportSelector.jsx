import React, { useState, useEffect } from 'react';
import './SportSelector.css';

const SportSelector = ({ onSportSelect, title = "Seleccionar Deporte" }) => {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState(null);

  useEffect(() => {
    fetchSports();
  }, []);

  const fetchSports = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/sports');
      const result = await response.json();
      
      if (result.success) {
        setSports(result.data);
      }
    } catch (error) {
      console.error('Error fetching sports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSportSelect = (sport) => {
    setSelectedSport(sport);
    if (onSportSelect) {
      onSportSelect(sport);
    }
  };

  if (loading) {
    return (
      <div className="sport-selector loading">
        <div className="loading-spinner">⏳</div>
        <p>Cargando deportes...</p>
      </div>
    );
  }

  return (
    <div className="sport-selector">
      <div className="selector-header">
        <h3>{title}</h3>
        <span className="sports-count">
          {sports.length} deportes disponibles
        </span>
      </div>

      <div className="sports-grid-selector">
        {sports.map(sport => (
          <div
            key={sport._id}
            className={`sport-card-selector ${
              selectedSport?._id === sport._id ? 'selected' : ''
            }`}
            onClick={() => handleSportSelect(sport)}
          >
            <div className="sport-icon">
              {getSportIcon(sport.name)}
            </div>
            <div className="sport-info">
              <h4>{sport.name}</h4>
              <p className="sport-description">{sport.description}</p>
              <div className="positions-preview">
                <span className="positions-count">
                  {sport.positions?.length || 0} posiciones
                </span>
                <div className="position-tags-preview">
                  {sport.positions?.slice(0, 3).map((position, index) => (
                    <span key={index} className="position-tag-preview">
                      {position.abbreviation}
                    </span>
                  ))}
                  {sport.positions?.length > 3 && (
                    <span className="more-positions">
                      +{sport.positions.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="select-indicator">
              {selectedSport?._id === sport._id ? '✓' : '→'}
            </div>
          </div>
        ))}
      </div>

      {selectedSport && (
        <div className="selected-sport-details">
          <h4>Deporte Seleccionado: {selectedSport.name}</h4>
          <div className="positions-list-details">
            <h5>Posiciones disponibles:</h5>
            <div className="positions-grid-details">
              {selectedSport.positions?.map((position, index) => (
                <div key={index} className="position-card-detail">
                  <strong>{position.name}</strong>
                  <span className="abbr">({position.abbreviation})</span>
                  {position.description && (
                    <p>{position.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const getSportIcon = (sportName) => {
  const icons = {
    'Fútbol': '⚽',
    'Baloncesto': '🏀',
    'Voleibol': '🏐',
    'Béisbol': '⚾',
    'Fútbol Americano': '🏈',
    'Tenis': '🎾',
    'Natación': '🏊‍♂️',
    'Atletismo': '🏃‍♂️',
    'Rugby': '🏉',
    'Hockey': '🏑',
    'Balonmano': '🤾‍♂️',
    'Bádminton': '🏸',
    'Pádel': '🎾',
    'Ciclismo': '🚴‍♂️',
    'Gimnasia': '🤸‍♂️'
  };
  
  return icons[sportName] || '🏆';
};

export default SportSelector;