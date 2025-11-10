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
  stats: {
    individualWarnings: { type: Number, default: 0 },
    accumulatedPoints: { type: Number, default: 0 },
    gamesWon: { type: Number, default: 0 },
    gamesLost: { type: Number, default: 0 },
    totalWarnings: { type: Number, default: 0 }
  },

  registrationFolio: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Índices
playerSchema.index({ team: 1, teamInternalId: 1 });

// Métodos virtuales
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