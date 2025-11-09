const mongoose = require('mongoose');
const Sport = require('../models/sport');
require('dotenv').config();

const sportsData = [
  {
    name: 'Fútbol',
    description: 'Deporte de equipo jugado con un balón esférico entre dos conjuntos de once jugadores',
    positions: [
      { name: 'Portero', abbreviation: 'POR', description: 'Encargado de proteger la portería' },
      { name: 'Defensa Central', abbreviation: 'DFC', description: 'Defensa que juega en el centro' },
      { name: 'Lateral Derecho', abbreviation: 'LTD', description: 'Defensa que juega por la banda derecha' },
      { name: 'Lateral Izquierdo', abbreviation: 'LTI', description: 'Defensa que juega por la banda izquierda' },
      { name: 'Mediocampista Defensivo', abbreviation: 'MCD', description: 'Mediocampista con funciones defensivas' },
      { name: 'Mediocampista Central', abbreviation: 'MC', description: 'Mediocampista de enlace' },
      { name: 'Mediocampista Ofensivo', abbreviation: 'MCO', description: 'Mediocampista con funciones ofensivas' },
      { name: 'Extremo Derecho', abbreviation: 'ED', description: 'Delantero que juega por la banda derecha' },
      { name: 'Extremo Izquierdo', abbreviation: 'EI', description: 'Delantero que juega por la banda izquierda' },
      { name: 'Delantero Centro', abbreviation: 'DC', description: 'Delantero principal encargado de marcar goles' }
    ]
  },
  {
    name: 'Baloncesto',
    description: 'Deporte de equipo jugado entre dos conjuntos de cinco jugadores cada uno',
    positions: [
      { name: 'Base', abbreviation: 'BASE', description: 'Organizador del juego, maneja el balón' },
      { name: 'Escolta', abbreviation: 'ESC', description: 'Ayudante del base, buen tirador' },
      { name: 'Alero', abbreviation: 'ALE', description: 'Jugador versátil, anota y defiende' },
      { name: 'Ala-Pívot', abbreviation: 'A-P', description: 'Jugador interior, rebote y anotación cerca' },
      { name: 'Pívot', abbreviation: 'PIV', description: 'Jugador más alto, defensa y anotación en la pintura' }
    ]
  },
  {
    name: 'Voleibol',
    description: 'Deporte donde dos equipos se enfrentan separados por una red central',
    positions: [
      { name: 'Armador', abbreviation: 'ARM', description: 'Organiza el ataque y distribuye el balón' },
      { name: 'Opuesto', abbreviation: 'OPU', description: 'Atacante principal, juega frente al armador' },
      { name: 'Central', abbreviation: 'CEN', description: 'Especialista en bloqueo y ataques rápidos' },
      { name: 'Receptor-Atacante', abbreviation: 'REC', description: 'Recibe el saque y ataca' },
      { name: 'Líbero', abbreviation: 'LIB', description: 'Especialista defensivo, no ataca ni bloquea' }
    ]
  },
  {
    name: 'Béisbol',
    description: 'Deporte de bate y pelota entre dos equipos de nueve jugadores',
    positions: [
      { name: 'Lanzador', abbreviation: 'P', description: 'Pitcher, lanza la pelota al bateador' },
      { name: 'Receptor', abbreviation: 'C', description: 'Catcher, recibe los lanzamientos' },
      { name: 'Primera Base', abbreviation: '1B', description: 'Defensa de primera base' },
      { name: 'Segunda Base', abbreviation: '2B', description: 'Defensa de segunda base' },
      { name: 'Tercera Base', abbreviation: '3B', description: 'Defensa de tercera base' },
      { name: 'Shortstop', abbreviation: 'SS', description: 'Entre segunda y tercera base' },
      { name: 'Jardinero Izquierdo', abbreviation: 'LF', description: 'Defensa del jardín izquierdo' },
      { name: 'Jardinero Central', abbreviation: 'CF', description: 'Defensa del jardín central' },
      { name: 'Jardinero Derecho', abbreviation: 'RF', description: 'Defensa del jardín derecho' }
    ]
  },
  {
    name: 'Fútbol Americano',
    description: 'Deporte de contacto entre dos equipos de once jugadores',
    positions: [
      { name: 'Quarterback', abbreviation: 'QB', description: 'Líder ofensivo, lanza o entrega el balón' },
      { name: 'Running Back', abbreviation: 'RB', description: 'Corredor, avanza con el balón' },
      { name: 'Wide Receiver', abbreviation: 'WR', description: 'Receptor de pases' },
      { name: 'Tight End', abbreviation: 'TE', description: 'Bloqueador y receptor' },
      { name: 'Liniero Ofensivo', abbreviation: 'OL', description: 'Protege al quarterback' },
      { name: 'Liniero Defensivo', abbreviation: 'DL', description: 'Presiona al quarterback' },
      { name: 'Linebacker', abbreviation: 'LB', description: 'Defensa versátil' },
      { name: 'Cornerback', abbreviation: 'CB', description: 'Cubre a los receptores' },
      { name: 'Safety', abbreviation: 'S', description: 'Última línea de defensa' }
    ]
  },
  {
    name: 'Tenis',
    description: 'Deporte de raqueta que se practica entre dos jugadores o dos parejas',
    positions: [
      { name: 'Singlista', abbreviation: 'SGL', description: 'Jugador individual' },
      { name: 'Doblista', abbreviation: 'DBL', description: 'Jugador de dobles' },
      { name: 'Revés', abbreviation: 'REV', description: 'Especialista en golpes de revés' },
      { name: 'Derecha', abbreviation: 'DER', description: 'Especialista en golpes de derecha' },
      { name: 'Servidor', abbreviation: 'SER', description: 'Especialista en saques' }
    ]
  },
  {
    name: 'Natación',
    description: 'Deporte acuático que consiste en nadar con la mayor velocidad posible',
    positions: [
      { name: 'Estilo Libre', abbreviation: 'LIB', description: 'Especialista en estilo libre/crol' },
      { name: 'Mariposa', abbreviation: 'MAR', description: 'Especialista en estilo mariposa' },
      { name: 'Espalda', abbreviation: 'ESP', description: 'Especialista en estilo espalda' },
      { name: 'Pecho', abbreviation: 'PEC', description: 'Especialista en estilo pecho/braza' },
      { name: 'Combinado', abbreviation: 'COM', description: 'Especialista en estilos combinados' },
      { name: 'Relevos', abbreviation: 'REL', description: 'Participante en pruebas de relevos' }
    ]
  },
  {
    name: 'Atletismo',
    description: 'Deporte que contiene un conjunto de disciplinas agrupadas en carreras, saltos, lanzamientos y pruebas combinadas',
    positions: [
      { name: 'Velocista', abbreviation: 'VEL', description: 'Especialista en carreras cortas' },
      { name: 'Fondista', abbreviation: 'FON', description: 'Especialista en carreras largas' },
      { name: 'Mediofondista', abbreviation: 'MED', description: 'Especialista en carreras de medio fondo' },
      { name: 'Saltador de Altura', abbreviation: 'ALT', description: 'Especialista en salto de altura' },
      { name: 'Saltador de Longitud', abbreviation: 'LON', description: 'Especialista en salto de longitud' },
      { name: 'Lanzador de Peso', abbreviation: 'PES', description: 'Especialista en lanzamiento de peso' },
      { name: 'Lanzador de Jabalina', abbreviation: 'JAB', description: 'Especialista en lanzamiento de jabalina' },
      { name: 'Decatleta', abbreviation: 'DEC', description: 'Especialista en decatlón' }
    ]
  },
  {
    name: 'Rugby',
    description: 'Deporte de contacto en equipo nacido en Inglaterra',
    positions: [
      { name: 'Pilar', abbreviation: 'PIL', description: 'Jugador del frente del scrum' },
      { name: 'Talonador', abbreviation: 'TAL', description: 'Jugador que introduce el balón en el scrum' },
      { name: 'Segunda Línea', abbreviation: 'SL', description: 'Jugador que empuja en el scrum' },
      { name: 'Ala', abbreviation: 'ALA', description: 'Jugador versátil, rápido y buen tackleador' },
      { name: 'Medio Melé', abbreviation: 'MM', description: 'Organizador del juego, saca el balón del scrum' },
      { name: 'Apertura', abbreviation: 'APE', description: 'Principal pateador y organizador ofensivo' },
      { name: 'Centro', abbreviation: 'CEN', description: 'Jugador fuerte y rápido, rompe la defensa' },
      { name: 'Wing', abbreviation: 'WIN', description: 'Jugador más rápido, anota tries' },
      { name: 'Zaguero', abbreviation: 'ZAG', description: 'Última línea de defensa' }
    ]
  },
  {
    name: 'Hockey',
    description: 'Deporte en el que dos equipos compiten para llevar una pelota o disco a la portería contraria',
    positions: [
      { name: 'Portero', abbreviation: 'POR', description: 'Encargado de proteger la portería' },
      { name: 'Defensa', abbreviation: 'DEF', description: 'Jugador defensivo' },
      { name: 'Mediocampista', abbreviation: 'MED', description: 'Jugador de enlace entre defensa y ataque' },
      { name: 'Delantero', abbreviation: 'DEL', description: 'Jugador ofensivo encargado de anotar' },
      { name: 'Central', abbreviation: 'CEN', description: 'Mediocampista central' },
      { name: 'Extremo', abbreviation: 'EXT', description: 'Delantero que juega por las bandas' }
    ]
  },
  {
    name: 'Balonmano',
    description: 'Deporte de pelota en el que se enfrentan dos equipos de siete jugadores cada uno',
    positions: [
      { name: 'Portero', abbreviation: 'POR', description: 'Encargado de proteger la portería' },
      { name: 'Central', abbreviation: 'CEN', description: 'Organizador del ataque' },
      { name: 'Lateral', abbreviation: 'LAT', description: 'Jugador que ataca desde los laterales' },
      { name: 'Extremo', abbreviation: 'EXT', description: 'Jugador rápido que ataca desde las bandas' },
      { name: 'Pivote', abbreviation: 'PIV', description: 'Jugador ofensivo que juega cerca de la defensa rival' }
    ]
  },
  {
    name: 'Bádminton',
    description: 'Deporte de raqueta en el que se enfrentan dos jugadores o dos pareas en una pista dividida por una red',
    positions: [
      { name: 'Singlista', abbreviation: 'SGL', description: 'Jugador individual' },
      { name: 'Doblista', abbreviation: 'DBL', description: 'Jugador de dobles' },
      { name: 'Delantero', abbreviation: 'DEL', description: 'Jugador que ataca en la red' },
      { name: 'Zaguero', abbreviation: 'ZAG', description: 'Jugador que defiende el fondo' }
    ]
  },
  {
    name: 'Pádel',
    description: 'Deporte de raqueta que se juega en parejas en una pista cerrada',
    positions: [
      { name: 'Derecha', abbreviation: 'DER', description: 'Jugador que ocupa el lado derecho' },
      { name: 'Revés', abbreviation: 'REV', description: 'Jugador que ocupa el lado izquierdo' },
      { name: 'Red', abbreviation: 'RED', description: 'Especialista en juego en la red' },
      { name: 'Fondo', abbreviation: 'FON', description: 'Especialista en juego de fondo' }
    ]
  },
  {
    name: 'Ciclismo',
    description: 'Deporte que se desarrolla sobre una bicicleta',
    positions: [
      { name: 'Esprínter', abbreviation: 'SPR', description: 'Especialista en llegadas al esprín' },
      { name: 'Escalador', abbreviation: 'ESC', description: 'Especialista en subidas' },
      { name: 'Rodador', abbreviation: 'ROD', description: 'Especialista en terrenos llanos' },
      { name: 'Gregario', abbreviation: 'GRE', description: 'Jugador de equipo que ayuda al líder' },
      { name: 'Contrarrelojista', abbreviation: 'CRL', description: 'Especialista en contrarreloj' }
    ]
  },
  {
    name: 'Gimnasia',
    description: 'Deporte que consiste en la realización de una secuencia de movimientos',
    positions: [
      { name: 'Artística', abbreviation: 'ART', description: 'Especialista en gimnasia artística' },
      { name: 'Rítmica', abbreviation: 'RIT', description: 'Especialista en gimnasia rítmica' },
      { name: 'Trampolín', abbreviation: 'TRA', description: 'Especialista en salto de trampolín' },
      { name: 'Aeróbica', abbreviation: 'AER', description: 'Especialista en gimnasia aeróbica' }
    ]
  }
];

const seedSports = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/liga-deportiva');
    console.log('📊 Conectado a MongoDB');

    // Eliminar deportes existentes
    await Sport.deleteMany({});
    console.log('🗑️ Deportes existentes eliminados');

    // Insertar nuevos deportes
    await Sport.insertMany(sportsData);
    console.log('✅ Deportes precargados exitosamente:');
    
    sportsData.forEach(sport => {
      console.log(`   🏆 ${sport.name} - ${sport.positions.length} posiciones`);
    });

    console.log(`\n📈 Total: ${sportsData.length} deportes precargados`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedSports();