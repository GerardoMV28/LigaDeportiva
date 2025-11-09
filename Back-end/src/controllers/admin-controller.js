// controllers/admin-controller.js - NUEVO ARCHIVO
exports.getDashboardStats = (req, res) => {
  console.log('✅ GET /api/admin/stats funcionando!');
  res.json({
    success: true,
    data: {
      totalUsers: 10,
      totalPlayers: 25,
      totalTeams: 5,
      totalGames: 0,
      totalSports: 2
    }
  });
};

exports.getRecentActivity = (req, res) => {
  res.json({
    success: true,
    data: []
  });
};