const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {

    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI no está definida en las variables de entorno');
    }

    console.log('🔄 Intentando conectar a MongoDB Atlas...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 segundos de timeout
      socketTimeoutMS: 45000, // 45 segundos
    });

    console.log(`✅ MongoDB Atlas Conectado: ${conn.connection.host}`);
    console.log(`📊 Base de datos: ${conn.connection.name}`);
    console.log(`🎯 Puerto: ${conn.connection.port}`);
    
  } catch (error) {
    console.error('❌ Error conectando a MongoDB Atlas:', error.message);
    console.log('🔍 Detalles del error:', error);
    
    try {
      console.log('🔄 Intentando conectar a MongoDB local...');
      const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/liga-deportiva', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(`✅ MongoDB Local Conectado: ${localConn.connection.host}`);
    } catch (localError) {
      console.error('❌ También falló la conexión local:', localError.message);
      console.log('💡 Los datos se cargarán en memoria temporalmente');
    }
  }
};

mongoose.connection.on('connected', () => {
  console.log('🟢 Mongoose conectado a la base de datos');
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  Mongoose desconectado de la base de datos');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Error de Mongoose:', err);
});

module.exports = connectDB;