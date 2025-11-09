const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  // Información personal
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
  identification: {
    type: String,
    required: true,
    unique: true,
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
    },
    skillLevel: {
      type: String,
      enum: ['Principiante', 'Intermedio', 'Avanzado', 'Élite'],
      default: 'Intermedio'
    }
  }],
  teamInternalId: {
    type: String,
    required: true
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
  jerseyNumber: {
    type: Number,
    min: 1,
    max: 99
  },
  dominantFoot: {
    type: String,
    enum: ['Derecho', 'Izquierdo', 'Ambidiestro', null],
    default: null
  },
  experience: {
    type: String,
    enum: ['Principiante', 'Recreativo', 'Competitivo', 'Profesional'],
    default: 'Recreativo'
  },
  
  // Estado del jugador
  isActive: {
    type: Boolean,
    default: true
  },
  injuries: [{
    description: String,
    date: Date,
    recoveryDate: Date,
    status: {
      type: String,
      enum: ['Activo', 'En tratamiento', 'Recuperado'],
      default: 'Activo'
    }
  }],
  
  // Estadísticas
  stats: {
    gamesPlayed: { type: Number, default: 0 },
    goals: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    yellowCards: { type: Number, default: 0 },
    redCards: { type: Number, default: 0 }
  },

  // ✅ AGREGAR este campo si existe en la base de datos
  registrationFolio: {
    type: String,
    unique: true,
    sparse: true // ✅ Esto permite valores null sin conflictos de duplicados
  }
}, {
  timestamps: true
});

// ✅ SOLO estos índices (elimina los duplicados)
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