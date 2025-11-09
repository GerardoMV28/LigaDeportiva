const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');

// GET /api/players - Obtener todos los jugadores
router.get('/', playerController.getPlayers);

// GET /api/players/team/:teamId - Obtener jugadores por equipo
router.get('/team/:teamId', playerController.getPlayersByTeam);

// GET /api/players/stats/:teamId - Obtener estadísticas de jugadores por equipo
router.get('/stats/:teamId', playerController.getTeamPlayerStats);

// GET /api/players/:id - Obtener jugador por ID
router.get('/:id', playerController.getPlayerById);

// POST /api/players - Crear nuevo jugador
router.post('/', playerController.createPlayer);

// PUT /api/players/:id - Actualizar jugador
router.put('/:id', playerController.updatePlayer);

// DELETE /api/players/:id - Eliminar jugador
router.delete('/:id', playerController.deletePlayer);

module.exports = router;