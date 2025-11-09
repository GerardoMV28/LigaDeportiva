const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { validateTeam } = require('../middleware/validationMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', teamController.getTeams);

router.get('/:id', teamController.getTeamById);

router.post('/', upload.single('logo'), (req, res, next) => {

  if (req.body.colors && !Array.isArray(req.body.colors)) {
    req.body.colors = [req.body.colors];
  }
  
  if (req.file) {
    req.body.logo = `/uploads/${req.file.filename}`;
  }
  
  next();
}, validateTeam, teamController.createTeam);

router.put('/:id', validateTeam, teamController.updateTeam);
router.get('/sport/:sportId', teamController.getTeamsBySport);

module.exports = router;