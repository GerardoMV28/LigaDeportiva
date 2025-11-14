import React, { useState, useEffect } from 'react';
import TeamForm from '../../components/TeamComponent/TeamForm';
import TeamCard from '../../components/TeamComponent/TeamCard';
import TeamDetailsModal from '../../components/TeamComponent/TeamDetailsModal';
import './TeamList.css';

const TeamList = () => {
  const [showForm, setShowForm] = useState(false);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [sports, setSports] = useState([]); // ✅ NUEVO: Estado para deportes
  const [sportPositions, setSportPositions] = useState({}); // ✅ NUEVO: Estado para posiciones
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [error, setError] = useState(null);

  // Cargar equipos, jugadores y deportes
  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:4000/api/teams');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setTeams(result.data);
        fetchPlayers();
        fetchSports(); // ✅ Cargar deportes también
      } else {
        throw new Error(result.message || 'Error al cargar equipos');
      }
    } catch (error) {
      console.error('Error cargando equipos:', error);
      setError(error.message);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Cargar jugadores
  const fetchPlayers = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/players');
      const result = await response.json();
      
      if (result.success) {
        setPlayers(result.data);
      } else {
        console.error('Error cargando jugadores:', result.message);
      }
    } catch (error) {
      console.error('Error de conexión cargando jugadores:', error);
    }
  };

  // ✅ NUEVO: Cargar deportes
  const fetchSports = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/sports');
      const result = await response.json();
      
      if (result.success) {
        setSports(result.data);
        // Una vez cargados los deportes, cargar sus posiciones
        fetchAllSportPositions(result.data);
      }
    } catch (error) {
      console.error('Error fetching sports:', error);
    }
  };

  // ✅ NUEVO: Cargar posiciones de todos los deportes
  const fetchAllSportPositions = async (sportsData = sports) => {
    try {
      const positionsMap = {};
      
      for (const sport of sportsData) {
        try {
          const response = await fetch(`http://localhost:4000/api/sports/${sport._id}/positions`);
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              positionsMap[sport._id] = result.data;
            } else {
              positionsMap[sport._id] = [];
            }
          } else {
            positionsMap[sport._id] = [];
          }
        } catch (error) {
          console.error(`Error cargando posiciones para ${sport.name}:`, error);
          positionsMap[sport._id] = [];
        }
      }
      
      setSportPositions(positionsMap);
    } catch (error) {
      console.error('Error general cargando posiciones:', error);
    }
  };

  // ✅ FUNCIONES NECESARIAS PARA EL MODAL DE JUGADOR

  const getPlayerSport = (player) => {
    if (player.team?.sport?.name) {
      return player.team.sport.name;
    }
    
    if (player.team) {
      let teamId = typeof player.team === 'object' ? player.team._id : player.team;
      const teamWithSport = teams.find(t => t._id === teamId);
      
      if (teamWithSport?.sport?.name) {
        return teamWithSport.sport.name;
      }
    }
    
    return 'No asignado';
  };

  const getPlayerTeam = (player) => {
    if (typeof player.team === 'object') {
      return player.team.name || 'Sin equipo';
    }
    
    const team = teams.find(t => t._id === player.team);
    return team?.name || 'Sin equipo';
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

  // ✅ FUNCIÓN AUXILIAR: Obtener nombre de posición
  const getPositionName = (player, positionId) => {
    if (!positionId) return 'Sin posición';
    
    const positionIdStr = positionId.toString();
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

  // ✅ FUNCIÓN AUXILIAR: Obtener objeto deporte
  const getPlayerSportObject = (player) => {
    if (player.team?.sport && typeof player.team.sport === 'object') {
      return player.team.sport;
    }
    
    if (player.team) {
      let teamId = typeof player.team === 'object' ? player.team._id : player.team;
      const teamWithSport = teams.find(t => t._id === teamId);
      return teamWithSport?.sport || null;
    }
    
    return null;
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

  const getPlayerStats = (player) => {
    const stats = player.stats || {};
    const sportName = getPlayerSport(player);
    
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
      return [
        { label: 'Años Exp.', value: player.yearsOfExperience || 0 },
        { label: 'Puntos', value: stats.accumulatedPoints || 0 },
        { label: 'Partidos G', value: stats.gamesWon || 0 },
        { label: 'Partidos P', value: stats.gamesLost || 0 },
        { label: 'Amonest.', value: stats.individualWarnings || 0 }
      ];
    }
  };

  // ✅ FUNCIÓN: Contar jugadores por equipo
  const getPlayerCountByTeam = (teamId) => {
    return players.filter(player => player.team?._id === teamId || player.team === teamId).length;
  };

  // ✅ FUNCIÓN: Obtener jugadores de un equipo específico
  const getPlayersByTeam = (teamId) => {
    return players.filter(player => player.team?._id === teamId || player.team === teamId);
  };

  // Cargar equipos al iniciar
  useEffect(() => {
    fetchTeams();
  }, []);

  const handleTeamCreated = (newTeam) => {
    console.log('Nuevo equipo creado:', newTeam);
    fetchTeams();
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  // Funciones para TeamCard y TeamDetailsModal
  // En tu TeamList.jsx, REEMPLAZA completamente la función handleViewDetails:
const handleViewDetails = (team) => {
  console.log('🔄 handleViewDetails llamado con team:', team);
  console.log('📋 team._id:', team._id);
  console.log('📋 team.id:', team.id);
  console.log('📋 team completo:', JSON.stringify(team, null, 2));

  // ✅ VERIFICACIÓN ROBUSTA
  if (!team) {
    console.error('❌ Error: team es null o undefined');
    return;
  }

  // ✅ OBTENER EL ID CORRECTO
  const teamId = team._id || team.id;
  console.log('🎯 Team ID a usar:', teamId);

  if (!teamId) {
    console.error('❌ Error: No se pudo obtener team._id o team.id');
    alert('Error: No se pudo cargar la información del equipo');
    return;
  }

  const teamPlayers = getPlayersByTeam(teamId);
  console.log(`👥 Jugadores encontrados para equipo ${teamId}:`, teamPlayers.length);

  const teamWithPlayers = {
    ...team,
    _id: teamId, // ✅ FORZAR que _id exista
    id: teamId,   // ✅ FORZAR que id exista
    playerCount: teamPlayers.length,
    players: teamPlayers
  };
  
  console.log('✅ Team con jugadores listo:', teamWithPlayers);
  setSelectedTeam(teamWithPlayers);
  setShowDetailsModal(true);
};


const getPlayerPositionName = (player) => {
  if (!player.positions || player.positions.length === 0) {
    return 'Sin posición';
  }
  
  const primaryPosition = player.positions.find(p => p.isPrimary);
  const positionToUse = primaryPosition || player.positions[0];
  
  // Usar la función getPositionName que ya tienes
  return getPositionName(player, positionToUse.position);
};

  const handleEditTeam = (team) => {
    console.log('Editar equipo:', team);
    alert(`Funcionalidad de edición para: ${team.name}`);
  };

// En tu TeamList.jsx, ACTUALIZA la función handleDeleteTeam:
const handleDeleteTeam = async (teamId) => {
  if (!teamId) {
    alert('❌ Error: ID del equipo no disponible');
    return;
  }

  try {
    // Primero verificar si el equipo tiene jugadores
    const teamResponse = await fetch(`http://localhost:4000/api/teams/${teamId}`);
    const teamResult = await teamResponse.json();
    
    if (!teamResult.success) {
      alert('❌ Error al obtener información del equipo');
      return;
    }

    const team = teamResult.data?.team || teamResult.data;
    const teamName = team?.name || 'el equipo';
    
    // Verificar cuántos jugadores tiene
    const playersResponse = await fetch(`http://localhost:4000/api/players?team=${teamId}`);
    const playersResult = await playersResponse.json();
    const playersCount = playersResult.data?.length || 0;

    console.log(`👥 El equipo "${teamName}" tiene ${playersCount} jugador(es)`);

    // ✅ MOSTRAR MODAL DE CONFIRMACÓN MEJORADO
    if (playersCount > 0) {
      const userChoice = showDeleteConfirmation(teamName, playersCount);
      
      if (userChoice === 'delete-with-players') {
        await handleForceDeleteTeam(teamId, teamName, playersCount);
      } else if (userChoice === 'delete-only') {
        await handleSimpleDeleteTeam(teamId, teamName);
      }
      // Si es 'cancel', no hacer nada
    } else {
      // No tiene jugadores, eliminar directamente
      await handleSimpleDeleteTeam(teamId, teamName);
    }
  } catch (error) {
    console.error('❌ Error en verificación inicial:', error);
    alert('❌ Error al verificar información del equipo');
  }
};

// ✅ FUNCIÓN PARA MOSTRAR MODAL DE CONFIRMACIÓN PERSONALIZADO
const showDeleteConfirmation = (teamName, playersCount) => {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    font-family: Arial, sans-serif;
  `;

  modal.innerHTML = `
    <div style="
      background: white;
      padding: 30px;
      border-radius: 15px;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      text-align: center;
    ">
      <h2 style="color: #e53e3e; margin: 0 0 15px 0;">⚠️ Eliminar Equipo</h2>
      
      <div style="background: #fff5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #e53e3e;">
        <p style="margin: 0; font-weight: bold; color: #c53030;">
          Estás a punto de eliminar: <strong>"${teamName}"</strong>
        </p>
        <p style="margin: 10px 0 0 0; color: #742a2a;">
          Este equipo tiene <strong>${playersCount} jugador(es)</strong> registrado(s).
        </p>
      </div>

      <div style="margin-bottom: 25px;">
        <p style="color: #4a5568; margin: 0 0 15px 0;">
          <strong>¿Cómo quieres proceder?</strong>
        </p>
        
        <div style="text-align: left; background: #f7fafc; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 10px; cursor: pointer;">
            <input type="radio" name="deleteOption" value="delete-with-players" style="margin-right: 8px;">
            <strong>🗑️ Eliminar equipo Y todos sus jugadores</strong>
            <br>
            <small style="color: #718096; margin-left: 24px;">
              ⚠️ Se eliminarán ${playersCount} jugador(es) permanentemente
            </small>
          </label>
          
          <label style="display: block; margin-bottom: 10px; cursor: pointer;">
            <input type="radio" name="deleteOption" value="delete-only" style="margin-right: 8px;">
            <strong>🚫 Solo eliminar equipo (si no tiene jugadores)</strong>
            <br>
            <small style="color: #718096; margin-left: 24px;">
              ❌ No se puede realizar porque el equipo tiene jugadores
            </small>
          </label>
        </div>
      </div>

      <div style="display: flex; gap: 10px; justify-content: center;">
        <button id="confirmBtn" style="
          background: #e53e3e;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          flex: 1;
        ">Continuar</button>
        
        <button id="cancelBtn" style="
          background: #a0aec0;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          flex: 1;
        ">Cancelar</button>
      </div>
    </div>
  `;

  return new Promise((resolve) => {
    document.body.appendChild(modal);

    const confirmBtn = modal.querySelector('#confirmBtn');
    const cancelBtn = modal.querySelector('#cancelBtn');
    const radioOptions = modal.querySelectorAll('input[name="deleteOption"]');

    // Seleccionar la primera opción por defecto
    radioOptions[0].checked = true;

    const cleanup = () => {
      document.body.removeChild(modal);
    };

    confirmBtn.onclick = () => {
      const selectedOption = modal.querySelector('input[name="deleteOption"]:checked').value;
      cleanup();
      resolve(selectedOption);
    };

    cancelBtn.onclick = () => {
      cleanup();
      resolve('cancel');
    };

    // Cerrar al hacer clic fuera del modal
    modal.onclick = (e) => {
      if (e.target === modal) {
        cleanup();
        resolve('cancel');
      }
    };
  });
};

// ✅ FUNCIÓN PARA ELIMINAR SOLO EL EQUIPO (SI NO TIENE JUGADORES)
const handleSimpleDeleteTeam = async (teamId, teamName) => {
  try {
    const response = await fetch(`http://localhost:4000/api/teams/${teamId}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert(`✅ ${result.message}`);
      fetchTeams();
      setShowDetailsModal(false);
    } else {
      if (result.hasPlayers) {
        // Esto no debería pasar, pero por si acaso
        alert(`❌ ${result.message}\n\nUsa la opción "Eliminar con jugadores"`);
      } else {
        alert(`❌ ${result.message}`);
      }
    }
  } catch (error) {
    console.error('❌ Error eliminando equipo:', error);
    alert('❌ Error de conexión con el servidor');
  }
};

// ✅ FUNCIÓN PARA ELIMINAR EQUIPO CON JUGADORES
const handleForceDeleteTeam = async (teamId, teamName, playersCount) => {
  // Confirmación final antes de eliminar jugadores
  const finalConfirmation = window.confirm(
    `⚠️ CONFIRMACIÓN FINAL\n\n` +
    `Estás a punto de eliminar:\n` +
    `• Equipo: "${teamName}"\n` +
    `• ${playersCount} jugador(es)\n\n` +
    `⚠️ Esta acción NO se puede deshacer.\n\n` +
    `¿Estás completamente seguro?`
  );

  if (!finalConfirmation) {
    alert('Operación cancelada');
    return;
  }

  try {
    const response = await fetch(`http://localhost:4000/api/teams/${teamId}/force`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert(`✅ ${result.message}`);
      fetchTeams();
      setShowDetailsModal(false);
    } else {
      alert(`❌ ${result.message}`);
    }
  } catch (error) {
    console.error('❌ Error en eliminación forzada:', error);
    alert('❌ Error de conexión con el servidor');
  }
};

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedTeam(null);
  };

  const handleRetry = () => {
    fetchTeams();
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
          <h2>⏳ Cargando equipos y jugadores...</h2>
          <p>Conectando con la base de datos</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="team-list-container">
        <div className="error-message">
          <h2>❌ Error al cargar equipos</h2>
          <p>{error}</p>
          <button onClick={handleRetry} className="retry-btn">
            🔄 Reintentar
          </button>
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
        Total de equipos: <strong>{teams.length}</strong> | 
        Total de jugadores registrados: <strong>{players.length}</strong>
      </div>

      {teams.length === 0 ? (
        <div className="no-teams-message">
          <h3>📝 No hay equipos registrados</h3>
          <p>¡Comienza registrando el primer equipo!</p>
          <button 
            className="team-list-add-btn"
            onClick={() => setShowForm(true)}
          >
            ➕ Crear Primer Equipo
          </button>
        </div>
      ) : (
        <div className="team-list-grid">
          {teams.map(team => (
            <TeamCard
              key={team._id}
              team={{
                id: team._id,
                name: team.name,
                sport: team.sport?.name || 'Sin deporte asignado',
                category: team.category || 'General',
                description: team.description,
                playerCount: getPlayerCountByTeam(team._id),
                wins: team.gamesWon || team.wins || 0,
                losses: team.gamesLost || team.losses || 0,
                logo: team.logo,
                colors: team.colors || []
              }}
              onViewDetails={handleViewDetails}
              onEdit={handleEditTeam}
              onDelete={handleDeleteTeam}
            />
          ))}
        </div>
      )}

      {/* Modal de Detalles */}
      <TeamDetailsModal
        team={selectedTeam}
        isOpen={showDetailsModal}
        onClose={closeDetailsModal}
        onEdit={handleEditTeam}
        onDelete={handleDeleteTeam}
        sports={sports}
        sportPositions={sportPositions}
        teams={teams}
        getPlayerSport={getPlayerSport}
        getPlayerTeam={getPlayerTeam}
        getPrimaryPosition={getPrimaryPosition}
        calculateAge={calculateAge}
        getPlayerStats={getPlayerStats}
      />
    </div>
  );
};

export default TeamList;