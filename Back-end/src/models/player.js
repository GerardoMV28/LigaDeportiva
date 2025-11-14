const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  birthDate: {
    type: Date,
    required: true
  },
  gender: { 
    type: String,
    enum: ['Masculino', 'Femenino', 'Otro', ''],
    default: ''
  },
  nickname: { 
    type: String,
    trim: true
  },
  photo: {
  type: String,
  default: ''
  },
  birthCity: { 
    type: String,
    trim: true
  },
  
  // Información deportiva
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  positions: [{
    position: {
      type: String,
      required: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  teamInternalId: {
    type: String,
    required: true
  },
  jerseyNumber: {
    type: Number,
    min: 1,
    max: 99
  },
  yearsOfExperience: { // ✅ NUEVO CAMPO
    type: Number,
    default: 0,
    min: 0,
    max: 50
  },
  
  // Características físicas
  height: {
    type: Number,
    min: 100,
    max: 250
  },
  weight: {
    type: Number,
    min: 30,
    max: 200
  },
  
  // Información adicional
  hobbies: { // ✅ NUEVO CAMPO
    type: String,
    trim: true
  },
  favoriteMusic: { // ✅ NUEVO CAMPO
    type: String,
    trim: true
  },
  socialMedia: { // ✅ NUEVO CAMPO
    type: String,
    trim: true
  },
  
  // Estado del jugador
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Estadísticas - ACTUALIZAR para coincidir con el frontend
// Estadísticas - ACTUALIZAR para coincidir con el frontend
stats: {
  // Estadísticas generales
  gamesPlayed: { type: Number, default: 0 },
  gamesWon: { type: Number, default: 0 },
  gamesLost: { type: Number, default: 0 },
  accumulatedPoints: { type: Number, default: 0 },
  individualWarnings: { type: Number, default: 0 },
  
  // Estadísticas de fútbol
  goals: { type: Number, default: 0 },
  assists: { type: Number, default: 0 },
  yellowCards: { type: Number, default: 0 },
  redCards: { type: Number, default: 0 },
  
  // Estadísticas de otros deportes
  points: { type: Number, default: 0 },
  rebounds: { type: Number, default: 0 },
  fouls: { type: Number, default: 0 },
  bestTime: { type: String, default: '' },
  swimStyle: { type: String, default: '' },
  metersSwum: { type: Number, default: 0 },
  competitions: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  bestMark: { type: String, default: '' },
  distance: { type: String, default: '' },
  podiums: { type: Number, default: 0 },
  records: { type: Number, default: 0 },
  tries: { type: Number, default: 0 },
  conversions: { type: Number, default: 0 },
  penalties: { type: Number, default: 0 },
  cards: { type: Number, default: 0 },
  exclusions: { type: Number, default: 0 },
  saves: { type: Number, default: 0 },
  setsWon: { type: Number, default: 0 },
  tournaments: { type: Number, default: 0 },
  sets: { type: Number, default: 0 },
  races: { type: Number, default: 0 },
  kilometers: { type: Number, default: 0 },
  medals: { type: Number, default: 0 },
  maxScore: { type: Number, default: 0 },
  apparatus: { type: String, default: '' },
  level: { type: String, default: '' }
},

  registrationFolio: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

playerSchema.index({ team: 1, teamInternalId: 1 });

playerSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

playerSchema.virtual('age').get(function() {
  if (!this.birthDate) return null;
  const today = new Date();
  const birthDate = new Date(this.birthDate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

module.exports = mongoose.model('Player', playerSchema);