import React, { useState, useEffect } from 'react';
import SportSelector from '../SportsComponent/SportSelector';
import './TeamForm.css';

const TeamForm = ({ team, onTeamCreated, onTeamUpdated, onCancel, isEditing = false }) => {
    const [formData, setFormData] = useState({
        name: '',
        colors: [],
        logo: null,
        sport: null,
        category: '',
        description: '',
        coach: '',
        location: '',
        foundedYear: ''
    });

    const [previewLogo, setPreviewLogo] = useState(null);
    const [currentColor, setCurrentColor] = useState('#3498db');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Colores predefinidos para selección rápida
    const predefinedColors = [
        '#FF0000', '#0000FF', '#00FF00', '#FFFF00', '#FF00FF',
        '#00FFFF', '#000000', '#FFFFFF', '#FFA500', '#800080',
        '#008000', '#800000', '#008080', '#000080', '#FFC0CB'
    ];

    // Cargar datos si estamos editando
    useEffect(() => {
        if (team && isEditing) {
            setFormData({
                name: team.name || '',
                colors: team.colors || [],
                logo: null,
                sport: team.sport || null,
                category: team.category || '',
                description: team.description || '',
                coach: team.coach || '',
                location: team.location || '',
                foundedYear: team.foundedYear || ''
            });

            // Cargar preview del logo existente
            if (team.logo) {
                setPreviewLogo(team.logo);
            }
        }
    }, [team, isEditing]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSportSelect = (sport) => {
        setFormData(prev => ({
            ...prev,
            sport: sport
        }));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log('📁 Archivo seleccionado:', {
                name: file.name,
                type: file.type,
                size: file.size,
                lastModified: new Date(file.lastModified).toLocaleString()
            });

            // Validar tamaño del archivo (5MB máximo)
            if (file.size > 5 * 1024 * 1024) {
                alert('El archivo es demasiado grande. Máximo 5MB permitido.');
                return;
            }
            
            // Validar tipo de archivo
            if (!file.type.startsWith('image/')) {
                alert('Por favor selecciona un archivo de imagen válido (JPEG, PNG, etc.)');
                return;
            }

            setFormData(prev => ({ ...prev, logo: file }));

            // Crear preview de la imagen
            const reader = new FileReader();
            reader.onload = (e) => {
                console.log('🖼️ Preview del logo creado');
                setPreviewLogo(e.target.result);
            };
            reader.onerror = (error) => {
                console.error('❌ Error al leer el archivo:', error);
                alert('Error al procesar la imagen. Intenta con otro archivo.');
            };
            reader.readAsDataURL(file);
        } else {
            console.log('📁 No se seleccionó archivo');
        }
    };

    const addColor = () => {
        if (currentColor && !formData.colors.includes(currentColor)) {
            setFormData(prev => ({
                ...prev,
                colors: [...prev.colors, currentColor]
            }));
        }
    };

    const removeColor = (colorToRemove) => {
        setFormData(prev => ({
            ...prev,
            colors: prev.colors.filter(color => color !== colorToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        console.log('🚀 Iniciando envío del formulario...');

        // Validaciones
        if (!formData.name.trim()) {
            alert('Por favor ingresa el nombre del equipo');
            setIsSubmitting(false);
            return;
        }

        if (!formData.sport) {
            alert('Por favor selecciona un deporte para el equipo');
            setIsSubmitting(false);
            return;
        }

        if (formData.colors.length === 0) {
            alert('Por favor selecciona al menos un color para el equipo');
            setIsSubmitting(false);
            return;
        }

        try {
            const submitData = new FormData();
            submitData.append('name', formData.name.trim());
            submitData.append('sport', formData.sport._id);
            
            // Agregar campos adicionales
            if (formData.category) submitData.append('category', formData.category);
            if (formData.description) submitData.append('description', formData.description);
            if (formData.coach) submitData.append('coach', formData.coach);
            if (formData.location) submitData.append('location', formData.location);
            if (formData.foundedYear) submitData.append('foundedYear', formData.foundedYear);
            
            // Agregar cada color individualmente
            formData.colors.forEach(color => {
                submitData.append('colors', color);
            });

            // ✅ DEBUG DETALLADO DEL LOGO
            console.log('📸 Estado del logo en formData:', {
                hasLogo: !!formData.logo,
                logo: formData.logo,
                previewLogo: !!previewLogo
            });

            if (formData.logo) {
                submitData.append('logo', formData.logo);
                console.log('✅ Logo agregado al FormData:', {
                    name: formData.logo.name,
                    type: formData.logo.type,
                    size: formData.logo.size
                });
                
                // ✅ VERIFICAR CONTENIDO DEL FORMDATA
                console.log('🔍 Contenido completo del FormData:');
                for (let pair of submitData.entries()) {
                    if (pair[0] === 'logo') {
                        console.log(`📦 ${pair[0]} = [File] ${pair[1].name} (${pair[1].type}, ${pair[1].size} bytes)`);
                    } else {
                        console.log(`📦 ${pair[0]} =`, pair[1]);
                    }
                }
            } else {
                console.log('❌ No hay logo para agregar al FormData');
            }

            const url = isEditing 
                ? `http://localhost:4000/api/teams/${team._id}`
                : 'http://localhost:4000/api/teams';

            const method = isEditing ? 'PUT' : 'POST';

            console.log('🌐 Enviando request:', {
                url: url,
                method: method,
                hasLogo: !!formData.logo
            });

            const response = await fetch(url, {
                method: method,
                body: submitData
                // ❌ NO agregar headers Content-Type para FormData
                // El navegador lo establecerá automáticamente con el boundary
            });

            console.log('📡 Response status:', response.status);
            const result = await response.json();
            console.log('📨 Respuesta completa del servidor:', result);

            if (result.success) {
                console.log('✅ Equipo creado/actualizado exitosamente:', {
                    id: result.data._id,
                    name: result.data.name,
                    logo: result.data.logo,
                    sport: result.data.sport?.name
                });
                
                alert(`✅ ${result.message}`);

                if (isEditing && onTeamUpdated) {
                    onTeamUpdated(result.data);
                } else if (!isEditing && onTeamCreated) {
                    onTeamCreated(result.data);
                }

                // Resetear formulario solo si no estamos editando
                if (!isEditing) {
                    setFormData({ 
                        name: '', 
                        colors: [], 
                        logo: null, 
                        sport: null,
                        category: '',
                        description: '',
                        coach: '',
                        location: '',
                        foundedYear: ''
                    });
                    setPreviewLogo(null);
                }

            } else {
                console.error('❌ Error en la respuesta del servidor:', result.message);
                alert(`❌ Error: ${result.message}`);
            }

        } catch (error) {
            console.error('❌ Error al procesar equipo:', error);
            alert('❌ Error de conexión con el servidor');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="team-form-overlay">
            <div className="team-form-container">
                <div className="team-form-header">
                    <h2>{isEditing ? '✏️ Editar Equipo' : '➕ Registrar Nuevo Equipo'}</h2>
                    <p>{isEditing ? 'Actualiza la información del equipo' : 'Completa la información básica del equipo'}</p>
                    <button onClick={onCancel} className="close-btn">×</button>
                </div>

                <form onSubmit={handleSubmit} className="team-form">
                    {/* Selector de Deporte */}
                    <div className="form-section">
                        <label className="form-label">
                            ⚽ Deporte del Equipo *
                        </label>
                        <div className="sport-selector-section">
                            <SportSelector 
                                onSportSelect={handleSportSelect}
                                selectedSport={formData.sport}
                                title="Selecciona el deporte que practicará el equipo"
                            />
                            
                            {formData.sport && (
                                <div className="selected-sport-info">
                                    <div className="sport-badge">
                                        <span className="sport-icon">
                                            {formData.sport.name === 'Fútbol' ? '⚽' : 
                                             formData.sport.name === 'Baloncesto' ? '🏀' :
                                             formData.sport.name === 'Voleibol' ? '🏐' : '🏆'}
                                        </span>
                                        <strong>{formData.sport.name}</strong>
                                    </div>
                                    <p className="sport-description">
                                        {formData.sport.description}
                                    </p>
                                    <div className="sport-positions-preview">
                                        <span className="positions-count">
                                            {formData.sport.positions?.length || 0} posiciones disponibles
                                        </span>
                                        <div className="positions-tags-mini">
                                            {formData.sport.positions?.slice(0, 4).map((position, index) => (
                                                <span key={index} className="position-tag-mini">
                                                    {position.abbreviation}
                                                </span>
                                            ))}
                                            {formData.sport.positions?.length > 4 && (
                                                <span className="more-positions-mini">
                                                    +{formData.sport.positions.length - 4}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Información Básica */}
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">
                                🏷️ Nombre del Equipo *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="form-input"
                                placeholder={`Ej: ${formData.sport ? formData.sport.name + ' ' : ''}Club, ${formData.sport ? formData.sport.name + ' ' : ''}Team...`}
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="category" className="form-label">
                                🏅 Categoría
                            </label>
                            <input
                                type="text"
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="form-input"
                                placeholder="Ej: Sub-17, Primera Fuerza, Amateur..."
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    {/* Información Adicional */}
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="coach" className="form-label">
                                🏆 Entrenador
                            </label>
                            <input
                                type="text"
                                id="coach"
                                name="coach"
                                value={formData.coach}
                                onChange={handleInputChange}
                                className="form-input"
                                placeholder="Nombre del entrenador"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="location" className="form-label">
                                📍 Ubicación
                            </label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                className="form-input"
                                placeholder="Ciudad o localidad"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="foundedYear" className="form-label">
                                📅 Año de Fundación
                            </label>
                            <input
                                type="number"
                                id="foundedYear"
                                name="foundedYear"
                                value={formData.foundedYear}
                                onChange={handleInputChange}
                                className="form-input"
                                placeholder="2023"
                                min="1900"
                                max="2030"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    {/* Descripción */}
                    <div className="form-group">
                        <label htmlFor="description" className="form-label">
                            📝 Descripción del Equipo
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="form-textarea"
                            placeholder="Describe la historia, objetivos o características especiales del equipo..."
                            rows="3"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Logotipo */}
                    <div className="form-group">
                        <label htmlFor="logo" className="form-label">
                            🖼️ Logotipo del Equipo
                        </label>
                        <div className="logo-upload-area">
                            <input
                                type="file"
                                id="logo"
                                name="logo"
                                onChange={handleLogoChange}
                                accept="image/*"
                                className="logo-input"
                                disabled={isSubmitting}
                            />
                            <label htmlFor="logo" className="logo-upload-label">
                                📁 {isEditing ? 'Cambiar Logo' : 'Seleccionar Archivo'}
                            </label>
                            <span className="logo-hint">PNG, JPG (Max. 5MB)</span>
                        </div>

                        {previewLogo && (
                            <div className="logo-preview">
                                <img src={previewLogo} alt="Preview del logo" className="preview-image" />
                                <button
                                    type="button"
                                    className="remove-logo-btn"
                                    onClick={() => {
                                        setPreviewLogo(null);
                                        setFormData(prev => ({ ...prev, logo: null }));
                                        console.log('🗑️ Logo removido del formulario');
                                    }}
                                    disabled={isSubmitting}
                                >
                                    ❌
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Colores del Equipo */}
                    <div className="form-group">
                        <label className="form-label">
                            🎨 Colores del Equipo *
                        </label>

                        {/* Selector de color personalizado */}
                        <div className="color-selector">
                            <div className="color-input-group">
                                <input
                                    type="color"
                                    value={currentColor}
                                    onChange={(e) => setCurrentColor(e.target.value)}
                                    className="color-picker"
                                    disabled={isSubmitting}
                                />
                                <button
                                    type="button"
                                    onClick={addColor}
                                    className="add-color-btn"
                                    disabled={isSubmitting}
                                >
                                    ➕ Agregar Color
                                </button>
                            </div>

                            {/* Colores predefinidos */}
                            <div className="predefined-colors">
                                <p className="colors-subtitle">Colores predefinidos:</p>
                                <div className="color-grid">
                                    {predefinedColors.map((color, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            className="color-option"
                                            style={{ backgroundColor: color }}
                                            onClick={() => setCurrentColor(color)}
                                            title={color}
                                            disabled={isSubmitting}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Colores seleccionados */}
                        {formData.colors.length > 0 && (
                            <div className="selected-colors">
                                <p className="selected-colors-title">Colores seleccionados:</p>
                                <div className="selected-colors-list">
                                    {formData.colors.map((color, index) => (
                                        <div key={index} className="selected-color-item">
                                            <span
                                                className="color-swatch"
                                                style={{ backgroundColor: color }}
                                            />
                                            <span className="color-value">{color}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeColor(color)}
                                                className="remove-color-btn"
                                                disabled={isSubmitting}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Botones de acción */}
                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="btn-cancel"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? '⏳' : '↩️'} Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={!formData.sport || isSubmitting}
                        >
                            {isSubmitting ? '⏳ Guardando...' : 
                             isEditing ? `💾 Actualizar Equipo` : `✅ Guardar Equipo ${formData.sport ? `de ${formData.sport.name}` : ''}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TeamForm;