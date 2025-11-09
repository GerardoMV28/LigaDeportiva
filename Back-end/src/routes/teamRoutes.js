const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { validateTeam } = require('../middleware/validationMiddleware');
const upload = require('../middleware/uploadMiddleware');

// GET /api/teams - Obtener todos los equipos
router.get('/', teamController.getTeams);

// GET /api/teams/:id - Obtener equipo por ID
router.get('/:id', teamController.getTeamById);

// POST /api/teams - Crear nuevo equipo (con soporte para FormData)
router.post('/', upload.single('logo'), (req, res, next) => {
  // Convertir FormData a JSON
  if (req.body.colors && !Array.isArray(req.body.colors)) {
    // Si colors viene como string único, convertirlo a array
    req.body.colors = [req.body.colors];
  }
  
  // Agregar la ruta del logo si se subió
  if (req.file) {
    req.body.logo = `/uploads/${req.file.filename}`;
  }
  
  next();
}, validateTeam, teamController.createTeam);

// PUT /api/teams/:id - Actualizar equipo
router.put('/:id', validateTeam, teamController.updateTeam);

module.exports = router;