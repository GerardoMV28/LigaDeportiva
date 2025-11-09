const Team = require('../models/team');
const Player = require('../models/player');

// Obtener todos los equipos
exports.getTeams = async (req, res) => {
  try {
    const teams = await Team.find().sort({ createdAt: -1 });
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
    const team = new Team(req.body);
    await team.save();
    
    res.status(201).json({
      success: true,
      data: team,
      message: 'Equipo creado exitosamente'
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
    const team = await Team.findById(req.params.id);
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

// Actualizar equipo (AGREGAR ESTA FUNCIÓN)
exports.updateTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

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