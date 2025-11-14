import React, { useState, useEffect } from 'react';
import TeamCard from './TeamCard';
import TeamDetailsModal from './TeamDetailsModal';
import TeamForm from './TeamForm';
import './Teams.css';

const Teams = () => {
    const [teams, setTeams] = useState([]);
    const [sports, setSports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState(null);
    const [filters, setFilters] = useState({
        sport: '',
        search: ''
    });

    // Cargar datos iniciales
    useEffect(() => {
        fetchTeams();
        fetchSports();
    }, []);

    // Filtrar equipos cuando cambien los filtros
    useEffect(() => {
        fetchTeams();
    }, [filters]);

    const fetchTeams = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (filters.sport) queryParams.append('sport', filters.sport);
            if (filters.search) queryParams.append('search', filters.search);

            const response = await fetch(`http://localhost:4000/api/teams?${queryParams}`);
            const result = await response.json();
            
            if (result.success) {
                setTeams(result.data);
            }
        } catch (error) {
            console.error('Error fetching teams:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSports = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/sports');
            const result = await response.json();
            if (result.success) {
                setSports(result.data);
            }
        } catch (error) {
            console.error('Error fetching sports:', error);
        }
    };

    // Handlers para los modals
    const handleViewDetails = (team) => {
        setSelectedTeam(team);
        setIsDetailsModalOpen(true);
    };

    const handleEditTeam = (team) => {
        setEditingTeam(team);
        setIsFormModalOpen(true);
    };

    const handleCreateTeam = () => {
        setEditingTeam(null);
        setIsFormModalOpen(true);
    };

    const handleDeleteTeam = async (teamId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este equipo?')) {
            try {
                const response = await fetch(`http://localhost:4000/api/teams/${teamId}`, {
                    method: 'DELETE'
                });
                const result = await response.json();
                
                if (result.success) {
                    alert('✅ Equipo eliminado exitosamente');
                    fetchTeams(); // Recargar lista
                } else {
                    alert('❌ Error al eliminar equipo: ' + result.message);
                }
            } catch (error) {
                console.error('Error deleting team:', error);
                alert('❌ Error de conexión');
            }
        }
    };

    const handleTeamCreated = (newTeam) => {
        setIsFormModalOpen(false);
        fetchTeams(); // Recargar lista
    };

    const handleTeamUpdated = (updatedTeam) => {
        setIsFormModalOpen(false);
        setEditingTeam(null);
        fetchTeams(); // Recargar lista
        
        // Si estábamos viendo los detalles, actualizar el equipo seleccionado
        if (selectedTeam && selectedTeam._id === updatedTeam._id) {
            setSelectedTeam(updatedTeam);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            sport: '',
            search: ''
        });
    };

    // Funciones auxiliares para el modal de detalles
    const getPlayerSport = (player) => {
        if (player.team?.sport?.name) return player.team.sport.name;
        return 'No asignado';
    };

    const getPlayerTeam = (player) => {
        if (typeof player.team === 'object') return player.team.name;
        return 'Sin equipo';
    };

    const getPrimaryPosition = (player) => {
        if (!player.positions || player.positions.length === 0) return 'Sin posición';
        const primary = player.positions.find(p => p.isPrimary);
        return primary ? primary.position : player.positions[0].position;
    };

    const calculateAge = (birthDate) => {
        if (!birthDate) return null;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const getPlayerStats = (player) => {
        const stats = player.stats || {};
        return [
            { label: 'Partidos', value: stats.gamesPlayed || 0 },
            { label: 'Goles', value: stats.goals || 0 },
            { label: 'Asistencias', value: stats.assists || 0 },
            { label: 'Amonest.', value: stats.yellowCards || 0 },
            { label: 'Expuls.', value: stats.redCards || 0 }
        ];
    };

    if (loading && teams.length === 0) {
        return (
            <div className="teams-container">
                <div className="loading-spinner">⏳</div>
                <p>Cargando equipos...</p>
            </div>
        );
    }

    return (
        <div className="teams-container">
            <div className="teams-header">
                <h1>🏆 Gestión de Equipos</h1>
                <p>Administra y visualiza todos los equipos del sistema</p>
            </div>

            {/* Filtros */}
            <div className="filters-section">
                <div className="filters-header">
                    <h3>🔍 Filtros de Búsqueda</h3>
                    <button onClick={clearFilters} className="clear-filters-btn">
                        🗑️ Limpiar Filtros
                    </button>
                </div>

                <div className="filters-grid">
                    <div className="filter-group">
                        <label>Buscar por nombre:</label>
                        <input
                            type="text"
                            placeholder="Nombre del equipo..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <div className="filter-group">
                        <label>Filtrar por deporte:</label>
                        <select
                            value={filters.sport}
                            onChange={(e) => handleFilterChange('sport', e.target.value)}
                            className="filter-select"
                        >
                            <option value="">Todos los deportes</option>
                            {sports.map(sport => (
                                <option key={sport._id} value={sport._id}>
                                    {sport.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="quick-stats">
                    <div className="stat-item">
                        <span className="stat-number">{teams.length}</span>
                        <span className="stat-label">Equipos</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">
                            {[...new Set(teams.map(t => t.sport?._id).filter(Boolean))].length}
                        </span>
                        <span className="stat-label">Deportes</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">
                            {teams.reduce((total, team) => total + (team.playerCount || 0), 0)}
                        </span>
                        <span className="stat-label">Jugadores</span>
                    </div>
                </div>
            </div>

            {/* Lista de Equipos */}
            <div className="teams-list-section">
                <div className="section-header">
                    <h3>📋 Lista de Equipos</h3>
                    <div className="header-actions">
                        <span className="results-count">
                            {teams.length} {teams.length === 1 ? 'equipo' : 'equipos'} encontrados
                        </span>
                        <button onClick={handleCreateTeam} className="btn-create-team">
                            ➕ Nuevo Equipo
                        </button>
                    </div>
                </div>

                {teams.length === 0 ? (
                    <div className="no-teams">
                        <div className="no-teams-icon">😕</div>
                        <h4>No se encontraron equipos</h4>
                        <p>Intenta ajustar los filtros de búsqueda o crea un nuevo equipo</p>
                        <button onClick={handleCreateTeam} className="btn-create-first-team">
                            🏆 Crear Primer Equipo
                        </button>
                    </div>
                ) : (
                    <div className="teams-grid">
                        {teams.map(team => (
                            <TeamCard
                                key={team._id}
                                team={team}
                                onViewDetails={handleViewDetails}
                                onEdit={handleEditTeam}
                                onDelete={handleDeleteTeam}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de Detalles */}
            {isDetailsModalOpen && (
                <TeamDetailsModal
                    team={selectedTeam}
                    isOpen={isDetailsModalOpen}
                    onClose={() => setIsDetailsModalOpen(false)}
                    onEdit={handleEditTeam}
                    onDelete={handleDeleteTeam}
                    sports={sports}
                    sportPositions={{}}
                    teams={teams}
                    getPlayerSport={getPlayerSport}
                    getPlayerTeam={getPlayerTeam}
                    getPrimaryPosition={getPrimaryPosition}
                    calculateAge={calculateAge}
                    getPlayerStats={getPlayerStats}
                />
            )}

            {/* Modal de Formulario */}
            {isFormModalOpen && (
                <TeamForm
                    team={editingTeam}
                    onTeamCreated={handleTeamCreated}
                    onTeamUpdated={handleTeamUpdated}
                    onCancel={() => {
                        setIsFormModalOpen(false);
                        setEditingTeam(null);
                    }}
                    isEditing={!!editingTeam}
                />
            )}
        </div>
    );
};

export default Teams;