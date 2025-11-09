const Team = require('../models/team');
const Player = require('../models/player');
const Sport = require('../models/sport'); // ✅ Importar el modelo Sport

// Obtener todos los equipos
exports.getTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('sport') // ✅ Popular la información del deporte
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: teams,
      count: teams.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener equipos',
      error: error.message
    });
  }
};

// Crear nuevo equipo
exports.createTeam = async (req, res) => {
  try {
    const { name, colors, sport } = req.body;

    // ✅ Validar que el deporte exista
    if (!sport) {
      return res.status(400).json({
        success: false,
        message: 'El deporte es requerido'
      });
    }

    const sportExists = await Sport.findById(sport);
    if (!sportExists) {
      return res.status(400).json({
        success: false,
        message: 'El deporte seleccionado no existe'
      });
    }

    // ✅ Crear el equipo con el deporte
    const team = new Team({
      name,
      colors: Array.isArray(colors) ? colors : [colors],
      sport
    });

    await team.save();

    // ✅ Popular el deporte para la respuesta
    await team.populate('sport');

    res.status(201).json({
      success: true,
      data: team,
      message: `Equipo "${team.name}" creado exitosamente para ${sportExists.name}`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al crear equipo',
      error: error.message
    });
  }
};

// Obtener equipo por ID con sus jugadores
exports.getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate('sport'); // ✅ Popular deporte
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Equipo no encontrado'
      });
    }

    const players = await Player.find({ team: req.params.id }).sort({ teamInternalId: 1 });

    res.json({
      success: true,
      data: {
        team,
        players
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener equipo',
      error: error.message
    });
  }
};

// Actualizar equipo
exports.updateTeam = async (req, res) => {
  try {
    // ✅ Si se está actualizando el deporte, validar que exista
    if (req.body.sport) {
      const sportExists = await Sport.findById(req.body.sport);
      if (!sportExists) {
        return res.status(400).json({
          success: false,
          message: 'El deporte seleccionado no existe'
        });
      }
    }

    const team = await Team.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('sport'); // ✅ Popular deporte en la respuesta

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Equipo no encontrado'
      });
    }

    res.json({
      success: true,
      data: team,
      message: 'Equipo actualizado exitosamente'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar equipo',
      error: error.message
    });
  }
};

// ✅ NUEVO: Obtener equipos por deporte
exports.getTeamsBySport = async (req, res) => {
  try {
    const { sportId } = req.params;
    
    const sportExists = await Sport.findById(sportId);
    if (!sportExists) {
      return res.status(404).json({
        success: false,
        message: 'Deporte no encontrado'
      });
    }

    const teams = await Team.find({ sport: sportId })
      .populate('sport')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: teams,
      count: teams.length,
      sport: sportExists.name
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener equipos por deporte',
      error: error.message
    });
  }
};