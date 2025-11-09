import React, { useState, useEffect } from 'react';
import TeamForm from '../components/TeamForm';
import './TeamList.css';

const TeamList = () => {
  const [showForm, setShowForm] = useState(false);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar equipos del backend
  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/teams');
      const result = await response.json();
      
      if (result.success) {
        setTeams(result.data);
      } else {
        console.error('Error cargando equipos:', result.message);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      // Mantener datos de ejemplo si hay error
      setTeams([
        {
          _id: '1',
          name: 'Águilas FC',
          colors: ['#FF0000', '#FFFFFF'],
          gamesWon: 5,
          gamesLost: 2,
          totalWarnings: 3,
          registrationDate: '2024-01-15'
        },
        {
          _id: '2', 
          name: 'Tigres United',
          colors: ['#0000FF', '#FFFF00'],
          gamesWon: 3,
          gamesLost: 4,
          totalWarnings: 1,
          registrationDate: '2024-01-20'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar equipos al iniciar
  useEffect(() => {
    fetchTeams();
  }, []);

  const handleTeamCreated = (newTeam) => {
    console.log('Nuevo equipo creado:', newTeam);
    // Recargar la lista de equipos
    fetchTeams();
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  if (showForm) {
    return (
      <TeamForm 
        onTeamCreated={handleTeamCreated}
        onCancel={handleCancel}
      />
    );
  }

  if (loading) {
    return (
      <div className="team-list-container">
        <div className="loading-message">
          <h2>⏳ Cargando equipos...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="team-list-container">
      <div className="team-list-header">
        <h1 className="team-list-title">🏆 Liga Deportiva</h1>
        <p className="team-list-subtitle">Gestión de Equipos Deportivos</p>
      </div>

      <div className="team-list-actions">
        <button 
          className="team-list-add-btn"
          onClick={() => setShowForm(true)}
        >
          ➕ Registrar Nuevo Equipo
        </button>
        <button 
          className="team-list-refresh-btn"
          onClick={fetchTeams}
        >
          🔄 Actualizar Lista
        </button>
      </div>

      <div className="teams-count">
        Total de equipos: <strong>{teams.length}</strong>
      </div>

      {teams.length === 0 ? (
        <div className="no-teams-message">
          <h3>📝 No hay equipos registrados</h3>
          <p>¡Comienza registrando el primer equipo!</p>
        </div>
      ) : (
        <div className="team-list-grid">
          {teams.map(team => (
            <div key={team._id} className="team-card">
              <div className="team-card-header">
                <h3 className="team-card-name">{team.name}</h3>
                <div className="team-colors">
                  {team.colors && team.colors.map((color, index) => (
                    <span 
                      key={index}
                      className="color-dot"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="team-card-stats">
                <div className="stat">
                  <span className="stat-label">Victorias:</span>
                  <span className="stat-value wins">{team.gamesWon || 0}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Derrotas:</span>
                  <span className="stat-value losses">{team.gamesLost || 0}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Amonestaciones:</span>
                  <span className="stat-value warnings">{team.totalWarnings || 0}</span>
                </div>
              </div>

              <div className="team-card-meta">
                <small>Registrado: {new Date(team.registrationDate || team.createdAt).toLocaleDateString()}</small>
              </div>

              <div className="team-card-actions">
                <button className="btn-primary">👥 Ver Jugadores</button>
                <button className="btn-secondary">✏️ Editar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamList;