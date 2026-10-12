const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['donor', 'ngo', 'admin'], default: 'donor' },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [80.2707, 13.0827] } // default to Chennai [lng, lat]
  },
  serviceRadiusKm: { type: Number, default: 15 },
  isBlocked: { type: Boolean, default: false },
  isOnline: { type: Boolean, default: true },
  profilePicture: { type: String, default: '' }
}, { timestamps: true });

userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);
