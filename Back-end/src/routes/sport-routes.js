// routes/sport-routes.js - NUEVO ARCHIVO
const express = require('express');
const router = express.Router();
const sportController = require('../controllers/sport-controller');

router.get('/', sportController.getSports);
router.get('/:id', sportController.getSportById);
router.get('/:id/positions', sportController.getSportPositions);
router.post('/', sportController.createSport);
router.put('/:id', sportController.updateSport);
router.delete('/:id', sportController.deleteSport);

module.exports = router;