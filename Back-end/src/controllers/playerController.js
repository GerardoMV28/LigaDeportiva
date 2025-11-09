const Player = require('../models/player');
const Team = require('../models/team');
const { generateFolio } = require('../middleware/folioMiddleware');

// Obtener todos los jugadores
exports.getPlayers = async (req, res) => {
  try {
    const players = await Player.find()
      .populate('team', 'name colors')
      .sort({ createdAt: -1 });
    
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

// Crear nuevo jugador
exports.createPlayer = async (req, res) => {
  try {
    const { team } = req.body;

    // Obtener el próximo internal ID para el equipo
    const lastPlayer = await Player.findOne({ team }).sort({ teamInternalId: -1 });
    const teamInternalId = lastPlayer ? lastPlayer.teamInternalId + 1 : 1;

    // Generar folio
    const registrationFolio = await generateFolio(team, req.body.firstName, teamInternalId);

    const playerData = {
      ...req.body,
      teamInternalId,
      registrationFolio
    };

    const player = new Player(playerData);
    await player.save();

    // Actualizar contador de amonestaciones del equipo
    await Team.findByIdAndUpdate(team, {
      $inc: { totalWarnings: player.individualWarnings || 0 }
    });

    // Aquí iría el envío de correo (implementar después)
    
    res.status(201).json({
      success: true,
      data: player,
      message: 'Jugador registrado exitosamente'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al crear jugador',
      error: error.message
    });
  }
};

// Obtener jugador por ID
exports.getPlayerById = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id)
      .populate('team', 'name colors gamesWon gamesLost');
    
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