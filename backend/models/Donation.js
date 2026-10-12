const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  foodType: { type: String, required: true },
  quantity: { type: String, required: true },
  address: { type: String, required: true },
  description: { type: String },
  timeLimit: { type: Date, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },
  image: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'completed'], default: 'pending' },
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // The AI Auto-assigned NGO
  rejectedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Track who "passed" this request
  collectedAt: { type: Date }
}, { timestamps: true });

donationSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Donation', donationSchema);
