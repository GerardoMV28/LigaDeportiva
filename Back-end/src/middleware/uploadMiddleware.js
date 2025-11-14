// uploadMiddleware.js - CORREGIR
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ RUTA CORREGIDA: Usar path.resolve para ir a la raíz del proyecto
const UPLOADS_BASE_DIR = path.resolve(__dirname, '..', 'uploads');
// O alternativamente:
// const UPLOADS_BASE_DIR = path.join(process.cwd(), 'uploads');

console.log('🟢 Ruta base de uploads configurada:', UPLOADS_BASE_DIR);

// Crear subcarpetas si no existen
const createUploadsStructure = () => {
  const folders = ['team-logos', 'player-photos'];
  
  folders.forEach(folder => {
    const folderPath = path.join(UPLOADS_BASE_DIR, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      console.log(`📁 Carpeta creada: ${folderPath}`);
    }
  });
};

createUploadsStructure();

// ✅ CONFIGURACIÓN DE ALMACENAMIENTO PARA LOGOS DE EQUIPOS (CORREGIDA)
const teamLogoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const teamLogosDir = path.join(UPLOADS_BASE_DIR, 'team-logos');
    console.log('📂 Guardando logo de equipo en:', teamLogosDir);
    cb(null, teamLogosDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'team-logo-' + uniqueSuffix + path.extname(file.originalname);
    console.log('📝 Nombre de archivo generado (logo):', filename);
    cb(null, filename);
  }
});

// ✅ CONFIGURACIÓN DE ALMACENAMIENTO PARA FOTOS DE JUGADORES (CORREGIDA)
const playerPhotoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const playerPhotosDir = path.join(UPLOADS_BASE_DIR, 'player-photos');
    console.log('📂 Guardando foto de jugador en:', playerPhotosDir);
    cb(null, playerPhotosDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'player-photo-' + uniqueSuffix + path.extname(file.originalname);
    console.log('📝 Nombre de archivo generado (foto):', filename);
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  console.log('🔍 Verificando archivo:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });
  
  if (file.mimetype.startsWith('image/')) {
    console.log('✅ Archivo de imagen aceptado');
    cb(null, true);
  } else {
    console.log('❌ Archivo rechazado - no es imagen');
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

// ✅ CREAR INSTANCIAS SEPARADAS PARA CADA TIPO
const uploadTeamLogo = multer({
  storage: teamLogoStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB límite
  }
});

const uploadPlayerPhoto = multer({
  storage: playerPhotoStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB límite
  }
});

console.log('🟢 Multer configurado correctamente para logos y fotos');

module.exports = {
  uploadTeamLogo: uploadTeamLogo.single('logo'),
  uploadPlayerPhoto: uploadPlayerPhoto.single('photo')
};