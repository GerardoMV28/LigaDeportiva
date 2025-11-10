import React, { useState, useEffect } from 'react';
import PlayerForm from '../../components/PlayerComponent/PlayerForm';
import PlayerDetailsModal from '../../components/PlayerComponent/PlayerDetailsModal';
import './Players.css';

const Players = () => {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [sports, setSports] = useState([]);
  const [sportPositions, setSportPositions] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    team: '',
    sport: '',
    position: '',
    search: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);

  useEffect(() => {
    fetchPlayers();
    fetchTeams();
    fetchSports();
  }, []);

  useEffect(() => {
    fetchPlayers();
  }, [filters]);

  // Cargar posiciones cuando los deportes estén disponibles
  useEffect(() => {
    if (sports.length > 0) {
      fetchAllSportPositions();
    }
  }, [sports]);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams();
      if (filters.team) queryParams.append('team', filters.team);
      if (filters.sport) queryParams.append('sport', filters.sport);
      if (filters.position) queryParams.append('position', filters.position);
      
      const response = await fetch(`http://localhost:4000/api/players?${queryParams}`);
      const result = await response.json();
      
      if (result.success) {
        let filteredPlayers = result.data;
        
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredPlayers = filteredPlayers.filter(player => 
            player.firstName?.toLowerCase().includes(searchLower) ||
            player.lastName?.toLowerCase().includes(searchLower) ||
            player.email?.toLowerCase().includes(searchLower) ||
            player.identification?.toLowerCase().includes(searchLower) ||
            player.nickname?.toLowerCase().includes(searchLower)
          );
        }
        
        setPlayers(filteredPlayers);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/teams');
      const result = await response.json();
      
      if (result.success) {
        setTeams(result.data);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchSports = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/sports');
      const result = await response.json();
      
      if (result.success) {
        setSports(result.data);
      }
    } catch (error) {
      console.error('Error fetching sports:', error);
    }
  };

  const fetchAllSportPositions = async () => {
    try {
      console.log('🔄 Cargando posiciones para todos los deportes...');
      const positionsMap = {};
      let loadedCount = 0;
      
      for (const sport of sports) {
        try {
          const response = await fetch(`http://localhost:4000/api/sports/${sport._id}/positions`);
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              positionsMap[sport._id] = result.data;
              loadedCount++;
              console.log(`✅ Posiciones cargadas para ${sport.name}:`, result.data.map(p => ({
                id: p._id,
                name: p.name,
                abbreviation: p.abbreviation
              })));
            } else {
              console.log(`⚠️ No hay posiciones para ${sport.name}`);
              positionsMap[sport._id] = [];
            }
          } else {
            console.log(`❌ Error HTTP para ${sport.name}:`, response.status);
            positionsMap[sport._id] = [];
          }
        } catch (error) {
          console.error(`❌ Error cargando posiciones para ${sport.name}:`, error);
          positionsMap[sport._id] = [];
        }
      }
      
      setSportPositions(positionsMap);
      console.log(`🎯 Carga completada: ${loadedCount}/${sports.length} deportes con posiciones`);
    } catch (error) {
      console.error('💥 Error general cargando posiciones:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      team: '',
      sport: '',
      position: '',
      search: ''
    });
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

  const getPositionName = (player, positionId) => {
    if (!positionId) return 'Sin posición';
    
    const positionIdStr = positionId.toString();

    // Obtener el objeto deporte completo
    const sport = getPlayerSportObject(player);
    
    if (sport?._id) {
      const sportId = sport._id.toString();
      const positions = sportPositions[sportId];
      
      if (positions && positions.length > 0) {
        const position = positions.find(p => {
          const availableId = p._id?.toString();
          return availableId === positionIdStr;
        });
        
        if (position) {
          return `${position.name} (${position.abbreviation})`;
        }
      }
    }

    return 'Posición no especificada';
  };

  const getPrimaryPosition = (player) => {
    if (!player.positions || player.positions.length === 0) {
      return 'Sin posición';
    }
    
    const primary = player.positions.find(p => p.isPrimary);
    
    if (primary) {
      return getPositionName(player, primary.position);
    }
    
    return getPositionName(player, player.positions[0].position);
  };

  // ✅ FUNCIÓN MEJORADA - Manejo robusto del deporte
  const getPlayerSport = (player) => {
    // 1. Intentar desde team.sport (si está poblado)
    if (player.team?.sport?.name) {
      return player.team.sport.name;
    }
    
    // 2. Intentar desde team.sport (si es objeto pero sin name)
    if (player.team?.sport && typeof player.team.sport === 'object') {
      const sportName = player.team.sport.name || sports.find(s => s._id === player.team.sport._id)?.name;
      if (sportName) {
        return sportName;
      }
    }
    
    // 3. Buscar el equipo en la lista de equipos cargados
    if (player.team) {
      let teamId = typeof player.team === 'object' ? player.team._id : player.team;
      const teamWithSport = teams.find(t => t._id === teamId);
      
      if (teamWithSport?.sport?.name) {
        return teamWithSport.sport.name;
      }
    }
    
    return 'No asignado';
  };

  // ✅ FUNCIÓN PARA OBTENER EL OBJETO COMPLETO DEL DEPORTE
  const getPlayerSportObject = (player) => {
    // 1. Intentar desde team.sport
    if (player.team?.sport && typeof player.team.sport === 'object') {
      return player.team.sport;
    }
    
    // 2. Buscar el equipo en la lista de equipos
    if (player.team) {
      let teamId = typeof player.team === 'object' ? player.team._id : player.team;
      const teamWithSport = teams.find(t => t._id === teamId);
      return teamWithSport?.sport || null;
    }
    
    return null;
  };

  const getPlayerTeam = (player) => {
    if (typeof player.team === 'object') {
      return player.team.name || 'Sin equipo';
    }
    
    const team = teams.find(t => t._id === player.team);
    return team?.name || 'Sin equipo';
  };

  // ✅ FUNCIÓN CORREGIDA - Mejor manejo de estadísticas
  const getPlayerStats = (player) => {
    const stats = player.stats || {};
    const sportName = getPlayerSport(player);
    
    // Estadísticas específicas por deporte
    if (sportName === 'Fútbol') {
      return [
        { label: 'Goles', value: stats.goals || 0 },
        { label: 'Asistencias', value: stats.assists || 0 },
        { label: 'Partidos', value: stats.gamesPlayed || 0 },
        { label: 'Amonest.', value: stats.yellowCards || 0 },
        { label: 'Expuls.', value: stats.redCards || 0 }
      ];
    } else if (sportName === 'Baloncesto') {
      return [
        { label: 'Puntos', value: stats.accumulatedPoints || 0 },
        { label: 'Rebotes', value: stats.rebounds || 0 },
        { label: 'Asistencias', value: stats.assists || 0 },
        { label: 'Partidos', value: stats.gamesPlayed || 0 },
        { label: 'Faltas', value: stats.fouls || 0 }
      ];
    } else {
      // Estadísticas generales para otros deportes
      return [
        { label: 'Años Exp.', value: player.yearsOfExperience || 0 },
        { label: 'Puntos', value: stats.accumulatedPoints || 0 },
        { label: 'Partidos G', value: stats.gamesWon || 0 },
        { label: 'Partidos P', value: stats.gamesLost || 0 },
        { label: 'Amonest.', value: stats.individualWarnings || 0 }
      ];
    }
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleCreatePlayer = () => {
    setEditingPlayer(null);
    setShowForm(true);
  };

  const handleEditPlayer = (player) => {
    setEditingPlayer(player);
    setShowForm(true);
  };

  const handleSavePlayer = (savedPlayer) => {
    setShowForm(false);
    setEditingPlayer(null);
    fetchPlayers();
    fetchAllSportPositions();
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingPlayer(null);
  };

  // ✅ FUNCIONES PARA EL MODAL DE DETALLES
  const handleViewDetails = (player) => {
    setSelectedPlayer(player);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlayer(null);
  };

  if (loading && players.length === 0) {
    return (
      <div className="players-container">
        <div className="loading-spinner">⏳</div>
        <p>Cargando jugadores...</p>
      </div>
    );
  }

  return (
    <div className="players-container">
      <div className="players-header">
        <h1>👟 Gestión de Jugadores</h1>
        <p>Administra y visualiza todos los jugadores del sistema</p>
      </div>

      <div className="filters-section">
        <div className="filters-header">
          <h3>🔍 Filtros de Búsqueda</h3>
          <button 
            onClick={clearFilters}
            className="clear-filters-btn"
          >
            🗑️ Limpiar Filtros
          </button>
        </div>

        <div className="filters-grid">
          <div className="filter-group">
            <label>Buscar por nombre, email, apodo o identificación:</label>
            <input
              type="text"
              placeholder="Nombre, apellido, email, apodo o identificación..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <label>Filtrar por equipo:</label>
            <select
              value={filters.team}
              onChange={(e) => handleFilterChange('team', e.target.value)}
              className="filter-select"
            >
              <option value="">Todos los equipos</option>
              {teams.map(team => (
                <option key={team._id} value={team._id}>
                  {team.name} ({team.sport?.name})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Filtrar por deporte:</label>
            <select
              value={filters.sport}
              onChange={(e) => handleFilterChange('sport', e.target.value)}
              className="filter-select"
            >
              <option value="">Todos los deportes</option>
              {sports.map(sport => (
                <option key={sport._id} value={sport._id}>
                  {sport.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="quick-stats">
          <div className="stat-item">
            <span className="stat-number">{players.length}</span>
            <span className="stat-label">Jugadores</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {[...new Set(players.map(p => p.team?._id).filter(Boolean))].length}
            </span>
            <span className="stat-label">Equipos</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {[...new Set(players.map(p => getPlayerSport(p)).filter(Boolean))].length}
            </span>
            <span className="stat-label">Deportes</span>
          </div>
        </div>
      </div>

      <div className="players-list-section">
        <div className="section-header">
          <h3>📋 Lista de Jugadores</h3>
          <div className="header-actions">
            <span className="results-count">
              {players.length} {players.length === 1 ? 'jugador' : 'jugadores'} encontrados
            </span>
            <button 
              onClick={handleCreatePlayer}
              className="btn-create-player"
            >
              ➕ Nuevo Jugador
            </button>
          </div>
        </div>

        {players.length === 0 ? (
          <div className="no-players">
            <div className="no-players-icon">😕</div>
            <h4>No se encontraron jugadores</h4>
            <p>Intenta ajustar los filtros de búsqueda</p>
          </div>
        ) : (
          <div className="players-grid">
            {players.map(player => (
              <div key={player._id} className="player-card">
                <div className="player-header">
                  <div className="player-avatar">
                    {player.photo ? (
                      <img 
                        src={player.photo} 
                        alt={`${player.firstName} ${player.lastName}`} 
                        className="player-photo"
                        onError={(e) => {
                          // Si la imagen falla, mostrar las iniciales
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : null}
                    <div className="player-avatar-fallback">
                      {player.firstName?.[0]}{player.lastName?.[0]}
                    </div>
                  </div>
                  <div className="player-basic-info">
                    <h4>{player.firstName} {player.lastName}</h4>
                    <p className="player-email">{player.email}</p>
                    <p className="player-identification">ID: {player.identification}</p>
                    {player.registrationFolio && (
                      <p className="player-folio">Folio: {player.registrationFolio}</p>
                    )}
                  </div>
                  <div className="player-team-badge">
                    <span className="team-icon">
                      {getSportIcon(getPlayerSport(player))}
                    </span>
                    <span className="team-name">{getPlayerTeam(player)}</span>
                  </div>
                </div>

                <div className="player-sports-info">
                  <div className="info-row">
                    <span className="info-label">Deporte:</span>
                    <span className="info-value">
                      {getPlayerSport(player)}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Posición principal:</span>
                    <span className="info-value">
                      {getPrimaryPosition(player)}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Número:</span>
                    <span className="info-value">
                      {player.jerseyNumber ? `#${player.jerseyNumber}` : 'No asignado'}
                    </span>
                  </div>
                </div>

                <div className="player-personal-info">
                  <div className="info-row">
                    <span className="info-label">Sexo:</span>
                    <span className="info-value">{player.gender || 'No especificado'}</span>
                  </div>
                  {player.nickname && (
                    <div className="info-row">
                      <span className="info-label">Apodo:</span>
                      <span className="info-value">{player.nickname}</span>
                    </div>
                  )}
                  {player.birthCity && (
                    <div className="info-row">
                      <span className="info-label">Ciudad:</span>
                      <span className="info-value">{player.birthCity}</span>
                    </div>
                  )}
                  {player.yearsOfExperience && (
                    <div className="info-row">
                      <span className="info-label">Experiencia:</span>
                      <span className="info-value">{player.yearsOfExperience} años</span>
                    </div>
                  )}
                </div>

                <div className="player-physical-info">
                  <div className="physical-stats">
                    {player.height && (
                      <span className="physical-stat">
                        📏 {player.height}cm
                      </span>
                    )}
                    {player.weight && (
                      <span className="physical-stat">
                        ⚖️ {player.weight}kg
                      </span>
                    )}
                    {player.birthDate && (
                      <span className="physical-stat">
                        🎂 {calculateAge(player.birthDate)} años
                      </span>
                    )}
                    {player.birthDate && (
                      <span className="physical-stat">
                        📅 {new Date(player.birthDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="player-stats">
                  <div className="stats-grid">
                    {getPlayerStats(player).map((stat, index) => (
                      <div key={index} className="stat">
                        <span className="stat-value">{stat.value}</span>
                        <span className="stat-label">{stat.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="player-actions">
                  <button 
                    className="btn-view"
                    onClick={() => handleViewDetails(player)}
                  >
                    👁️ Ver Detalles
                  </button>
                  <button 
                    className="btn-edit"
                    onClick={() => handleEditPlayer(player)}
                  >
                    ✏️ Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <PlayerForm
          player={editingPlayer}
          onSave={handleSavePlayer}
          onCancel={handleCancelForm}
          isEditing={!!editingPlayer}
        />
      )}

      {/* ✅ MODAL DE DETALLES DEL JUGADOR */}
      {isModalOpen && (
        <PlayerDetailsModal
          player={selectedPlayer}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          getPlayerSport={getPlayerSport}
          getPlayerTeam={getPlayerTeam}
          getPrimaryPosition={getPrimaryPosition}
          calculateAge={calculateAge}
          getPlayerStats={getPlayerStats}
        />
      )}
    </div>
  );
};

export default Players;