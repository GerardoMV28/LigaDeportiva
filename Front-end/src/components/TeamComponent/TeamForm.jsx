import React, { useState } from 'react';
import SportSelector from '../SportsComponent/SportSelector';
import './TeamForm.css';

const TeamForm = ({ onTeamCreated, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        colors: [],
        logo: null,
        sport: null
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
            // Validar tamaño del archivo (5MB máximo)
            if (file.size > 5 * 1024 * 1024) {
                alert('El archivo es demasiado grande. Máximo 5MB permitido.');
                return;
            }
            
            setFormData(prev => ({ ...prev, logo: file }));

            // Crear preview de la imagen
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewLogo(e.target.result);
            };
            reader.readAsDataURL(file);
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
            // ✅ USAR FORMDATA (como está configurado en tu backend)
            const submitData = new FormData();
            submitData.append('name', formData.name.trim());
            submitData.append('sport', formData.sport._id);
            
            // Agregar cada color individualmente
            formData.colors.forEach(color => {
                submitData.append('colors', color);
            });

            if (formData.logo) {
                submitData.append('logo', formData.logo);
            }

            console.log('Enviando datos del equipo...');
            console.log('Nombre:', formData.name);
            console.log('Deporte ID:', formData.sport._id);
            console.log('Colores:', formData.colors);
            console.log('Logo:', formData.logo ? 'Sí' : 'No');

            const response = await fetch('http://localhost:4000/api/teams', {
                method: 'POST',
                body: submitData
                // ✅ NO incluir headers - FormData los establece automáticamente
            });

            const result = await response.json();
            console.log('Respuesta del servidor:', result);

            if (result.success) {
                alert(`✅ ${result.message}`);

                if (onTeamCreated) {
                    onTeamCreated(result.data);
                }

                // Resetear formulario
                setFormData({ 
                    name: '', 
                    colors: [], 
                    logo: null, 
                    sport: null 
                });
                setPreviewLogo(null);

            } else {
                alert(`❌ Error: ${result.message}`);
            }

        } catch (error) {
            console.error('Error al registrar equipo:', error);
            alert('❌ Error de conexión con el servidor');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="team-form-container">
            <div className="team-form-header">
                <h2>➕ Registrar Nuevo Equipo</h2>
                <p>Completa la información básica del equipo</p>
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

                {/* Nombre del Equipo */}
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
                            📁 Seleccionar Archivo
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
                        {isSubmitting ? '⏳ Guardando...' : `✅ Guardar Equipo ${formData.sport ? `de ${formData.sport.name}` : ''}`}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TeamForm;