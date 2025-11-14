import React from 'react';
import './PlayerDetailsModal.css';

const PlayerDetailsModal = ({ player, isOpen, onClose, getPlayerSport, getPlayerTeam, getPrimaryPosition, calculateAge, getPlayerStats, sports, sportPositions, teams }) => {
  if (!isOpen || !player) return null;

  // Agrega esto justo después del if (!isOpen || !player) return null;
  console.log('Datos del jugador en el modal:', player);
  console.log('Posiciones del jugador:', player.positions);
  console.log('Estructura de las posiciones:', player.positions);
  console.log('Primera posición:', player.positions[0]);
  console.log('Segunda posición:', player.positions[1]);

  const stats = getPlayerStats(player);
  const age = calculateAge(player.birthDate);

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

  // Función simplificada para obtener el nombre de la posición por ID
  const getPositionName = (positionId) => {
    if (!positionId) return 'Sin posición';
    
    const positionIdStr = positionId.toString();

    // Buscar en todos los deportes
    for (const sport of sports) {
      const sportId = sport._id.toString();
      const positions = sportPositions[sportId];
      
      if (positions && positions.length > 0) {
        const position = positions.find(p => {
          const availableId = p._id?.toString();
          return availableId === positionIdStr;
        });
        
        if (position) {
          return `${position.name}`;
        }
      }
    }

    return 'Posición no especificada';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header del Modal */}
        <div className="modal-header">
<div className="player-modal-avatar">
  {player.photo ? (
    <img 
      src={player.photo} 
      alt={`${player.firstName} ${player.lastName}`} 
      className="player-modal-photo"
      onError={(e) => {
        // Si la imagen falla al cargar, mostrar el avatar de fallback
        e.target.style.display = 'none';
        e.target.nextSibling.style.display = 'flex';
      }}
    />
  ) : null}
  <div 
    className={`player-modal-avatar-fallback ${player.photo ? 'hidden' : ''}`}
  >
    {player.firstName?.[0]}{player.lastName?.[0]}
  </div>
</div>
          <div className="player-modal-basic-info">
            <h2>{player.firstName} {player.lastName}</h2>
            <p className="player-modal-email">{player.email}</p>
            <p className="player-modal-team">
              <span className="team-icon">{getSportIcon(getPlayerSport(player))}</span>
              {getPlayerTeam(player)}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="modal-sections">
            {/* Información Personal */}
            <div className="modal-section">
              <h3>👤 Información Personal</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Nombre completo:</span>
                  <span className="info-value">{player.firstName} {player.lastName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{player.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Teléfono:</span>
                  <span className="info-value">{player.phone || 'No especificado'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Sexo:</span>
                  <span className="info-value">{player.gender || 'No especificado'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Fecha de nacimiento:</span>
                  <span className="info-value">
                    {player.birthDate ? new Date(player.birthDate).toLocaleDateString() : 'No especificado'} 
                    {age && ` (${age} años)`}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Ciudad de nacimiento:</span>
                  <span className="info-value">{player.birthCity || 'No especificado'}</span>
                </div>
                {player.nickname && (
                  <div className="info-item">
                    <span className="info-label">Apodo:</span>
                    <span className="info-value">{player.nickname}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Información Deportiva */}
            <div className="modal-section">
              <h3>⚽ Información Deportiva</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Deporte:</span>
                  <span className="info-value">{getPlayerSport(player)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Equipo:</span>
                  <span className="info-value">{getPlayerTeam(player)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Posición principal:</span>
                  <span className="info-value">{getPrimaryPosition(player)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Número de camiseta:</span>
                  <span className="info-value">
                    {player.jerseyNumber ? `#${player.jerseyNumber}` : 'No asignado'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Años de experiencia:</span>
                  <span className="info-value">{player.yearsOfExperience || 0} años</span>
                </div>
                <div className="info-item">
                  <span className="info-label">ID de registro:</span>
                  <span className="info-value">{player.teamInternalId || 'No asignado'}</span>
                </div>
              </div>
            </div>

            {/* Características Físicas */}
            <div className="modal-section">
              <h3>💪 Características Físicas</h3>
              <div className="physical-info-grid">
                {player.height && (
                  <div className="physical-item">
                    <span className="physical-icon">📏</span>
                    <span className="physical-value">{player.height} cm</span>
                    <span className="physical-label">Estatura</span>
                  </div>
                )}
                {player.weight && (
                  <div className="physical-item">
                    <span className="physical-icon">⚖️</span>
                    <span className="physical-value">{player.weight} kg</span>
                    <span className="physical-label">Peso</span>
                  </div>
                )}
                {player.birthDate && age && (
                  <div className="physical-item">
                    <span className="physical-icon">🎂</span>
                    <span className="physical-value">{age} años</span>
                    <span className="physical-label">Edad</span>
                  </div>
                )}
              </div>
            </div>

            {/* Preferencias Personales */}
            {(player.hobbies || player.favoriteMusic || player.socialMedia) && (
              <div className="modal-section">
                <h3>🌟 Preferencias Personales</h3>
                <div className="info-grid">
                  {player.hobbies && (
                    <div className="info-item">
                      <span className="info-label">Pasatiempos:</span>
                      <span className="info-value">{player.hobbies}</span>
                    </div>
                  )}
                  {player.favoriteMusic && (
                    <div className="info-item">
                      <span className="info-label">Música favorita:</span>
                      <span className="info-value">{player.favoriteMusic}</span>
                    </div>
                  )}
                  {player.socialMedia && (
                    <div className="info-item">
                      <span className="info-label">Redes sociales:</span>
                      <span className="info-value">{player.socialMedia}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Estadísticas */}
            <div className="modal-section">
              <h3>📊 Estadísticas</h3>
              <div className="stats-grid-modal">
                {stats.map((stat, index) => (
                  <div key={index} className="stat-modal">
                    <span className="stat-value-modal">{stat.value}</span>
                    <span className="stat-label-modal">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Posiciones */}
            {player.positions && player.positions.length > 0 && (
              <div className="modal-section">
                <h3>🎯 Posiciones</h3>
                <div className="positions-list-modal">
                  {player.positions.map((pos, index) => (
                    <div key={index} className="position-item-modal">
                      <span className="position-name-modal">
                        {pos.isPrimary ? '⭐ ' : ''}
                        {getPositionName(pos.position)} {/* CAMBIADO: usa la nueva función */}
                      </span>
                      <span className="position-type-modal">
                        {pos.isPrimary ? 'Principal' : 'Secundaria'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-close-modal" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerDetailsModal;