const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sport',
    required: true
  },
  category: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  logo: {
    type: String,
    default: ''
  },
  colors: [{
    type: String
  }],
  
  gamesPlayed: {
    type: Number,
    default: 0
  },
  gamesWon: {
    type: Number,
    default: 0
  },
  gamesLost: {
    type: Number,
    default: 0
  },
  gamesDrawn: {
    type: Number,
    default: 0
  },
  goalsFor: {
    type: Number,
    default: 0
  },
  goalsAgainst: {
    type: Number,
    default: 0
  },
  points: {
    type: Number,
    default: 0
  },

  foundedYear: {
    type: Number
  },
  location: {
    type: String,
    trim: true
  },
  coach: {
    type: String,
    trim: true
  },
  captain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  registrationDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

teamSchema.virtual('goalDifference').get(function() {
  return this.goalsFor - this.goalsAgainst;
});

teamSchema.virtual('winPercentage').get(function() {
  if (this.gamesPlayed === 0) return 0;
  return ((this.gamesWon / this.gamesPlayed) * 100).toFixed(1);
});

module.exports = mongoose.model('Team', teamSchema);