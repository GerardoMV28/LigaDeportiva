import React, { useState, useEffect } from 'react';
import './SportsManager.css'; // Crea este archivo para los estilos específicos

const SportsManager = ({ onBack }) => {
  const [sports, setSports] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSport, setEditingSport] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    positions: []
  });
  const [newPosition, setNewPosition] = useState({
    name: '',
    abbreviation: '',
    description: ''
  });

  useEffect(() => {
    fetchSports();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingSport 
        ? `http://localhost:4000/api/sports/${editingSport._id}`
        : 'http://localhost:4000/api/sports';
      
      const method = editingSport ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        setShowForm(false);
        setEditingSport(null);
        setFormData({ name: '', description: '', positions: [] });
        setNewPosition({ name: '', abbreviation: '', description: '' });
        fetchSports();
      }
    } catch (error) {
      console.error('Error saving sport:', error);
    }
  };

  const addPosition = () => {
    if (!newPosition.name.trim() || !newPosition.abbreviation.trim()) {
      alert('El nombre y la abreviatura de la posición son requeridos');
      return;
    }

    setFormData(prev => ({
      ...prev,
      positions: [...prev.positions, {
        name: newPosition.name.trim(),
        abbreviation: newPosition.abbreviation.trim().toUpperCase(),
        description: newPosition.description.trim()
      }]
    }));

    // Limpiar el formulario de nueva posición
    setNewPosition({ name: '', abbreviation: '', description: '' });
  };

  const removePosition = (index) => {
    setFormData(prev => ({
      ...prev,
      positions: prev.positions.filter((_, i) => i !== index)
    }));
  };

  const deleteSport = async (sportId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este deporte?')) {
      try {
        const response = await fetch(`http://localhost:4000/api/sports/${sportId}`, {
          method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
          fetchSports();
        }
      } catch (error) {
        console.error('Error deleting sport:', error);
      }
    }
  };

  const startEditing = (sport) => {
    setEditingSport(sport);
    setFormData({
      name: sport.name,
      description: sport.description || '',
      positions: sport.positions || []
    });
    setShowForm(true);
  };

  return (
    <div className="sports-manager">
      <div className="section-header">
        <button onClick={onBack} className="back-button">← Volver al Dashboard</button>
        <h2>⚽ Gestión de Deportes</h2>
        <button 
          className="btn-primary"
          onClick={() => {
            setEditingSport(null);
            setFormData({ name: '', description: '', positions: [] });
            setNewPosition({ name: '', abbreviation: '', description: '' });
            setShowForm(true);
          }}
        >
          ➕ Agregar Deporte
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="form-overlay">
          <div className="form-container">
            <h3>{editingSport ? 'Editar' : 'Nuevo'} Deporte</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre del Deporte *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Ej: Fútbol, Baloncesto, Voleibol"
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                  placeholder="Descripción del deporte..."
                />
              </div>

              {/* Sección de Posiciones - MEJORADA */}
              <div className="positions-section">
                <div className="positions-header">
                  <h4>Posiciones del Deporte</h4>
                  <span className="positions-count">
                    {formData.positions.length} posición(es) agregada(s)
                  </span>
                </div>

                {/* Formulario para agregar nueva posición */}
                <div className="add-position-form">
                  <h5>Agregar Nueva Posición</h5>
                  <div className="position-inputs">
                    <input
                      type="text"
                      placeholder="Nombre (ej: Delantero)"
                      value={newPosition.name}
                      onChange={(e) => setNewPosition(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <input
                      type="text"
                      placeholder="Abreviatura (ej: DEL)"
                      value={newPosition.abbreviation}
                      onChange={(e) => setNewPosition(prev => ({ ...prev, abbreviation: e.target.value }))}
                      maxLength="5"
                      style={{ textTransform: 'uppercase' }}
                    />
                    <input
                      type="text"
                      placeholder="Descripción (opcional)"
                      value={newPosition.description}
                      onChange={(e) => setNewPosition(prev => ({ ...prev, description: e.target.value }))}
                    />
                    <button
                      type="button"
                      onClick={addPosition}
                      className="btn-add-position"
                      disabled={!newPosition.name.trim() || !newPosition.abbreviation.trim()}
                    >
                      ➕ Agregar
                    </button>
                  </div>
                </div>

                {/* Lista de posiciones agregadas */}
                {formData.positions.length > 0 ? (
                  <div className="positions-list">
                    <h5>Posiciones Agregadas:</h5>
                    <div className="positions-grid">
                      {formData.positions.map((position, index) => (
                        <div key={index} className="position-card">
                          <div className="position-info">
                            <strong>{position.name}</strong>
                            <span className="position-abbr">({position.abbreviation})</span>
                            {position.description && (
                              <p className="position-desc">{position.description}</p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removePosition(index)}
                            className="btn-remove-position"
                            title="Eliminar posición"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="no-positions">
                    <p>No hay posiciones agregadas. Agrega al menos una posición.</p>
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={formData.positions.length === 0}
                >
                  {editingSport ? 'Actualizar' : 'Crear'} Deporte
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingSport(null);
                    setFormData({ name: '', description: '', positions: [] });
                    setNewPosition({ name: '', abbreviation: '', description: '' });
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de Deportes - MEJORADA */}
      <div className="sports-grid">
        {sports.length === 0 ? (
          <div className="no-sports">
            <p>No hay deportes registrados. ¡Agrega el primero!</p>
          </div>
        ) : (
          sports.map(sport => (
            <div key={sport._id} className="sport-card">
              <div className="sport-header">
                <h3>{sport.name}</h3>
                <div className="sport-actions">
                  <button 
                    onClick={() => startEditing(sport)}
                    className="btn-edit"
                    title="Editar deporte"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => deleteSport(sport._id)}
                    className="btn-danger"
                    title="Eliminar deporte"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              {sport.description && (
                <p className="sport-description">{sport.description}</p>
              )}

              <div className="positions-summary">
                <h4>Posiciones ({sport.positions?.length || 0})</h4>
                {sport.positions && sport.positions.length > 0 ? (
                  <div className="positions-tags">
                    {sport.positions.map((position, index) => (
                      <div key={index} className="position-tag">
                        <span className="position-name">{position.name}</span>
                        <span className="position-abbr">{position.abbreviation}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-positions-text">Sin posiciones definidas</p>
                )}
              </div>

              <div className="sport-meta">
                <span className="created-date">
                  Creado: {new Date(sport.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SportsManager;