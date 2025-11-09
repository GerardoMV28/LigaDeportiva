const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET /api/users - Obtener todos los usuarios
router.get('/', userController.getUsers);

// POST /api/users - Crear nuevo usuario
router.post('/', userController.createUser);

module.exports = router;