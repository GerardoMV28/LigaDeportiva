import React, { useState, useEffect } from 'react';
import './PlayerForm.css';

// Datos de estados y ciudades de México
const statesAndCities = {
  'Aguascalientes': ['Aguascalientes', 'Jesús María', 'Rincón de Romos', 'Calvillo', 'Cosío'],
  'Baja California': ['Tijuana', 'Mexicali', 'Ensenada', 'Playas de Rosarito', 'Tecate'],
  'Baja California Sur': ['La Paz', 'Los Cabos', 'Ciudad Constitución', 'Loreto', 'Santa Rosalía'],
  'Campeche': ['Campeche', 'Ciudad del Carmen', 'Champotón', 'Calkiní', 'Escárcega'],
  'Chiapas': ['Tuxtla Gutiérrez', 'Tapachula', 'San Cristóbal de las Casas', 'Comitán', 'Chiapa de Corzo'],
  'Chihuahua': ['Ciudad Juárez', 'Chihuahua', 'Delicias', 'Cuauhtémoc', 'Parral'],
  'Ciudad de México': ['Ciudad de México'],
  'Coahuila': ['Saltillo', 'Torreón', 'Monclova', 'Piedras Negras', 'Acuña'],
  'Colima': ['Colima', 'Manzanillo', 'Tecomán', 'Villa de Álvarez', 'Armería'],
  'Durango': ['Durango', 'Gómez Palacio', 'Lerdo', 'Canatlán', 'El Salto'],
  'Estado de México': ['Toluca', 'Ecatepec', 'Nezahualcóyotl', 'Naucalpan', 'Tlalnepantla'],
  'Guanajuato': ['León', 'Irapuato', 'Celaya', 'Salamanca', 'Guanajuato'],
  'Guerrero': ['Acapulco', 'Chilpancingo', 'Iguala', 'Zihuatanejo', 'Taxco'],
  'Hidalgo': ['Pachuca', 'Tulancingo', 'Tizayuca', 'Huejutla', 'Apan'],
  'Jalisco': ['Guadalajara', 'Zapopan', 'Tlaquepaque', 'Tonalá', 'Puerto Vallarta'],
  'Michoacán': ['Morelia', 'Uruapan', 'Lázaro Cárdenas', 'Zamora', 'Pátzcuaro'],
  'Morelos': ['Cuernavaca', 'Cuautla', 'Jiutepec', 'Temixco', 'Yautepec'],
  'Nayarit': ['Tepic', 'Santiago Ixcuintla', 'Compostela', 'Bahía de Banderas', 'Acaponeta'],
  'Nuevo León': ['Monterrey', 'Guadalupe', 'San Nicolás', 'Apodaca', 'General Escobedo'],
  'Oaxaca': ['Oaxaca', 'Salina Cruz', 'Juchitán', 'San Juan Bautista Tuxtepec', 'Huajuapan'],
  'Puebla': ['Puebla', 'Tehuacán', 'San Martín Texmelucan', 'Atlixco', 'Cholula'],
  'Querétaro': ['Querétaro', 'San Juan del Río', 'Corregidora', 'El Marqués', 'Tequisquiapan'],
  'Quintana Roo': ['Cancún', 'Chetumal', 'Playa del Carmen', 'Cozumel', 'Tulum'],
  'San Luis Potosí': ['San Luis Potosí', 'Soledad', 'Ciudad Valles', 'Matehuala', 'Rioverde'],
  'Sinaloa': ['Culiacán', 'Mazatlán', 'Los Mochis', 'Guamúchil', 'Navolato'],
  'Sonora': ['Hermosillo', 'Ciudad Obregón', 'Nogales', 'San Luis Río Colorado', 'Navojoa'],
  'Tabasco': ['Villahermosa', 'Cárdenas', 'Comalcalco', 'Macuspana', 'Tenosique'],
  'Tamaulipas': ['Reynosa', 'Matamoros', 'Nuevo Laredo', 'Tampico', 'Ciudad Victoria'],
  'Tlaxcala': ['Tlaxcala', 'Apizaco', 'Huamantla', 'Chiautempan', 'Calpulalpan'],
  'Veracruz': ['Veracruz', 'Xalapa', 'Coatzacoalcos', 'Córdoba', 'Poza Rica'],
  'Yucatán': ['Mérida', 'Valladolid', 'Tizimín', 'Progreso', 'Kanasín'],
  'Zacatecas': ['Zacatecas', 'Fresnillo', 'Guadalupe', 'Jerez', 'Calera']
};

const PlayerForm = ({ player, onSave, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    // Información Personal
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    gender: '',
    nickname: '',
    birthState: '',
    birthCity: '',
    photo: '',
    hobbies: '',
    favoriteMusic: '',
    socialMedia: '',
    sport: '',
    team: '', 
    teamInternalId: '',
    jerseyNumber: '',
    positions: [],
    yearsOfExperience: '',
    
    // Características Físicas
    height: '',
    weight: '',
    
    // Estadísticas
    stats: {
      individualWarnings: 0,
      accumulatedPoints: 0,
      gamesWon: 0,
      gamesLost: 0,
      totalWarnings: 0
    }
  });

  const [teams, setTeams] = useState([]);
  const [sports, setSports] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);

  // Funciones para fechas
  const formatDateForSubmission = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (error) {
      return dateString;
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
      }
      return dateString.split('T')[0];
    } catch (error) {
      return dateString;
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchSports();
    fetchTeams();
  }, []);

  // Si estamos editando, cargar datos del jugador
  useEffect(() => {
    if (player && isEditing) {
      const birthDate = player.birthDate ? formatDateForInput(player.birthDate) : '';
      
      // Para manejar ciudades antiguas (cuando era texto libre)
      let birthState = '';
      let birthCity = player.birthCity || '';
      
      // Si el jugador ya tenía una ciudad guardada, intentar encontrar su estado
      if (player.birthCity) {
        for (const [state, cities] of Object.entries(statesAndCities)) {
          if (cities.includes(player.birthCity)) {
            birthState = state;
            break;
          }
        }
      }
      
      setFormData({
        firstName: player.firstName || '',
        lastName: player.lastName || '',
        email: player.email || '',
        phone: player.phone || '',
        birthDate: birthDate,
        gender: player.gender || '',
        nickname: player.nickname || '',
        birthState: birthState,
        birthCity: birthCity,
        photo: player.photo || '',
        hobbies: player.hobbies || '',
        favoriteMusic: player.favoriteMusic || '',
        socialMedia: player.socialMedia || '',
        sport: player.team?.sport?._id || '',
        team: player.team?._id || '',
        teamInternalId: player.teamInternalId || '',
        jerseyNumber: player.jerseyNumber || '',
        positions: player.positions || [],
        yearsOfExperience: player.yearsOfExperience || '',
        height: player.height || '',
        weight: player.weight || '',
        stats: player.stats || {
          individualWarnings: 0,
          accumulatedPoints: 0,
          gamesWon: 0,
          gamesLost: 0,
          totalWarnings: 0
        }
      });

      // Si ya tiene equipo, cargar posiciones del deporte
      if (player.team?.sport) {
        fetchPositionsBySport(player.team.sport._id);
        filterTeamsBySport(player.team.sport._id);
      }
    }
  }, [player, isEditing]);

  // Cuando cambia el deporte, filtrar equipos y cargar posiciones
  useEffect(() => {
    if (formData.sport) {
      filterTeamsBySport(formData.sport);
      fetchPositionsBySport(formData.sport);
      // Limpiar equipo seleccionado cuando cambia el deporte
      setFormData(prev => ({ ...prev, team: '' }));
    } else {
      setFilteredTeams([]);
      setPositions([]);
    }
  }, [formData.sport]);

  // Cuando se selecciona equipo, generar teamInternalId con formato correcto
  useEffect(() => {
    if (formData.team && !formData.teamInternalId && formData.firstName) {
      const selectedTeam = teams.find(t => t._id === formData.team);
      if (selectedTeam) {
        // Contar jugadores existentes en este equipo para el consecutivo
        const getPlayersCountByTeam = async () => {
          try {
            const response = await fetch(`http://localhost:4000/api/players?team=${formData.team}`);
            const result = await response.json();
            if (result.success) {
              const playersCount = result.data.length;
              const teamConsecutive = String(playersCount + 1).padStart(3, '0');
              const playerConsecutive = String(playersCount + 1).padStart(3, '0');
              
              setFormData(prev => ({
                ...prev,
                teamInternalId: `${selectedTeam.name.replace(/\s+/g, '')}-${teamConsecutive}-${formData.firstName}-${playerConsecutive}`
              }));
            }
          } catch (error) {
            console.error('Error contando jugadores:', error);
            // Fallback si hay error
            setFormData(prev => ({
              ...prev,
              teamInternalId: `${selectedTeam.name.replace(/\s+/g, '')}-001-${formData.firstName}-001`
            }));
          }
        };
        
        getPlayersCountByTeam();
      }
    }
  }, [formData.team, formData.firstName, teams]);

  // Cuando cambia el estado, limpiar la ciudad seleccionada
  useEffect(() => {
    if (formData.birthState) {
      setFormData(prev => ({ ...prev, birthCity: '' }));
    }
  }, [formData.birthState]);

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

  const fetchTeams = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/teams');
      const result = await response.json();
      if (result.success) {
        setTeams(result.data);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const filterTeamsBySport = (sportId) => {
    const filtered = teams.filter(team => team.sport?._id === sportId);
    setFilteredTeams(filtered);
    console.log(`Equipos filtrados para deporte ${sportId}:`, filtered);
  };

  const fetchPositionsBySport = async (sportId) => {
    if (!sportId) return;
    
    try {
      const response = await fetch(`http://localhost:4000/api/sports/${sportId}/positions`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setPositions(result.data);
        } else {
          setPositions(getDefaultPositions());
        }
      } else {
        setPositions(getDefaultPositions());
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
      setPositions(getDefaultPositions());
    }
  };

  const getDefaultPositions = () => {
    return [
      { _id: 'general', name: 'General', abbreviation: 'GEN' }
    ];
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('stats.')) {
      const statField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          [statField]: parseInt(value) || 0
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePositionToggle = (positionId, isPrimary = false) => {
    setFormData(prev => {
      const existingPositionIndex = prev.positions.findIndex(
        p => p.position === positionId
      );

      let newPositions;

      if (existingPositionIndex > -1) {
        newPositions = prev.positions.map((pos, index) => ({
          ...pos,
          isPrimary: isPrimary ? index === existingPositionIndex : pos.isPrimary
        }));
      } else {
        const newPosition = {
          position: positionId,
          isPrimary: isPrimary
        };

        if (isPrimary) {
          newPositions = prev.positions.map(pos => ({
            ...pos,
            isPrimary: false
          }));
          newPositions.push(newPosition);
        } else {
          newPositions = [...prev.positions, newPosition];
        }
      }

      return { ...prev, positions: newPositions };
    });
  };

  const handleRemovePosition = (positionId) => {
    setFormData(prev => ({
      ...prev,
      positions: prev.positions.filter(p => p.position !== positionId)
    }));
  };

  const sendRegistrationEmail = async (savedPlayer) => {
    try {
      console.log('📧 Enviando email de confirmación...');
      
      const emailData = {
        player: {
          ...savedPlayer,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          registrationFolio: savedPlayer.registrationFolio || `REG-${Date.now()}`,
          teamInternalId: formData.teamInternalId,
          positions: formData.positions
        },
        team: {
          name: getTeamName(formData.team),
          _id: formData.team
        },
        sport: {
          name: getSportName(formData.sport),
          _id: formData.sport
        }
      };

      console.log('📤 Datos para email:', emailData);

      const emailResponse = await fetch('http://localhost:4000/api/players/send-registration-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      });
      
      const emailResult = await emailResponse.json();
      
      if (emailResult.success) {
        console.log('✅ Email de confirmación enviado correctamente');
        return true;
      } else {
        console.warn('⚠️ Email no enviado:', emailResult.message);
        return false;
      }
    } catch (emailError) {
      console.warn('⚠️ Error enviando email:', emailError);
      return false;
    }
  };

  const nextStep = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('🔄 Intentando avanzar al siguiente paso desde:', currentStep);
    
    if (currentStep === 1) {
      const step1Errors = {};
      if (!formData.firstName.trim()) step1Errors.firstName = 'El nombre es requerido';
      if (!formData.lastName.trim()) step1Errors.lastName = 'El apellido es requerido';
      if (!formData.email.trim()) step1Errors.email = 'El email es requerido';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) step1Errors.email = 'Email no válido';
      if (!formData.birthDate) step1Errors.birthDate = 'La fecha de nacimiento es requerida';
      
      setErrors(step1Errors);
      if (Object.keys(step1Errors).length > 0) {
        console.log('❌ Errores en paso 1:', step1Errors);
        return;
      }
    }
    
    if (currentStep === 2) {
      console.log('✅ Avanzando al paso 3 sin validaciones');
    }
    
    setCurrentStep(prev => {
      const nextStep = prev + 1;
      console.log(`✅ Cambiando de paso ${prev} → ${nextStep}`);
      return nextStep;
    });
  };

  const prevStep = () => {
    setCurrentStep(prev => {
      const prevStep = prev - 1;
      console.log(`🔄 Retrocediendo de paso ${prev} → ${prevStep}`);
      return prevStep;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🎯 Enviando formulario desde paso:', currentStep);
    
    // Validación final antes de enviar (solo campos críticos)
    const finalErrors = {};
    if (!formData.firstName.trim()) finalErrors.firstName = 'El nombre es requerido';
    if (!formData.lastName.trim()) finalErrors.lastName = 'El apellido es requerido';
    if (!formData.email.trim()) finalErrors.email = 'El email es requerido';
    if (!formData.birthDate) finalErrors.birthDate = 'La fecha de nacimiento es requerida';
    
    if (Object.keys(finalErrors).length > 0) {
      console.log('❌ Errores de validación:', finalErrors);
      setErrors(finalErrors);
      setCurrentStep(1);
      return;
    }

    setLoading(true);

    try {
      const url = isEditing 
        ? `http://localhost:4000/api/players/${player._id}`
        : 'http://localhost:4000/api/players';
      
      const method = isEditing ? 'PUT' : 'POST';

      const dataToSend = {
        ...formData,
        birthDate: formatDateForSubmission(formData.birthDate),
        jerseyNumber: formData.jerseyNumber ? parseInt(formData.jerseyNumber) : undefined,
        height: formData.height ? parseInt(formData.height) : undefined,
        weight: formData.weight ? parseInt(formData.weight) : undefined,
        yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : 0,
        stats: Object.fromEntries(
          Object.entries(formData.stats).map(([key, value]) => [key, parseInt(value) || 0])
        )
      };

      // Limpiar campos undefined
      Object.keys(dataToSend).forEach(key => {
        if (dataToSend[key] === undefined || dataToSend[key] === '') {
          delete dataToSend[key];
        }
      });

      console.log('📤 Datos a enviar:', dataToSend);

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Jugador guardado exitosamente');
        
        // ✅ ENVIAR EMAIL DE CONFIRMACIÓN SOLO PARA NUEVOS REGISTROS
        if (!isEditing) {
          const emailSent = await sendRegistrationEmail(result.data);
          if (emailSent) {
            alert('🎉 ¡Jugador registrado y email de confirmación enviado exitosamente!');
          } else {
            alert('✅ Jugador registrado, pero hubo un problema enviando el email de confirmación.');
          }
        } else {
          alert('✅ Jugador actualizado exitosamente');
        }
        
        onSave(result.data);
      } else {
        console.error('❌ Error al guardar:', result.message);
        setErrors({ submit: result.message || 'Error al guardar el jugador' });
      }
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      setErrors({ submit: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  const getSportName = (sportId) => {
    const sport = sports.find(s => s._id === sportId);
    return sport?.name || 'Deporte no seleccionado';
  };

  const getTeamName = (teamId) => {
    const team = teams.find(t => t._id === teamId);
    return team?.name || 'Equipo no seleccionado';
  };

  const getPositionName = (positionId) => {
    const position = positions.find(p => p._id === positionId);
    return position ? `${position.name} (${position.abbreviation})` : positionId;
  };

  const isPositionSelected = (positionId) => {
    return formData.positions.some(p => p.position === positionId);
  };

  const getPrimaryPosition = () => {
    const primary = formData.positions.find(p => p.isPrimary);
    return primary ? primary.position : null;
  };

  // Renderizado por pasos
  const renderStep1 = () => (
    <div className="form-section">
      <h3>👤 Información Personal</h3>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="firstName">Nombre *</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className={errors.firstName ? 'error' : ''}
            placeholder="Ingresa el nombre"
          />
          {errors.firstName && <span className="error-message">{errors.firstName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Apellido *</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className={errors.lastName ? 'error' : ''}
            placeholder="Ingresa el apellido"
          />
          {errors.lastName && <span className="error-message">{errors.lastName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={errors.email ? 'error' : ''}
            placeholder="jugador@ejemplo.com"
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
        <label htmlFor="phone">Teléfono</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="Ej: +52 123 456 7890"
        />
        
      </div>
        <div className="form-group">
          <label htmlFor="photo">Foto del Jugador (URL)</label>
          <input
            type="text"
            id="photo"
            name="photo"
            value={formData.photo}
            onChange={handleInputChange}
            placeholder="https://ejemplo.com/foto.jpg"
          />
          {formData.photo && (
            <div className="photo-preview">
              <img src={formData.photo} alt="Vista previa" className="photo-preview-img" />
              <small>Vista previa de la foto</small>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="gender">Sexo</label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
          >
            <option value="">Selecciona el sexo</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="birthDate">Fecha de Nacimiento *</label>
          <input
            type="date"
            id="birthDate"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleInputChange}
            className={errors.birthDate ? 'error' : ''}
          />
          {errors.birthDate && <span className="error-message">{errors.birthDate}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="birthState">Estado de Nacimiento</label>
          <select
            id="birthState"
            name="birthState"
            value={formData.birthState}
            onChange={handleInputChange}
          >
            <option value="">Selecciona un estado</option>
            {Object.keys(statesAndCities).map(state => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="birthCity">Ciudad de Nacimiento</label>
          <select
            id="birthCity"
            name="birthCity"
            value={formData.birthCity}
            onChange={handleInputChange}
            disabled={!formData.birthState}
          >
            <option value="">
              {formData.birthState ? 'Selecciona una ciudad' : 'Primero selecciona un estado'}
            </option>
            {formData.birthState && statesAndCities[formData.birthState].map(city => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="nickname">Apodo</label>
          <input
            type="text"
            id="nickname"
            name="nickname"
            value={formData.nickname}
            onChange={handleInputChange}
            placeholder="Apodo del jugador"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="form-section">
      <h3>⚽ Información Deportiva</h3>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="sport">Deporte</label>
          <select
            id="sport"
            name="sport"
            value={formData.sport}
            onChange={handleInputChange}
          >
            <option value="">Selecciona un deporte</option>
            {sports.map(sport => (
              <option key={sport._id} value={sport._id}>
                {sport.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="team">Equipo</label>
          <select
            id="team"
            name="team"
            value={formData.team}
            onChange={handleInputChange}
            disabled={!formData.sport}
          >
            <option value="">{formData.sport ? 'Selecciona un equipo' : 'Primero selecciona un deporte'}</option>
            {filteredTeams.map(team => (
              <option key={team._id} value={team._id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="yearsOfExperience">Años de Experiencia</label>
          <input
            type="number"
            id="yearsOfExperience"
            name="yearsOfExperience"
            value={formData.yearsOfExperience}
            onChange={handleInputChange}
            placeholder="Años dedicados al deporte"
            min="0"
            max="50"
          />
        </div>

        <div className="form-group">
          <label htmlFor="teamInternalId">ID de Registro</label>
          <input
            type="text"
            id="teamInternalId"
            name="teamInternalId"
            value={formData.teamInternalId}
            onChange={handleInputChange}
            placeholder="Se generará automáticamente"
            readOnly
          />
        </div>

        <div className="form-group">
          <label htmlFor="jerseyNumber">Número de Camiseta</label>
          <input
            type="number"
            id="jerseyNumber"
            name="jerseyNumber"
            value={formData.jerseyNumber}
            onChange={handleInputChange}
            placeholder="1-99"
            min="1"
            max="99"
          />
        </div>
      </div>

      {/* Selección de Posiciones */}
      {formData.sport && positions.length > 0 && (
        <div className="positions-section">
          <label>Posiciones en {getSportName(formData.sport)}</label>
          <div className="positions-grid">
            {positions.map(position => (
              <div key={position._id} className="position-card">
                <div className="position-info">
                  <span className="position-name">{position.name}</span>
                  <span className="position-abbr">({position.abbreviation})</span>
                </div>
                <div className="position-actions">
                  <button
                    type="button"
                    onClick={() => handlePositionToggle(position._id, true)}
                    className={`btn-primary ${getPrimaryPosition() === position._id ? 'active' : ''}`}
                  >
                    {getPrimaryPosition() === position._id ? '⭐ Principal' : 'Principal'}
                  </button>
                  <button
                    type="button"
                    onClick={() => 
                      isPositionSelected(position._id) 
                        ? handleRemovePosition(position._id)
                        : handlePositionToggle(position._id, false)
                    }
                    className={`btn-secondary ${isPositionSelected(position._id) ? 'selected' : ''}`}
                  >
                    {isPositionSelected(position._id) ? '✓ Seleccionada' : 'Secundaria'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Posiciones seleccionadas */}
          {formData.positions.length > 0 && (
            <div className="selected-positions">
              <h4>Posiciones Seleccionadas:</h4>
              <div className="selected-tags">
                {formData.positions.map(pos => (
                  <span key={pos.position} className="position-tag">
                    {getPositionName(pos.position)}
                    {pos.isPrimary && <span className="primary-badge">⭐</span>}
                    <button
                      type="button"
                      onClick={() => handleRemovePosition(pos.position)}
                      className="remove-tag"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <>
      <div className="form-section">
        <h3>💪 Características Físicas</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="height">Estatura (cm)</label>
            <input
              type="number"
              id="height"
              name="height"
              value={formData.height}
              onChange={handleInputChange}
              placeholder="175"
              min="100"
              max="250"
            />
          </div>

          <div className="form-group">
            <label htmlFor="weight">Peso (kg)</label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
              placeholder="70"
              min="30"
              max="150"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>📊 Estadísticas y Preferencias</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="hobbies">Pasatiempos</label>
            <textarea
              id="hobbies"
              name="hobbies"
              value={formData.hobbies}
              onChange={handleInputChange}
              placeholder="Pasatiempos del jugador..."
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="favoriteMusic">Música Favorita</label>
            <input
              type="text"
              id="favoriteMusic"
              name="favoriteMusic"
              value={formData.favoriteMusic}
              onChange={handleInputChange}
              placeholder="Géneros o artistas favoritos"
            />
          </div>

          <div className="form-group">
            <label htmlFor="socialMedia">Redes Sociales</label>
            <input
              type="text"
              id="socialMedia"
              name="socialMedia"
              value={formData.socialMedia}
              onChange={handleInputChange}
              placeholder="@usuario o enlaces"
            />
          </div>

          <div className="form-group">
            <label htmlFor="stats.individualWarnings">Amonestaciones Individuales</label>
            <input
              type="number"
              id="stats.individualWarnings"
              name="stats.individualWarnings"
              value={formData.stats.individualWarnings}
              onChange={handleInputChange}
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="stats.accumulatedPoints">Puntos Acumulados</label>
            <input
              type="number"
              id="stats.accumulatedPoints"
              name="stats.accumulatedPoints"
              value={formData.stats.accumulatedPoints}
              onChange={handleInputChange}
              min="0"
            />
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="player-form-overlay">
      <div className="player-form-container">
        <div className="player-form-header">
          <h2>{isEditing ? '✏️ Editar Jugador' : '➕ Registrar Nuevo Jugador'}</h2>
          <button onClick={onCancel} className="close-btn" type="button">✕</button>
        </div>

        {/* Indicador de Pasos */}
        <div className="step-indicator">
          <div className={`step ${currentStep === 1 ? 'active' : ''}`}>
            <span>1</span>
            <label>Información Personal</label>
          </div>
          <div className={`step ${currentStep === 2 ? 'active' : ''}`}>
            <span>2</span>
            <label>Información Deportiva</label>
          </div>
          <div className={`step ${currentStep === 3 ? 'active' : ''}`}>
            <span>3</span>
            <label>Características</label>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="player-form">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {errors.submit && (
            <div className="error-banner">{errors.submit}</div>
          )}

          <div className="form-actions">
            {currentStep > 1 && (
              <button type="button" onClick={prevStep} className="btn-secondary">
                ⬅️ Anterior
              </button>
            )}
            
            {currentStep < 3 ? (
              <button type="button" onClick={(e) => nextStep(e)} className="btn-primary">
                Siguiente ➡️
              </button>
            ) : (
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? '⏳ Guardando...' : (isEditing ? '💾 Actualizar Jugador' : '✅ Registrar Jugador')}
              </button>
            )}
            
            <button type="button" onClick={onCancel} className="btn-cancel">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlayerForm;