const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const playerRoutes = require('./routes/playerRoutes'); 
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Configuración CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use('/uploads', express.static('uploads'));

// Conectar a la base de datos
connectDB();

// Rutas
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/teams', require('./routes/teamRoutes'));
app.use('/api/players', require('./routes/playerRoutes'));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Backend de Liga Deportiva funcionando!',
    database: 'MongoDB', 
    status: 'Conectado',
    version: '2.0'
  });
});

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor funcionando correctamente',
    database: 'MongoDB',
    timestamp: new Date().toISOString()
  });
});

// Manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Modo: ${process.env.NODE_ENV || 'development'}`);
});