const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');
const { validatePlayer } = require('../middleware/validationMiddleware');

// Ruta para obtener todos los jugadores
router.get('/', playerController.getPlayers);

// Ruta para obtener un jugador por ID
router.get('/:id', playerController.getPlayerById);

// Ruta para crear un nuevo jugador
router.post('/', validatePlayer, playerController.createPlayer);

module.exports = router;