import React, { useState, useEffect } from 'react';
import StatsCard from './StatsCard';
import QuickActionCard from './QuickActionCard';
import ActivityFeed from './ActivityFeed';
import SportsManager from "../SportsComponent/SportsManager"; // ✅ Corregido
import "../../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Obtener estadísticas
      const statsResponse = await fetch('http://localhost:4000/api/admin/stats');
      const statsData = await statsResponse.json();
      
      if (statsData.success) {
        setStats(statsData.data);
      }

      // Obtener actividad reciente
      const activityResponse = await fetch('http://localhost:4000/api/admin/activity');
      const activityData = await activityResponse.json();
      
      if (activityData.success) {
        setRecentActivity(activityData.data);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="dashboard-main">
            {/* Estadísticas Rápidas */}
            <div className="stats-grid">
              <StatsCard 
                title="Total Usuarios" 
                value={stats.totalUsers || 0} 
                icon="👥" 
                color="blue" 
              />
              <StatsCard 
                title="Jugadores" 
                value={stats.totalPlayers || 0} 
                icon="👟" 
                color="green" 
              />
              <StatsCard 
                title="Equipos" 
                value={stats.totalTeams || 0} 
                icon="🏆" 
                color="orange" 
              />
              <StatsCard 
                title="Deportes" 
                value={stats.totalSports || 0} 
                icon="⚽" 
                color="purple" 
              />
            </div>

            {/* Acciones Rápidas */}
            <div className="quick-actions-section">
              <h2>Acciones Rápidas</h2>
              <div className="actions-grid">
                <QuickActionCard 
                  title="Gestión de Usuarios" 
                  description="Administrar todos los usuarios del sistema"
                  icon="👥" 
                  onClick={() => setActiveSection('users')}
                  color="#3498db"
                />
                <QuickActionCard 
                  title="Gestión de Equipos" 
                  description="Crear y administrar equipos"
                  icon="🏆" 
                  onClick={() => setActiveSection('teams')}
                  color="#e74c3c"
                />
                <QuickActionCard 
                  title="Gestión de Jugadores" 
                  description="Administrar jugadores y sus datos"
                  icon="👟" 
                  onClick={() => setActiveSection('players')}
                  color="#2ecc71"
                />
                <QuickActionCard 
                  title="Deportes y Posiciones" 
                  description="Configurar deportes y sus posiciones"
                  icon="⚽" 
                  onClick={() => setActiveSection('sports')}
                  color="#f39c12"
                />
                <QuickActionCard 
                  title="Calendario" 
                  description="Programar y gestionar partidos"
                  icon="📅" 
                  onClick={() => setActiveSection('calendar')}
                  color="#9b59b6"
                />
                <QuickActionCard 
                  title="Reportes" 
                  description="Ver estadísticas y reportes"
                  icon="📊" 
                  onClick={() => setActiveSection('reports')}
                  color="#1abc9c"
                />
              </div>
            </div>

            {/* Actividad Reciente */}
            <ActivityFeed activities={recentActivity} />
          </div>
        );
      
      case 'sports':
        return <SportsManager onBack={() => setActiveSection('dashboard')} />;
      
      default:
        return (
          <div className="coming-soon-section">
            <div className="coming-soon-icon">🚧</div>
            <h2>Sección en Desarrollo</h2>
            <p>La sección {activeSection} estará disponible pronto.</p>
            <button 
              onClick={() => setActiveSection('dashboard')}
              className="back-button"
            >
              Volver al Dashboard
            </button>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard loading">
        <div className="loading-spinner">⏳</div>
        <h2>Cargando Dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-header">
        <h1>👑 Panel de Administración</h1>
        <p>Gestión completa del sistema deportivo</p>
        
        {/* Navegación */}
        <div className="admin-nav">
          <button 
            className={`nav-button ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveSection('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={`nav-button ${activeSection === 'sports' ? 'active' : ''}`}
            onClick={() => setActiveSection('sports')}
          >
            ⚽ Deportes
          </button>
          <button 
            className={`nav-button ${activeSection === 'users' ? 'active' : ''}`}
            onClick={() => setActiveSection('users')}
          >
            👥 Usuarios
          </button>
          <button 
            className={`nav-button ${activeSection === 'players' ? 'active' : ''}`}
            onClick={() => setActiveSection('players')}
          >
            👟 Jugadores
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="admin-content">
        {renderSection()}
      </div>
    </div>
  );
};

export default AdminDashboard;