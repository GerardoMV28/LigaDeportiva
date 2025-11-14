import React from 'react';
import './TeamCard.css';

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

const TeamCard = ({ team, onViewDetails, onEdit, onDelete }) => {
  const playerCount = team.players ? team.players.length : team.playerCount || 0;
  const wins = team.gamesWon || team.wins || 0;
  const losses = team.gamesLost || team.losses || 0;
  const draws = team.gamesDrawn || team.draws || 0;
  const gamesPlayed = team.gamesPlayed || (wins + losses + draws);

  const logoUrl = getLogoUrl(team.logo);
  
  console.log('🔍 TeamCard - Logo debug:', {
    team: team.name,
    originalLogo: team.logo,
    processedLogo: logoUrl,
    hasLogo: !!logoUrl
  });

  return (
    <div className="team-card">
      <div className="team-card-header">
       <div className={`team-logo ${logoUrl ? 'has-logo' : 'no-logo'}`}>
  {logoUrl && (
    <img 
      src={logoUrl} 
      alt={`${team.name} logo`}
      className="team-logo-image"
      onError={(e) => {
        console.log('❌ Error cargando logo en TeamCard:', logoUrl);
        e.target.parentElement.classList.remove('has-logo');
        e.target.parentElement.classList.add('no-logo');
      }}
      onLoad={(e) => {
        console.log('✅ Logo cargado exitosamente en TeamCard:', logoUrl);
        e.target.parentElement.classList.add('has-logo');
        e.target.parentElement.classList.remove('no-logo');
      }}
    />
  )}
  <div className="logo-placeholder">
    {team.name?.charAt(0)?.toUpperCase() || 'T'}
  </div>
</div>
        
        <div className="team-actions">
          <button 
            className="team-action-btn team-edit-btn"
            onClick={() => onEdit(team)}
            title="Editar equipo"
          >
            ✏️
          </button>
          <button 
            className="team-action-btn team-delete-btn"
            onClick={() => onDelete(team._id || team.id)}
            title="Eliminar equipo"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="team-card-body">
        <h3 className="team-name">{team.name}</h3>
        <p className="team-sport">
          {team.sport?.name || team.sport || 'Deporte no especificado'}
        </p>
        {team.category && (
          <p className="team-category">{team.category}</p>
        )}
        
        {team.description && (
          <p className="team-description">
            {team.description.length > 100 
              ? `${team.description.substring(0, 100)}...` 
              : team.description
            }
          </p>
        )}

        {/* ✅ INFORMACIÓN RÁPIDA DEL EQUIPO */}
        <div className="team-quick-info">
          {team.coach && (
            <span className="team-info-item">🏆 {team.coach}</span>
          )}
          {team.location && (
            <span className="team-info-item">📍 {team.location}</span>
          )}
          {team.foundedYear && (
            <span className="team-info-item">📅 {team.foundedYear}</span>
          )}
        </div>
      </div>

      <div className="team-card-footer">
        <div className="team-stats">
          <div className="team-stat">
            <span className="team-stat-number" style={{ 
              color: playerCount > 0 ? '#48bb78' : '#a0aec0' 
            }}>
              {playerCount}
            </span>
            <span className="team-stat-label">Jugadores</span>
          </div>
          <div className="team-stat">
            <span className="team-stat-number" style={{ 
              color: wins > 0 ? '#48bb78' : '#a0aec0' 
            }}>
              {wins}
            </span>
            <span className="team-stat-label">Victorias</span>
          </div>
          <div className="team-stat">
            <span className="team-stat-number" style={{ 
              color: losses > 0 ? '#e53e3e' : '#a0aec0' 
            }}>
              {losses}
            </span>
            <span className="team-stat-label">Derrotas</span>
          </div>
          {draws > 0 && (
            <div className="team-stat">
              <span className="team-stat-number" style={{ color: '#d69e2e' }}>
                {draws}
              </span>
              <span className="team-stat-label">Empates</span>
            </div>
          )}
        </div>
        
        <button 
          className="team-view-details-btn"
          onClick={() => onViewDetails(team)}
        >
          {playerCount > 0 ? '👥 Ver Jugadores' : 'Ver Detalles'}
        </button>
      </div>
    </div>
  );
};

export default TeamCard;