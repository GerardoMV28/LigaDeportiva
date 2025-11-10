const Player = require('../models/player');
const Team = require('../models/team');
const Sport = require('../models/sport');
const mongoose = require('mongoose');

// Obtener todos los jugadores
exports.getPlayers = async (req, res) => {
  try {
    const { team, sport, position } = req.query;
    
    let filter = {};
    
    if (team) filter.team = team;
    if (position) filter['positions.position'] = position;
    
    if (sport) {
      const teams = await Team.find({ sport }).select('_id');
      const teamIds = teams.map(team => team._id);
      filter.team = { $in: teamIds };
    }
    
    const players = await Player.find(filter)
      .populate('team')
      .populate('team.sport')
      .sort({ lastName: 1, firstName: 1 });
    
    res.json({
      success: true,
      data: players,
      count: players.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener jugadores',
      error: error.message
    });
  }
};

// Obtener jugador por ID
exports.getPlayerById = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id)
      .populate('team')
      .populate('team.sport');
    
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Jugador no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: player
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener jugador',
      error: error.message
    });
  }
};

// Crear nuevo jugador CON SISTEMA DE FOLIOS
exports.createPlayer = async (req, res) => {
  try {
    const { team, positions, ...playerData } = req.body;
    
    // Validar que el equipo exista
    const teamExists = await Team.findById(team).populate('sport');
    if (!teamExists) {
      return res.status(400).json({
        success: false,
        message: 'El equipo seleccionado no existe'
      });
    }
    
    // ✅ GENERAR FOLIO AUTOMÁTICO
    // Contar jugadores existentes en el equipo para el consecutivo
    const playersInTeam = await Player.countDocuments({ team });
    const teamConsecutive = (playersInTeam + 1).toString().padStart(3, '0');
    const internalConsecutive = (playersInTeam + 1).toString().padStart(3, '0');
    
    // Generar folio: NombreEquipo-001-Nombre-001
    const teamNameClean = teamExists.name.replace(/\s+/g, '');
    const firstNameClean = playerData.firstName.replace(/\s+/g, '');
    let registrationFolio = `${teamNameClean}-${teamConsecutive}-${firstNameClean}-${internalConsecutive}`;
    
    // Validar que el folio sea único
    const existingFolio = await Player.findOne({ registrationFolio });
    if (existingFolio) {
      // Si hay duplicado, agregar timestamp
      const timestamp = Date.now().toString().slice(-3);
      registrationFolio = `${teamNameClean}-${teamConsecutive}-${firstNameClean}-${timestamp}`;
    }
    
    // Validar que el ID interno sea único en el equipo
    const existingPlayer = await Player.findOne({
      team,
      teamInternalId: playerData.teamInternalId
    });
    
    if (existingPlayer) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un jugador con ese ID interno en el equipo'
      });
    }
    
    // Validar posiciones contra el deporte del equipo
    if (positions && positions.length > 0) {
      const sportPositions = teamExists.sport.positions || [];
      const sportPositionIds = sportPositions.map(p => p._id ? p._id.toString() : p);
      
      console.log('Available sport positions:', sportPositionIds);
      console.log('Player positions to validate:', positions);

      for (const pos of positions) {
        if (!sportPositionIds.includes(pos.position)) {
          console.log(`Invalid position: ${pos.position} for sport ${teamExists.sport.name}`);
          return res.status(400).json({
            success: false,
            message: `La posición ${pos.position} no es válida para el deporte ${teamExists.sport.name}`
          });
        }
      }
      
      // Validar que solo haya una posición principal
      const primaryPositions = positions.filter(p => p.isPrimary);
      if (primaryPositions.length > 1) {
        return res.status(400).json({
          success: false,
          message: 'Solo puede haber una posición principal'
        });
      }
    }
    
    const player = new Player({
      ...playerData,
      team,
      positions: positions || [],
      registrationFolio // ✅ ASIGNAR FOLIO AUTOMÁTICO
    });
    
    await player.save();
    await player.populate('team');
    await player.populate('team.sport');
    
    res.status(201).json({
      success: true,
      data: player,
      message: 'Jugador creado exitosamente'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al crear jugador',
      error: error.message
    });
  }
};

// Actualizar jugador
exports.updatePlayer = async (req, res) => {
  try {
    const { positions, ...updateData } = req.body;
    
    const player = await Player.findById(req.params.id).populate('team');
    
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Jugador no encontrado'
      });
    }
    
    // Validar posiciones si se están actualizando
    if (positions) {
      const team = await Team.findById(player.team).populate('sport');
      const sportPositions = team.sport.positions || [];
      const sportPositionIds = sportPositions.map(p => p._id ? p._id.toString() : p);
      
      for (const pos of positions) {
        if (!sportPositionIds.includes(pos.position)) {
          return res.status(400).json({
            success: false,
            message: `La posición ${pos.position} no es válida para el deporte ${team.sport.name}`
          });
        }
      }
      
      // Validar que solo haya una posición principal
      const primaryPositions = positions.filter(p => p.isPrimary);
      if (primaryPositions.length > 1) {
        return res.status(400).json({
          success: false,
          message: 'Solo puede haber una posición principal'
        });
      }
      
      updateData.positions = positions;
    }
    
    const updatedPlayer = await Player.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('team')
      .populate('team.sport');
    
    res.json({
      success: true,
      data: updatedPlayer,
      message: 'Jugador actualizado exitosamente'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar jugador',
      error: error.message
    });
  }
};

// Eliminar jugador
exports.deletePlayer = async (req, res) => {
  try {
    const player = await Player.findByIdAndDelete(req.params.id);
    
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Jugador no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Jugador eliminado exitosamente',
      data: player
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar jugador',
      error: error.message
    });
  }
};

// Obtener jugadores por equipo
exports.getPlayersByTeam = async (req, res) => {
  try {
    const players = await Player.find({ team: req.params.teamId })
      .populate('team')
      .populate('team.sport')
      .sort({ teamInternalId: 1 });
    
    res.json({
      success: true,
      data: players,
      count: players.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener jugadores del equipo',
      error: error.message
    });
  }
};

// Obtener estadísticas de jugadores por equipo
exports.getTeamPlayerStats = async (req, res) => {
  try {
    const teamId = req.params.teamId;
    
    const stats = await Player.aggregate([
      { $match: { team: mongoose.Types.ObjectId(teamId) } },
      {
        $group: {
          _id: '$team',
          totalPlayers: { $sum: 1 },
          averageAge: { $avg: '$age' },
          averageHeight: { $avg: '$height' },
          averageWeight: { $avg: '$weight' },
          totalGoals: { $sum: '$stats.goals' },
          totalAssists: { $sum: '$stats.assists' },
          totalGames: { $sum: '$stats.gamesPlayed' }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: stats[0] || {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas del equipo',
      error: error.message
    });
  }
};

// Obtener todas las posiciones disponibles
exports.getAllPositions = async (req, res) => {
  try {
    const allPositions = {
      'Fútbol': [
        { _id: 'portero', name: 'Portero', abbreviation: 'POR' },
        { _id: 'defensa_central', name: 'Defensa Central', abbreviation: 'DFC' },
        { _id: 'lateral_derecho', name: 'Lateral Derecho', abbreviation: 'LD' },
        { _id: 'lateral_izquierdo', name: 'Lateral Izquierdo', abbreviation: 'LI' },
        { _id: 'mediocentro', name: 'Mediocentro', abbreviation: 'MC' },
        { _id: 'mediocentro_defensivo', name: 'Mediocentro Defensivo', abbreviation: 'MCD' },
        { _id: 'mediocentro_ofensivo', name: 'Mediocentro Ofensivo', abbreviation: 'MCO' },
        { _id: 'extremo_derecho', name: 'Extremo Derecho', abbreviation: 'ED' },
        { _id: 'extremo_izquierdo', name: 'Extremo Izquierdo', abbreviation: 'EI' },
        { _id: 'delantero_centro', name: 'Delantero Centro', abbreviation: 'DC' }
      ],
      'Baloncesto': [
        { _id: 'base', name: 'Base', abbreviation: 'B' },
        { _id: 'escolta', name: 'Escolta', abbreviation: 'E' },
        { _id: 'alero', name: 'Alero', abbreviation: 'A' },
        { _id: 'ala_pivot', name: 'Ala-Pívot', abbreviation: 'AP' },
        { _id: 'pivot', name: 'Pívot', abbreviation: 'P' }
      ],
      'Natación': [
        { _id: 'estilo_libre', name: 'Estilo Libre', abbreviation: 'LIBRE' },
        { _id: 'mariposa', name: 'Mariposa', abbreviation: 'MARIP' },
        { _id: 'espalda', name: 'Espalda', abbreviation: 'ESPAL' },
        { _id: 'braza', name: 'Braza/Pecho', abbreviation: 'BRAZA' }
      ],
      'Tenis': [
        { _id: 'individual', name: 'Individual', abbreviation: 'IND' },
        { _id: 'dobles', name: 'Dobles', abbreviation: 'DOB' },
        { _id: 'dobles_mixtos', name: 'Dobles Mixtos', abbreviation: 'DM' }
      ],
      'Voleibol': [
        { _id: 'colocador', name: 'Colocador', abbreviation: 'COL' },
        { _id: 'opuesto', name: 'Opuesto', abbreviation: 'OPU' },
        { _id: 'central', name: 'Central', abbreviation: 'CEN' },
        { _id: 'receptor_atacante', name: 'Receptor-Atacante', abbreviation: 'RA' },
        { _id: 'libero', name: 'Líbero', abbreviation: 'LIB' }
      ],
      'Atletismo': [
        { _id: 'velocidad', name: 'Velocidad', abbreviation: 'VEL' },
        { _id: 'medio_fondo', name: 'Medio Fondo', abbreviation: 'MF' },
        { _id: 'fondo', name: 'Fondo', abbreviation: 'FON' },
        { _id: 'vallas', name: 'Vallas', abbreviation: 'VAL' }
      ]
    };

    res.json({
      success: true,
      data: allPositions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener posiciones',
      error: error.message
    });
  }
};