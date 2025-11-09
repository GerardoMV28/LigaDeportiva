const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const seedUsers = [
  {
    name: 'Gerardo Admin',
    email: 'gerardo@ligadeportiva.com',
    password: 'password123',
    role: 'admin'
  },
  {
    name: 'Carlos Entrenador',
    email: 'carlos@ligadeportiva.com',
    password: 'password123', 
    role: 'coach'
  },
  {
    name: 'Ana Jugadora',
    email: 'ana@ligadeportiva.com',
    password: 'password123',
    role: 'player'
  },
  {
    name: 'Luis Jugador',
    email: 'luis@ligadeportiva.com',
    password: 'password123',
    role: 'player'
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/liga-deportiva');
    console.log('✅ Conectado a MongoDB');

    // Limpiar colección
    await User.deleteMany({});
    console.log('🗑️  Colección de usuarios limpiada');

    // Insertar usuarios
    const result = await User.insertMany(seedUsers);
    console.log(`📝 ${result.length} usuarios insertados exitosamente!`);

    // Mostrar los usuarios insertados
    console.log('\n📊 Usuarios en la base de datos:');
    result.forEach(user => {
      console.log(`   👤 ${user.name} - ${user.email} (${user.role})`);
    });

    console.log('\n🎉 Base de datos poblada exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedDatabase();