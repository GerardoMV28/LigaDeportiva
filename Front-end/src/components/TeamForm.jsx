import React, { useState } from 'react';
import './TeamForm.css';

const TeamForm = ({ onTeamCreated, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        colors: [],
        logo: null
    });

    const [previewLogo, setPreviewLogo] = useState(null);
    const [currentColor, setCurrentColor] = useState('#3498db');

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

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
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

        // Validaciones básicas
        if (!formData.name.trim()) {
            alert('Por favor ingresa el nombre del equipo');
            return;
        }

        if (formData.colors.length === 0) {
            alert('Por favor selecciona al menos un color para el equipo');
            return;
        }

        try {
            // Crear FormData para enviar archivos
            const submitData = new FormData();
            submitData.append('name', formData.name);
            formData.colors.forEach(color => {
                submitData.append('colors', color);
            });

            if (formData.logo) {
                submitData.append('logo', formData.logo);
            }

            // Llamar a la API del backend
            const response = await fetch('http://localhost:4000/api/teams', {
                method: 'POST',
                body: submitData
                // No headers - FormData los establece automáticamente
            });

            const result = await response.json();

            if (result.success) {
                alert('Equipo registrado exitosamente!');

                if (onTeamCreated) {
                    onTeamCreated(result.data); // Enviar el equipo creado con ID
                }

                // Resetear formulario
                setFormData({ name: '', colors: [], logo: null });
                setPreviewLogo(null);

            } else {
                alert(`Error: ${result.message}`);
            }

        } catch (error) {
            console.error('Error al registrar equipo:', error);
            alert('Error de conexión con el servidor');
        }
    };

    return (
        <div className="team-form-container">
            <div className="team-form-header">
                <h2>➕ Registrar Nuevo Equipo</h2>
                <p>Completa la información básica del equipo</p>
            </div>

            <form onSubmit={handleSubmit} className="team-form">
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
                        placeholder="Ej: Águilas FC, Tigres United..."
                        required
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
                            />
                            <button
                                type="button"
                                onClick={addColor}
                                className="add-color-btn"
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
                    >
                        ↩️ Cancelar
                    </button>
                    <button
                        type="submit"
                        className="btn-submit"
                    >
                        ✅ Guardar Equipo
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TeamForm;