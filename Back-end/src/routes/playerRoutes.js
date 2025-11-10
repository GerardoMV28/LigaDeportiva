const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');
const emailController = require('../controllers/emailController');

router.get('/', playerController.getPlayers);
router.get('/positions', playerController.getAllPositions);
router.get('/team/:teamId', playerController.getPlayersByTeam);
router.get('/stats/:teamId', playerController.getTeamPlayerStats);
router.get('/:id', playerController.getPlayerById);
router.post('/', playerController.createPlayer);
router.post('/send-registration-email', emailController.sendRegistrationEmail);
router.put('/:id', playerController.updatePlayer);
router.delete('/:id', playerController.deletePlayer);

module.exports = router;