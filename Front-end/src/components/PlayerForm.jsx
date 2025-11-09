import React, { useState, useEffect } from 'react';
import './PlayerForm.css';

const PlayerForm = ({ onPlayerCreated, onCancel }) => {
  const [formData, setFormData] = useState({
    // Datos personales
    firstName: '',
    lastName: '',
    sex: '',
    birthDate: '',
    weight: '',
    height: '',
    nickname: '',
    position: '',
    photo: null,
    birthCity: '',
    
    // Datos deportivos
    yearsInSport: '',
    individualWarnings: 0,
    points: 0,
    email: '',
    
    // Información personal adicional
    hobbies: [],
    favoriteMusic: '',
    socialMedia: {
      twitter: '',
      instagram: '',
      facebook: ''
    },
    favoritePlayer: '',
    
    // Relación con equipo
    team: ''
  });

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentHobby, setCurrentHobby] = useState('');
  const [previewPhoto, setPreviewPhoto] = useState(null);

  // Cargar equipos disponibles
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/teams');
        const result = await response.json();
        
        if (result.success) {
          setTeams(result.data);
        }
      } catch (error) {
        console.error('Error cargando equipos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('socialMedia.')) {
      const socialField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [socialField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewPhoto(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addHobby = () => {
    if (currentHobby.trim() && !formData.hobbies.includes(currentHobby.trim())) {
      setFormData(prev => ({
        ...prev,
        hobbies: [...prev.hobbies, currentHobby.trim()]
      }));
      setCurrentHobby('');
    }
  };

  const removeHobby = (hobbyToRemove) => {
    setFormData(prev => ({
      ...prev,
      hobbies: prev.hobbies.filter(hobby => hobby !== hobbyToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.team) {
      alert('Por favor selecciona un equipo');
      return;
    }

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      alert('Por favor ingresa el nombre completo del jugador');
      return;
    }

    if (!formData.email.trim()) {
      alert('Por favor ingresa el email del jugador');
      return;
    }

    try {
      // Preparar datos para enviar
      const playerData = {
        ...formData,
        weight: parseFloat(formData.weight) || 0,
        height: parseFloat(formData.height) || 0,
        yearsInSport: parseInt(formData.yearsInSport) || 0,
        individualWarnings: parseInt(formData.individualWarnings) || 0,
        points: parseInt(formData.points) || 0
      };

      console.log('Enviando datos del jugador:', playerData);

      // Llamar a la API del backend
      const response = await fetch('http://localhost:4000/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(playerData)
      });

      const result = await response.json();

      if (result.success) {
        alert('✅ Jugador registrado exitosamente!');
        
        if (onPlayerCreated) {
          onPlayerCreated(result.data);
        }
        
        // Resetear formulario
        setFormData({
          firstName: '', lastName: '', sex: '', birthDate: '', weight: '', height: '',
          nickname: '', position: '', photo: null, birthCity: '', yearsInSport: '',
          individualWarnings: 0, points: 0, email: '', hobbies: [], favoriteMusic: '',
          socialMedia: { twitter: '', instagram: '', facebook: '' }, favoritePlayer: '', team: ''
        });
        setPreviewPhoto(null);
        setCurrentHobby('');
        
      } else {
        alert(`❌ Error: ${result.message}`);
      }
      
    } catch (error) {
      console.error('Error al registrar jugador:', error);
      alert('❌ Error de conexión con el servidor');
    }
  };

  // Posiciones deportivas comunes
  const sportPositions = [
    'Portero', 'Defensa', 'Mediocampista', 'Delantero', 'Capitán',
    'Base', 'Escolta', 'Alero', 'Ala-Pívot', 'Pívot',
    'Receptor', 'Lanzador', 'Jardineros', 'Bateador',
    'Armador', 'Opuesto', 'Central', 'Libero'
  ];

  if (loading) {
    return (
      <div className="player-form-container">
        <div className="loading-message">
          <h3>⏳ Cargando equipos...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="player-form-container">
      <div className="player-form-header">
        <h2>👤 Registrar Nuevo Jugador</h2>
        <p>Completa toda la información del jugador</p>
      </div>

      <form onSubmit={handleSubmit} className="player-form">
        
        {/* SECCIÓN: INFORMACIÓN BÁSICA */}
        <fieldset className="form-section">
          <legend>📋 Información Personal</legend>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                Nombre *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Ej: Juan"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                Apellido *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Ej: Pérez"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="sex" className="form-label">
                Sexo *
              </label>
              <select
                id="sex"
                name="sex"
                value={formData.sex}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Seleccionar...</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="birthDate" className="form-label">
                Fecha de Nacimiento *
              </label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="weight" className="form-label">
                Peso (kg) *
              </label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Ej: 70"
                min="30"
                max="200"
                step="0.1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="height" className="form-label">
                Estatura (cm) *
              </label>
              <input
                type="number"
                id="height"
                name="height"
                value={formData.height}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Ej: 175"
                min="100"
                max="250"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nickname" className="form-label">
                Apodo
              </label>
              <input
                type="text"
                id="nickname"
                name="nickname"
                value={formData.nickname}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Ej: El Tanque"
              />
            </div>

            <div className="form-group">
              <label htmlFor="position" className="form-label">
                Posición *
              </label>
              <select
                id="position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Seleccionar posición...</option>
                {sportPositions.map((position, index) => (
                  <option key={index} value={position}>{position}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="birthCity" className="form-label">
              Ciudad de Nacimiento *
            </label>
            <input
              type="text"
              id="birthCity"
              name="birthCity"
              value={formData.birthCity}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Ej: Ciudad de México"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              📧 Correo Electrónico *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Ej: jugador@email.com"
              required
            />
          </div>
        </fieldset>

        {/* SECCIÓN: INFORMACIÓN DEPORTIVA */}
        <fieldset className="form-section">
          <legend>🏆 Información Deportiva</legend>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="yearsInSport" className="form-label">
                Años en el Deporte *
              </label>
              <input
                type="number"
                id="yearsInSport"
                name="yearsInSport"
                value={formData.yearsInSport}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Ej: 5"
                min="0"
                max="50"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="individualWarnings" className="form-label">
                Amonestaciones
              </label>
              <input
                type="number"
                id="individualWarnings"
                name="individualWarnings"
                value={formData.individualWarnings}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Ej: 0"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="points" className="form-label">
                Puntos Acumulados
              </label>
              <input
                type="number"
                id="points"
                name="points"
                value={formData.points}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Ej: 0"
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="team" className="form-label">
              ⚽ Equipo *
            </label>
            <select
              id="team"
              name="team"
              value={formData.team}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              <option value="">Seleccionar equipo...</option>
              {teams.map(team => (
                <option key={team._id} value={team._id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
        </fieldset>

        {/* SECCIÓN: INFORMACIÓN PERSONAL ADICIONAL */}
        <fieldset className="form-section">
          <legend>🌟 Información Personal Adicional</legend>
          
          <div className="form-group">
            <label className="form-label">
              🎯 Pasatiempos
            </label>
            <div className="hobbies-input-group">
              <input
                type="text"
                value={currentHobby}
                onChange={(e) => setCurrentHobby(e.target.value)}
                className="form-input"
                placeholder="Ej: Leer, videojuegos, música..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addHobby();
                  }
                }}
              />
              <button 
                type="button" 
                onClick={addHobby}
                className="add-hobby-btn"
              >
                ➕ Agregar
              </button>
            </div>
            
            {formData.hobbies.length > 0 && (
              <div className="hobbies-list">
                {formData.hobbies.map((hobby, index) => (
                  <span key={index} className="hobby-tag">
                    {hobby}
                    <button
                      type="button"
                      onClick={() => removeHobby(hobby)}
                      className="remove-hobby-btn"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="favoriteMusic" className="form-label">
              🎵 Música Favorita
            </label>
            <input
              type="text"
              id="favoriteMusic"
              name="favoriteMusic"
              value={formData.favoriteMusic}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Ej: Rock, Pop, Clásica..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="favoritePlayer" className="form-label">
              🏅 Jugador Favorito/Inspiración
            </label>
            <input
              type="text"
              id="favoritePlayer"
              name="favoritePlayer"
              value={formData.favoritePlayer}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Ej: Lionel Messi, Michael Jordan..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              📱 Redes Sociales
            </label>
            <div className="social-media-inputs">
              <input
                type="text"
                name="socialMedia.twitter"
                value={formData.socialMedia.twitter}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Twitter @usuario"
              />
              <input
                type="text"
                name="socialMedia.instagram"
                value={formData.socialMedia.instagram}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Instagram @usuario"
              />
              <input
                type="text"
                name="socialMedia.facebook"
                value={formData.socialMedia.facebook}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Facebook /usuario"
              />
            </div>
          </div>
        </fieldset>

        {/* FOTO - TEMPORALMENTE DESHABILITADA */}
        <fieldset className="form-section">
          <legend>🖼️ Fotografía</legend>
          <div className="form-group">
            <label className="form-label">
              📸 Foto del Jugador <span style={{color: '#95a5a6', fontSize: '0.9em'}}>(Próximamente)</span>
            </label>
            <div className="photo-upload-area">
              <input
                type="file"
                id="photo"
                name="photo"
                onChange={handlePhotoChange}
                accept="image/*"
                className="photo-input"
                disabled
              />
              <label htmlFor="photo" className="photo-upload-label" style={{background: '#95a5a6'}}>
                📁 Seleccionar Foto
              </label>
              <span className="photo-hint">Funcionalidad en desarrollo</span>
            </div>
            
            {previewPhoto && (
              <div className="photo-preview">
                <img src={previewPhoto} alt="Preview" className="preview-image" />
                <button 
                  type="button" 
                  className="remove-photo-btn"
                  onClick={() => {
                    setPreviewPhoto(null);
                    setFormData(prev => ({ ...prev, photo: null }));
                  }}
                >
                  ❌
                </button>
              </div>
            )}
          </div>
        </fieldset>

        {/* Botones de acción */}
        <div className="form-actions">
          <button 
            type="button" 
            onClick={onCancel}
            className="btn-cancel"
          >
            ↩️ Cancelar
          </button>
          <button 
            type="submit" 
            className="btn-submit"
          >
            ✅ Registrar Jugador
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlayerForm;