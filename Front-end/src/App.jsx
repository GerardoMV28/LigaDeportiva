import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import UserList from './views/UserList';
import TeamList from './views/TeamList';
import Players from './views/Players';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Navegación */}
        <nav className="main-nav">
          <div className="nav-container">
            <div className="nav-brand">
              <h2>🏆 Liga Deportiva</h2>
            </div>
            <div className="nav-links">
              <NavLink 
                to="/" 
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                end
              >
                👥 Usuarios
              </NavLink>
              <NavLink 
                to="/teams" 
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                ⚽ Equipos
              </NavLink>
              <NavLink 
                to="/players" 
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                👟 Jugadores
              </NavLink>
            </div>
          </div>
        </nav>

        {/* Contenido principal */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<UserList />} />
            <Route path="/users" element={<UserList />} />
            <Route path="/teams" element={<TeamList />} />
            <Route path="/players" element={<Players />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;