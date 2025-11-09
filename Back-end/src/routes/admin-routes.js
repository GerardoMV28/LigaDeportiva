// routes/admin-routes.js - NUEVO ARCHIVO
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin-controller');

router.get('/stats', adminController.getDashboardStats);
router.get('/activity', adminController.getRecentActivity);

module.exports = router;