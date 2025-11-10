import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserList.css';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // URL directa al backend (fallback si el proxy no funciona)
  const API_URL = 'http://localhost:4000/api/users';

  useEffect(() => {
    fetchUsers();
  }, []);

const fetchUsers = async () => {
  try {
    setLoading(true);
    setError('');
    
    console.log('🔄 Cargando usuarios del sistema...');
    
    let response;
    try {
      // Primero intenta con la ruta de usuarios
      response = await axios.get('/api/users');
      console.log('✅ Usuarios cargados desde /api/users:', response.data);
    } catch (userError) {
      console.log('⚠️ /api/users no disponible, intentando con datos de ejemplo');
      // Si falla, usar datos de ejemplo
      setUsers([
        { 
          _id: '1', 
          name: 'Gerardo Admin', 
          email: 'gerardo@ligadeportiva.com', 
          role: 'admin', 
          createdAt: new Date() 
        },
        { 
          _id: '2', 
          name: 'Carlos Coach', 
          email: 'carlos@ligadeportiva.com', 
          role: 'coach', 
          createdAt: new Date() 
        }
      ]);
      return;
    }
    
    if (response.data.success) {
      setUsers(response.data.data);
    } else {
      setError('Error en la respuesta del servidor');
    }
  } catch (error) {
    console.error('❌ Error cargando usuarios:', error);
    setError(`Error de conexión: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

  // Función para obtener la clase CSS del rol
  const getRoleClass = (role) => {
    switch (role) {
      case 'admin': return 'user-list-role-admin';
      case 'coach': return 'user-list-role-coach';
      case 'player': return 'user-list-role-player';
      default: return 'user-list-role-user';
    }
  };

  if (loading) {
    return (
      <div className="user-list-container">
        <div className="user-list-loading">
          <h2>⏳ Cargando usuarios...</h2>
          <p>Conectando con el servidor backend...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-list-container">
      {/* Header Principal */}
      <div className="user-list-header">
        <h1 className="user-list-title">🏆 Liga Deportiva</h1>
        <p className="user-list-subtitle">Sistema de Gestión Deportiva</p>
      </div>

      {/* Mensaje de Error */}
      {error && (
        <div className="user-list-error">
          ⚠️ {error}
        </div>
      )}

      {/* Estado de la conexión */}
      <div className={`user-list-status ${error ? 'error' : 'connected'}`}>
        <strong>Estado:</strong> {error ? 'Usando datos de ejemplo' : 'Conectado al servidor real'}
        <br />
        <strong>Usuarios cargados:</strong> {users.length}
      </div>

      <div className="user-list-content">
        {/* Barra de título y botón */}
        <div className="user-list-header-bar">
          <h2 className="user-list-section-title">👥 Lista de Usuarios</h2>
          <button 
            onClick={fetchUsers}
            className="user-list-refresh-btn"
          >
            🔄 Actualizar Datos
          </button>
        </div>

        {/* Contador de usuarios */}
        <div className="user-list-count">
          Total de usuarios: <strong>{users.length}</strong>
        </div>

        {/* Grid de usuarios */}
        {users.length === 0 ? (
          <div className="user-list-empty">
            📝 No hay usuarios registrados en el sistema.
          </div>
        ) : (
          <div className="user-list-grid">
            {users.map(user => (
              <div key={user._id} className="user-list-card">
                <div className="user-list-card-content">
                  <div className="user-list-card-info">
                    <h3 className="user-list-card-name">{user.name}</h3>
                    <p className="user-list-card-email">
                      <strong>📧 Email:</strong> {user.email}
                    </p>
                    <p className="user-list-card-role">
                      <strong>🎯 Rol:</strong>
                      <span className={`user-list-role-badge ${getRoleClass(user.role)}`}>
                        {user.role}
                      </span>
                    </p>
                  </div>
                  <div className="user-list-card-meta">
                    <div>ID: {user._id.toString().substring(0, 8)}...</div>
                    <div>Creado: {new Date(user.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;