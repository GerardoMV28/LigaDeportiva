const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
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
  sex: {
    type: String,
    enum: ['Masculino', 'Femenino', 'Otro'],
    required: true
  },
  birthDate: {
    type: Date,
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  height: {
    type: Number,
    required: true
  },
  nickname: {
    type: String,
    trim: true
  },
  position: {
    type: String,
    required: true
  },
  photo: {
    type: String,
    default: ''
  },
  birthCity: {
    type: String,
    required: true
  },
  yearsInSport: {
    type: Number,
    required: true
  },
  individualWarnings: {
    type: Number,
    default: 0
  },
  points: {
    type: Number,
    default: 0
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  hobbies: [{
    type: String
  }],
  favoriteMusic: {
    type: String
  },
  socialMedia: {
    twitter: String,
    instagram: String,
    facebook: String
  },
  favoritePlayer: {
    type: String
  },
  registrationFolio: {
    type: String,
    unique: true
  },
  teamInternalId: {
    type: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Player', playerSchema);