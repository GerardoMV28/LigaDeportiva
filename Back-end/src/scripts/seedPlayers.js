const mongoose = require('mongoose');
const Player = require('../models/player');
const Team = require('../models/team');
const Sport = require('../models/sport');
require('dotenv').config();

const seedPlayers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/liga-deportiva');
    console.log('📊 Conectado a MongoDB');

    // ✅ PRIMERO: Eliminar el índice problemático si existe
    try {
      await mongoose.connection.collection('players').dropIndex('registrationFolio_1');
      console.log('✅ Índice registrationFolio_1 eliminado');
    } catch (error) {
      console.log('ℹ️  Índice registrationFolio_1 no existe o no se pudo eliminar');
    }

    // Obtener equipos existentes
    const teams = await Team.find().populate('sport');
    
    if (teams.length === 0) {
      console.log('❌ No hay equipos creados. Primero crea algunos equipos.');
      process.exit(1);
    }

    console.log(`📋 Encontrados ${teams.length} equipos:`);
    
    // Filtrar solo equipos con deporte asignado
    const teamsWithSport = teams.filter(team => team.sport && team.sport.positions && team.sport.positions.length > 0);
    
    console.log(`✅ ${teamsWithSport.length} equipos con deporte configurado:`);
    teamsWithSport.forEach(team => {
      console.log(`   - ${team.name} (${team.sport.name}) - ${team.sport.positions.length} posiciones`);
    });

    if (teamsWithSport.length === 0) {
      console.log('❌ No hay equipos con deportes configurados. Ejecuta primero el seed de deportes.');
      process.exit(1);
    }

    // Eliminar jugadores existentes
    await Player.deleteMany({});
    console.log('🗑️ Jugadores existentes eliminados');

    const playersData = [];
    
    // Crear jugadores para cada equipo con deporte
    for (const team of teamsWithSport) {
      const sportPositions = team.sport.positions;
      const numPlayers = 5; // Número fijo para evitar problemas
      
      for (let i = 1; i <= numPlayers; i++) {
        const randomPosition = sportPositions[Math.floor(Math.random() * sportPositions.length)];
        
        // ✅ Generar email e ID únicos
        const timestamp = Date.now().toString().slice(-6);
        const teamIdShort = team._id.toString().slice(-4);
        
        playersData.push({
          firstName: `Jugador${i}`,
          lastName: `Equipo${team.name.replace(/\s+/g, '')}`,
          email: `jugador${i}.equipo${teamIdShort}${timestamp}@email.com`,
          phone: `+123456789${i}`,
          birthDate: new Date(1990 + Math.floor(Math.random() * 15), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          identification: `ID${teamIdShort}${i}${timestamp}`,
          team: team._id,
          positions: [{
            position: randomPosition._id ? randomPosition._id.toString() : randomPosition,
            isPrimary: true,
            skillLevel: ['Principiante', 'Intermedio', 'Avanzado', 'Élite'][Math.floor(Math.random() * 4)]
          }],
          teamInternalId: `P${i.toString().padStart(3, '0')}`,
          height: 160 + Math.floor(Math.random() * 40),
          weight: 60 + Math.floor(Math.random() * 40),
          jerseyNumber: i,
          dominantFoot: ['Derecho', 'Izquierdo', 'Ambidiestro'][Math.floor(Math.random() * 3)],
          experience: ['Principiante', 'Recreativo', 'Competitivo', 'Profesional'][Math.floor(Math.random() * 4)],
          registrationFolio: `FOLIO${teamIdShort}${i}${timestamp}`, // ✅ Agregar este campo
          stats: {
            gamesPlayed: Math.floor(Math.random() * 50),
            goals: Math.floor(Math.random() * 20),
            assists: Math.floor(Math.random() * 15),
            yellowCards: Math.floor(Math.random() * 5),
            redCards: Math.floor(Math.random() * 2)
          }
        });
      }
      
      console.log(`   👥 Creados ${numPlayers} jugadores para ${team.name}`);
    }

    // ✅ Insertar uno por uno para mejor manejo de errores
    let insertedCount = 0;
    for (const playerData of playersData) {
      try {
        const player = new Player(playerData);
        await player.save();
        insertedCount++;
      } catch (error) {
        console.log(`⚠️  Error insertando jugador: ${error.message}`);
      }
    }

    console.log(`\n✅ ${insertedCount} jugadores creados exitosamente para ${teamsWithSport.length} equipos`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedPlayers();