import React, { useState, useEffect } from 'react';
import PlayerDetailsModal from '../PlayerComponent/PlayerDetailsModal';
import './TeamDetailsModal.css';

const getLogoUrl = (logoPath) => {
  if (!logoPath || logoPath === '' || logoPath === 'null' || logoPath === 'undefined') {
    return null;
  }
  
  // Si ya es una URL completa, usarla directamente
  if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
    return logoPath;
  }
  
  if (logoPath.startsWith('data:image')) {
    return logoPath;
  }
  
  // Para rutas relativas, construir URL completa
  if (logoPath.startsWith('/uploads/')) {
    return `http://localhost:4000${logoPath}`;
  }
  
  return `http://localhost:4000/uploads/${logoPath}`;
};

const TeamDetailsModal = ({
  team,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  sports,
  sportPositions,
  teams,
  getPlayerSport,
  getPlayerTeam,
  getPrimaryPosition,
  calculateAge,
  getPlayerStats
}) => {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ DEBUG: Ver qué llega al modal
  useEffect(() => {
    console.log('🎯 TeamDetailsModal - team recibido:', team);
    console.log('🎯 TeamDetailsModal - team._id:', team?._id);
    console.log('🎯 TeamDetailsModal - team.id:', team?.id);
    console.log('🎯 TeamDetailsModal - isOpen:', isOpen);
  }, [team, isOpen]);

  // ✅ CARGAR JUGADORES CON PROTECCIÓN TOTAL
  useEffect(() => {
    if (isOpen && team) {
      const teamId = team._id || team.id;
      console.log('🔄 useEffect - teamId para fetch:', teamId);

      if (teamId && teamId !== 'undefined') {
        fetchTeamPlayers(teamId);
      } else {
        console.error('❌ No se puede cargar jugadores: teamId inválido', teamId);
      }
    }
  }, [isOpen, team]);

  const fetchTeamPlayers = async (teamId) => {
    console.log('🚀 fetchTeamPlayers llamado con teamId:', teamId);

    if (!teamId || teamId === 'undefined') {
      console.error('❌ teamId inválido en fetchTeamPlayers:', teamId);
      return;
    }

    try {
      setLoading(true);
      console.log(`🌐 Haciendo fetch a: http://localhost:4000/api/players?team=${teamId}`);

      const response = await fetch(`http://localhost:4000/api/players?team=${teamId}`);
      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('📊 Resultado del fetch:', result);

      if (result.success) {
        console.log(`✅ ${result.data.length} jugadores cargados`);
        setTeamPlayers(result.data);
      } else {
        console.error('❌ Error en la respuesta del servidor:', result.message);
        setTeamPlayers([]);
      }
    } catch (error) {
      console.error('❌ Error en fetchTeamPlayers:', error);
      setTeamPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ OBTENER ID SEGURO DEL EQUIPO
  const getSafeTeamId = () => {
    return team?._id || team?.id;
  };

  // ✅ ESTADÍSTICAS SEGURAS
  const getTeamStats = () => {
    if (!team) return {};

    return {
      playerCount: teamPlayers.length,
      wins: team.gamesWon || team.wins || 0,
      losses: team.gamesLost || team.losses || 0,
      draws: team.gamesDrawn || team.draws || 0,
      gamesPlayed: team.gamesPlayed || 0
    };
  };

  const stats = getTeamStats();
  const gamesPlayed = stats.gamesPlayed || (stats.wins + stats.losses + stats.draws);
  const winPercentage = gamesPlayed > 0 ? ((stats.wins / gamesPlayed) * 100).toFixed(1) : 0;

  if (!isOpen || !team) {
    console.log('❌ Modal cerrado o team no disponible');
    return null;
  }

  const safeTeamId = getSafeTeamId();
  console.log('🔍 Renderizando modal con teamId:', safeTeamId);

  // ✅ OBTENER URL DEL LOGO
  const logoUrl = getLogoUrl(team?.logo);
  console.log('🖼️ TeamDetailsModal - Logo URL:', {
    team: team.name,
    originalLogo: team.logo,
    finalLogoUrl: logoUrl
  });

  // ✅ FUNCIONES PARA JUGADORES
  const handleViewPlayerDetails = (player) => {
    setSelectedPlayer(player);
    setIsPlayerModalOpen(true);
  };

  const handleClosePlayerModal = () => {
    setIsPlayerModalOpen(false);
    setSelectedPlayer(null);
  };

  return (
    <>
      <div className="team-modal-overlay" onClick={onClose}>
        <div className="team-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="team-modal-header">
            <h2>🏆 Detalles del Equipo</h2>
            <button className="team-close-btn" onClick={onClose}>×</button>
          </div>

          <div className="team-details">
            {/* ✅ INFO DEBUG EN UI */}
            <div style={{
              background: '#f0f8ff',
              padding: '10px',
              borderRadius: '5px',
              marginBottom: '15px',
              fontSize: '12px',
              color: '#666'
            }}>
              <strong>Debug Info:</strong> Team ID: {safeTeamId} | Logo: {team.logo || 'No logo'}
            </div>

            {/* ✅ ENCABEZADO DEL EQUIPO */}
            <div className="team-header">
              <div className={`team-logo-modal ${logoUrl ? 'has-logo' : 'no-logo'}`}>
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt={`${team.name} logo`}
                    className="team-logo-modal-image"
                    onError={(e) => {
                      console.log('❌ Error cargando logo en modal:', logoUrl);
                      e.target.style.display = 'none';
                      // Remover la clase has-logo para mostrar el placeholder
                      e.target.parentElement.classList.remove('has-logo');
                      e.target.parentElement.classList.add('no-logo');
                    }}
                    onLoad={(e) => {
                      console.log('✅ Logo cargado en modal:', logoUrl);
                      // Asegurar que tenga la clase has-logo
                      e.target.parentElement.classList.add('has-logo');
                      e.target.parentElement.classList.remove('no-logo');
                    }}
                  />
                )}
                <div className="team-logo-placeholder">
                  {team.name?.charAt(0)?.toUpperCase() || 'T'}
                </div>
              </div>


              <div className="team-info">
                <h3>{team.name || 'Nombre no disponible'}</h3>
                <p className="team-sport-modal">
                  {team.sport?.name || team.sport || 'Deporte no especificado'}
                </p>
                {team.category && (
                  <p className="team-category-modal">{team.category}</p>
                )}

                {/* ✅ INFORMACIÓN ADICIONAL DEL EQUIPO */}
                <div className="team-additional-info">
                  {team.coach && (
                    <div className="team-info-item">
                      <span className="info-icon">👨‍🏫</span>
                      <span className="info-text">Entrenador: {team.coach}</span>
                    </div>
                  )}
                  {team.location && (
                    <div className="team-info-item">
                      <span className="info-icon">📍</span>
                      <span className="info-text">Ubicación: {team.location}</span>
                    </div>
                  )}
                  {team.foundedYear && (
                    <div className="team-info-item">
                      <span className="info-icon">📅</span>
                      <span className="info-text">Fundado: {team.foundedYear}</span>
                    </div>
                  )}
                  {team.description && (
                    <div className="team-info-item">
                      <span className="info-icon">📝</span>
                      <span className="info-text">{team.description}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ✅ ESTADÍSTICAS */}
            <div className="team-stats-modal">
              <h4>📊 Estadísticas del Equipo</h4>
              <div className="team-stats-grid">
                <div className="team-stat-item">
                  <span className="team-stat-label-modal">Jugadores:</span>
                  <span className="team-stat-value-modal">{stats.playerCount}</span>
                </div>
                <div className="team-stat-item">
                  <span className="team-stat-label-modal">Partidos:</span>
                  <span className="team-stat-value-modal">{gamesPlayed}</span>
                </div>
                <div className="team-stat-item">
                  <span className="team-stat-label-modal">Victorias:</span>
                  <span className="team-stat-value-modal" style={{ color: '#48bb78' }}>
                    {stats.wins}
                  </span>
                </div>
                <div className="team-stat-item">
                  <span className="team-stat-label-modal">Derrotas:</span>
                  <span className="team-stat-value-modal" style={{ color: '#e53e3e' }}>
                    {stats.losses}
                  </span>
                </div>
                {stats.draws > 0 && (
                  <div className="team-stat-item">
                    <span className="team-stat-label-modal">Empates:</span>
                    <span className="team-stat-value-modal" style={{ color: '#d69e2e' }}>
                      {stats.draws}
                    </span>
                  </div>
                )}
                {gamesPlayed > 0 && (
                  <div className="team-stat-item">
                    <span className="team-stat-label-modal">Efectividad:</span>
                    <span className="team-stat-value-modal" style={{
                      color: winPercentage >= 50 ? '#48bb78' : '#e53e3e'
                    }}>
                      {winPercentage}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ✅ JUGADORES */}
            <div className="team-players-section">
              <h4>👥 Jugadores del Equipo ({stats.playerCount})</h4>

              {loading ? (
                <div className="loading-players">
                  <p>⏳ Cargando jugadores...</p>
                </div>
              ) : teamPlayers.length > 0 ? (
                <div className="team-players-list">
                  {teamPlayers.map(player => (
                    <div key={player._id} className="team-player-item">
                      <div className="player-avatar-small">
                        {player.photo ? (
                          <img src={player.photo} alt={`${player.firstName} ${player.lastName}`} />
                        ) : (
                          <div className="player-avatar-fallback-small">
                            {player.firstName?.[0]}{player.lastName?.[0]}
                          </div>
                        )}
                      </div>
                      <div className="player-info">
                        <span className="team-player-name">
                          {player.firstName} {player.lastName}
                        </span>
                        <span className="team-player-position">
                          {getPrimaryPosition ? getPrimaryPosition(player) : player.positions?.[0]?.position || 'Sin posición'}
                        </span>
                      </div>
                      <button
                        className="team-player-view-btn"
                        onClick={() => handleViewPlayerDetails(player)}
                        title="Ver detalles del jugador"
                      >
                        👁️ Ver
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-players-message">
                  <p>📝 {safeTeamId ? 'Este equipo no tiene jugadores' : 'Error: ID de equipo no disponible'}</p>
                </div>
              )}
            </div>

            {/* ✅ ACCIONES */}
            <div className="team-modal-actions">
              <button
                className="team-btn-edit"
                onClick={() => onEdit(team)}
              >
                ✏️ Editar Equipo
              </button>
              <button
                className="team-btn-delete"
                onClick={() => onDelete(safeTeamId)}
                disabled={!safeTeamId}
              >
                🗑️ Eliminar Equipo
              </button>
              <button
                className="team-btn-cancel"
                onClick={onClose}
              >
                ❌ Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ MODAL DE JUGADOR */}
      {isPlayerModalOpen && (
        <PlayerDetailsModal
          player={selectedPlayer}
          isOpen={isPlayerModalOpen}
          onClose={handleClosePlayerModal}
          getPlayerSport={getPlayerSport}
          getPlayerTeam={getPlayerTeam}
          getPrimaryPosition={getPrimaryPosition}
          calculateAge={calculateAge}
          getPlayerStats={getPlayerStats}
          sports={sports}
          sportPositions={sportPositions}
          teams={teams}
        />
      )}
    </>
  );
};

export default TeamDetailsModal;