const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  abbreviation: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    maxlength: 5
  },
  description: {
    type: String,
    trim: true
  }
});

const sportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  positions: [positionSchema]
}, {
  timestamps: true
});

sportSchema.index({ name: 1 });

module.exports = mongoose.model('Sport', sportSchema);