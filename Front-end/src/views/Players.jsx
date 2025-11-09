import React, { useState, useEffect } from 'react';
import PlayerForm from '../components/PlayerForm';
import './Players.css';

const Players = () => {
  const [showForm, setShowForm] = useState(false);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener jugadores
  const fetchPlayers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:4000/api/players');
      const result = await response.json();
      
      if (result.success) {
        setPlayers(result.data);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
      setError('Error al cargar los jugadores');
    } finally {
      setLoading(false);
    }
  };

  // Cargar jugadores al montar el componente
  useEffect(() => {
    fetchPlayers();
  }, []);

  const handlePlayerCreated = (newPlayer) => {
    console.log('Nuevo jugador creado:', newPlayer);
    setShowForm(false);
    // Recargar la lista de jugadores
    fetchPlayers();
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  if (showForm) {
    return (
      <PlayerForm 
        onPlayerCreated={handlePlayerCreated}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="players-container">
      <div className="players-header">
        <h1 className="players-title">👟 Jugadores</h1>
        <p className="players-subtitle">Gestión de Jugadores de la Liga</p>
      </div>

      <div className="players-actions">
        <button 
          className="players-add-btn"
          onClick={() => setShowForm(true)}
        >
         Registrar Nuevo Jugador
        </button>
      </div>

      {/* Lista de Jugadores */}
      <div className="players-list-section">
        <h2>Lista de Jugadores Registrados</h2>
        
        {loading ? (
          <div className="loading">Cargando jugadores...</div>
        ) : error ? (
          <div className="error-message">
            ❌ {error}
            <button onClick={fetchPlayers} className="retry-btn">
              Reintentar
            </button>
          </div>
        ) : players.length === 0 ? (
          <div className="no-players">
            <p>No hay jugadores registrados aún.</p>
          </div>
        ) : (
          <div className="players-grid">
            {players.map((player) => (
              <div key={player._id} className="player-card">
                <div className="player-header">
                  <h3>{player.firstName} {player.lastName}</h3>
                  <span className="player-badge">ID: {player.teamInternalId}</span>
                </div>
                <div className="player-details">
                  <p><strong>Folio:</strong> {player.registrationFolio}</p>
                  <p><strong>Sexo:</strong> {player.sex}</p>
                  <p><strong>Fecha Nac:</strong> {new Date(player.birthDate).toLocaleDateString()}</p>
                  <p><strong>Peso:</strong> {player.weight} kg</p>
                  <p><strong>Altura:</strong> {player.height} cm</p>
                  {player.team && (
                    <p><strong>Equipo:</strong> {player.team.name}</p>
                  )}
                </div>
                <div className="player-footer">
                  <span className="player-id">ID: {player._id?.substring(0, 8)}...</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sección de información (solo se muestra si no hay jugadores) */}
      {!loading && players.length === 0 && !error && (
        <div className="players-content">
          <div className="coming-soon-card">
            <div className="coming-soon-icon">🎯</div>
            <h2>Gestión de Jugadores</h2>
            <p>Aquí podrás ver y gestionar todos los jugadores registrados en la liga.</p>
            <div className="features-list">
              <div className="feature-item">
                <span className="feature-icon">👁️</span>
                <span>Ver lista completa de jugadores</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔍</span>
                <span>Buscar y filtrar jugadores</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <span>Ver estadísticas individuales</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✏️</span>
                <span>Editar información de jugadores</span>
              </div>
            </div>
            <button 
              className="start-adding-btn"
              onClick={() => setShowForm(true)}
            >
              🚀 Comenzar a Registrar Jugadores
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Players;