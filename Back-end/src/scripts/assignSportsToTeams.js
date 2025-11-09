const mongoose = require('mongoose');
const Team = require('../models/team');
const Sport = require('../models/sport');
require('dotenv').config();

const assignSportsToTeams = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/liga-deportiva');
    console.log('📊 Conectado a MongoDB');

    // Obtener todos los deportes disponibles
    const sports = await Sport.find();
    console.log(`🏆 Deportes disponibles: ${sports.length}`);
    sports.forEach(sport => {
      console.log(`   - ${sport.name} (${sport._id})`);
    });

    if (sports.length === 0) {
      console.log('❌ No hay deportes disponibles. Ejecuta primero seedSports.js');
      process.exit(1);
    }

    // Obtener equipos sin deporte asignado
    const teamsWithoutSport = await Team.find({ sport: { $exists: false } });
    console.log(`\n📋 Equipos sin deporte asignado: ${teamsWithoutSport.length}`);

    if (teamsWithoutSport.length === 0) {
      console.log('✅ Todos los equipos ya tienen deporte asignado.');
      process.exit(0);
    }

    // Mostrar equipos sin deporte
    teamsWithoutSport.forEach(team => {
      console.log(`   - ${team.name} (${team._id})`);
    });

    // Asignar deportes automáticamente basado en el nombre del equipo
    let assignedCount = 0;
    const assignmentLog = [];

    for (const team of teamsWithoutSport) {
      let assignedSport = null;

      // Buscar deporte por coincidencia en el nombre del equipo
      const teamNameLower = team.name.toLowerCase();

      // Mapeo de palabras clave a deportes
      const sportKeywords = {
        'futbol': 'Fútbol',
        'fútbol': 'Fútbol',
        'soccer': 'Fútbol',
        'football': 'Fútbol Americano',
        'baloncesto': 'Baloncesto',
        'basketball': 'Baloncesto',
        'basquetbol': 'Baloncesto',
        'voleibol': 'Voleibol',
        'volleyball': 'Voleibol',
        'beisbol': 'Béisbol',
        'béisbol': 'Béisbol',
        'baseball': 'Béisbol',
        'tenis': 'Tenis',
        'tennis': 'Tenis',
        'natacion': 'Natación',
        'natación': 'Natación',
        'swimming': 'Natación',
        'atletismo': 'Atletismo',
        'athletics': 'Atletismo',
        'rugby': 'Rugby',
        'hockey': 'Hockey',
        'balonmano': 'Balonmano',
        'handball': 'Balonmano',
        'badminton': 'Bádminton',
        'padel': 'Pádel',
        'pádel': 'Pádel',
        'ciclismo': 'Ciclismo',
        'cycling': 'Ciclismo',
        'gimnasia': 'Gimnasia',
        'gymnastics': 'Gimnasia'
      };

      // Buscar coincidencia por palabras clave
      let assignmentMethod = 'Aleatorio';
      for (const [keyword, sportName] of Object.entries(sportKeywords)) {
        if (teamNameLower.includes(keyword)) {
          assignedSport = sports.find(s => s.name === sportName);
          if (assignedSport) {
            assignmentMethod = 'Por nombre';
            break;
          }
        }
      }

      // Si no se encontró por palabra clave, asignar un deporte aleatorio
      if (!assignedSport) {
        const randomIndex = Math.floor(Math.random() * sports.length);
        assignedSport = sports[randomIndex];
      }

      // Actualizar el equipo con el deporte asignado
      team.sport = assignedSport._id;
      await team.save();
      await team.populate('sport');

      assignedCount++;
      assignmentLog.push({
        team: team.name,
        sport: assignedSport.name,
        method: assignmentMethod
      });

      console.log(`✅ Asignado: ${team.name} → ${assignedSport.name} (${assignmentMethod})`);
    }

    // Mostrar resumen
    console.log(`\n📊 RESUMEN DE ASIGNACIÓN:`);
    console.log(`✅ Equipos actualizados: ${assignedCount}`);
    console.log(`📝 Detalles:`);
    
    assignmentLog.forEach(log => {
      console.log(`   - ${log.team} → ${log.sport} (${log.method})`);
    });

    // Estadísticas por deporte
    console.log(`\n🏆 DISTRIBUCIÓN POR DEPORTE:`);
    const teamsWithSport = await Team.find().populate('sport');
    const sportDistribution = {};

    teamsWithSport.forEach(team => {
      if (team.sport) {
        const sportName = team.sport.name;
        sportDistribution[sportName] = (sportDistribution[sportName] || 0) + 1;
      }
    });

    Object.entries(sportDistribution).forEach(([sport, count]) => {
      console.log(`   - ${sport}: ${count} equipos`);
    });

    console.log(`\n🎯 Total de equipos con deporte: ${teamsWithSport.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

assignSportsToTeams();