const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// ✅ RUTA CORRECTA: app.js está en src/, uploads está en src/uploads/
const UPLOADS_DIR = path.join(__dirname, 'uploads');
console.log('🟢 Ruta de uploads configurada:', UPLOADS_DIR);
console.log('🔍 __dirname:', __dirname);

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ MIDDLEWARE DE DEBUG MEJORADO - CON COMPATIBILIDAD
app.use('/uploads', (req, res, next) => {
  let filePath = path.join(UPLOADS_DIR, req.path);
  
  console.log('🔍 SOLICITUD ARCHIVO:', req.path);
  console.log('   📂 Ruta física inicial:', filePath);
  console.log('   ✅ ¿Existe en ruta directa?:', fs.existsSync(filePath));
  
  // ✅ COMPATIBILIDAD: Si no existe en la ruta directa, buscar en subcarpetas
  if (!fs.existsSync(filePath)) {
    const filename = path.basename(req.path);
    
    // Buscar en team-logos (para logos de equipos)
    const teamLogoPath = path.join(UPLOADS_DIR, 'team-logos', filename);
    if (fs.existsSync(teamLogoPath)) {
      console.log('   🔄 Encontrado en team-logos:', teamLogoPath);
      filePath = teamLogoPath;
    }
    
    // Buscar en player-photos (para futuras fotos de jugadores)
    const playerPhotoPath = path.join(UPLOADS_DIR, 'player-photos', filename);
    if (fs.existsSync(playerPhotoPath)) {
      console.log('   🔄 Encontrado en player-photos:', playerPhotoPath);
      filePath = playerPhotoPath;
    }
  }
  
  // Si encontramos el archivo, servirlo directamente
  if (fs.existsSync(filePath)) {
    console.log('   📤 Sirviendo archivo desde:', filePath);
    res.sendFile(filePath);
  } else {
    console.log('   ❌ Archivo no encontrado en ninguna ubicación');
    next(); // Pasar al siguiente middleware
  }
});

// ✅ SERVIR ARCHIVOS ESTÁTICOS - RUTAS CORREGIDAS
app.use('/uploads/team-logos', express.static(path.join(UPLOADS_DIR, 'team-logos')));
app.use('/uploads/player-photos', express.static(path.join(UPLOADS_DIR, 'player-photos')));
console.log('🟢 Serviendo logos de equipos desde:', path.join(UPLOADS_DIR, 'team-logos'));
console.log('🟢 Serviendo fotos de jugadores desde:', path.join(UPLOADS_DIR, 'player-photos'));

// ✅ RUTA API PARA ARCHIVOS - RUTA CORRECTA
app.get('/api/file/:filename', (req, res) => {
  const filename = req.params.filename;
  
  console.log('🔍 Buscando archivo via API:', filename);
  
  // Buscar en todas las ubicaciones posibles
  const possiblePaths = [
    path.join(UPLOADS_DIR, filename),
    path.join(UPLOADS_DIR, 'team-logos', filename),
    path.join(UPLOADS_DIR, 'player-photos', filename)
  ];
  
  let filePath = null;
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      filePath = possiblePath;
      console.log('   ✅ Encontrado en:', possiblePath);
      break;
    }
  }
  
  if (filePath) {
    console.log('   📤 Sirviendo archivo desde:', filePath);
    res.sendFile(filePath);
  } else {
    console.log('❌ Archivo no encontrado en ninguna ubicación');
    
    // Debug adicional
    console.log('   📋 Buscando en:', UPLOADS_DIR);
    if (fs.existsSync(UPLOADS_DIR)) {
      console.log('   📂 Contenido de uploads:', fs.readdirSync(UPLOADS_DIR));
      console.log('   📂 Contenido de team-logos:', fs.readdirSync(path.join(UPLOADS_DIR, 'team-logos')));
      console.log('   📂 Contenido de player-photos:', fs.readdirSync(path.join(UPLOADS_DIR, 'player-photos')));
    }
    
    res.status(404).json({
      success: false,
      message: 'Archivo no encontrado',
      filename: filename,
      searchedPaths: possiblePaths
    });
  }
});

// ✅ RUTA API PARA SUBIR FOTOS DE JUGADORES
app.post('/api/players/upload-photo', (req, res) => {
  const { uploadPlayerPhoto } = require('./middleware/uploadMiddleware');
  
  uploadPlayerPhoto(req, res, function (err) {
    if (err) {
      console.error('❌ Error subiendo foto de jugador:', err);
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ningún archivo'
      });
    }
    
    console.log('✅ Foto de jugador subida exitosamente:', req.file.filename);
    
    res.json({
      success: true,
      message: 'Foto subida exitosamente',
      filename: req.file.filename,
      path: `/uploads/player-photos/${req.file.filename}`
    });
  });
});

connectDB();

app.use('/api/players', require('./routes/playerRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/teams', require('./routes/teamRoutes'));
app.use('/api/sports', require('./routes/sport-routes'));
app.use('/api/admin', require('./routes/admin-routes'));

app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Backend de Liga Deportiva funcionando!',
    status: 'Conectado'
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

app.use((error, req, res, next) => {
  console.error('Error del servidor:', error);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});