const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { validateTeam } = require('../middleware/validationMiddleware');

// ✅ CAMBIAR: Importar el middleware corregido
const { uploadTeamLogo } = require('../middleware/uploadMiddleware');

router.get('/', teamController.getTeams);
router.get('/:id', teamController.getTeamById);

// ✅ CAMBIAR: Usar uploadTeamLogo en lugar de upload.single('logo')
router.post('/', uploadTeamLogo, (req, res, next) => {
  console.log('🔄 Procesando creación de equipo...');
  console.log('📦 Body recibido:', req.body);
  console.log('🖼️ Archivo recibido:', req.file);
  
  if (req.body.colors && !Array.isArray(req.body.colors)) {
    req.body.colors = [req.body.colors];
  }
  
  if (req.file) {
    // ✅ ACTUALIZAR: Usar la nueva ruta de team-logos
    req.body.logo = `${req.protocol}://${req.get('host')}/uploads/team-logos/${req.file.filename}`;
    console.log('✅ Logo procesado - URL:', req.body.logo);
  } else {
    console.log('⚠️ No se recibió archivo de logo');
    req.body.logo = ''; 
  }
  
  next();
}, validateTeam, teamController.createTeam);

// ✅ CAMBIAR: Usar uploadTeamLogo en lugar de upload.single('logo')
router.put('/:id', uploadTeamLogo, (req, res, next) => {
  console.log('🔄 Procesando actualización de equipo...');
  console.log('📦 Body recibido:', req.body);
  console.log('🖼️ Archivo recibido:', req.file);
  
  if (req.body.colors && !Array.isArray(req.body.colors)) {
    req.body.colors = [req.body.colors];
  }
  
  if (req.file) {
    // ✅ ACTUALIZAR: Usar la nueva ruta de team-logos
    req.body.logo = `${req.protocol}://${req.get('host')}/uploads/team-logos/${req.file.filename}`;
    console.log('✅ Logo actualizado - URL:', req.body.logo);
  }

  next();
}, validateTeam, teamController.updateTeam);

router.get('/sport/:sportId', teamController.getTeamsBySport);
router.delete('/:id', teamController.deleteTeam); 
router.delete('/:id/force', teamController.deleteTeamWithPlayers); 

module.exports = router;