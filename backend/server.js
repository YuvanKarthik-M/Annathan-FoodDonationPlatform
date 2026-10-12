const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => console.log('❌ MongoDB Connection Error:', err));

const User = require('./models/User');
const Donation = require('./models/Donation');

// ========== AUTH ROUTES ==========
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    
    // Security: Prevent public creating admin accounts
    if (role === 'admin') {
      return res.status(403).json({ message: "Admin accounts cannot be created publicly. Please contact an existing administrator." });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user = new User({ name, email, password: hashedPassword, phone, role });
    await user.save();
    res.status(201).json({ message: 'User created successfully', user: { id: user._id, name: user.name, role: user.role } });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    if (user.isBlocked) return res.status(403).json({ message: 'Your account has been restricted by an Administrator.' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    res.json({ message: 'Login successful', user: { id: user._id, name: user.name, role: user.role, location: user.location, isOnline: user.isOnline ?? true } });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

// ========== MAP / GEOSPATIAL ROUTES ==========
// Update NGO Location Headquarters
app.put('/api/users/:id/location', async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const updatedUser = await User.findByIdAndUpdate(req.params.id, {
      location: { type: 'Point', coordinates: [Number(lng), Number(lat)] }
    }, { new: true });
    res.json(updatedUser);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

// Create Donation & AI AUTO-ASSIGN
app.post('/api/donations', async (req, res) => {
  try {
    const { foodType, quantity, address, description, timeLimit, donorId, lat, lng, image } = req.body;
    const donorCoords = [Number(lng), Number(lat)];

    const newDonation = new Donation({
      donorId, foodType, quantity, address, description, timeLimit, image,
      location: { type: 'Point', coordinates: donorCoords }
    });

    // Sequential Assignment Logic: Find the single nearest NGO within 50km that is online and active
    const nearestNgo = await User.findOne({
      role: 'ngo',
      isBlocked: false,
      isOnline: { $ne: false },
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: donorCoords },
          $maxDistance: 50000 // 50km global service reach
        }
      }
    });

    if (nearestNgo) {
      newDonation.assignedTo = nearestNgo._id;
    }
    
    await newDonation.save();
    res.status(201).json({ 
      newDonation, 
      assignedNgoId: nearestNgo ? nearestNgo._id : null,
      message: !nearestNgo ? "No NGOs found within 50km radius." : null 
    });
  } catch (error) { console.log(error); res.status(500).json({ message: 'Server error' }); }
});

// Get Pending Donations automatically routed to EXACT NGO's zone
app.get('/api/donations', async (req, res) => {
  try {
    const { ngoId, lat, lng } = req.query;
    if (!ngoId) return res.json([]);

    // 1. Fetch exactly assigned donations for this NGO
    const assignedDonations = await Donation.find({ 
      status: 'pending', 
      assignedTo: ngoId,
      timeLimit: { $gt: new Date() }
    });

    // 2. We no longer show "nearby pool" as assignment is sequential/direct
    const combined = assignedDonations;
    
    // Sort and Populate
    combined.sort((a, b) => new Date(a.timeLimit) - new Date(b.timeLimit));
    await Donation.populate(combined, { path: 'donorId', select: 'name email phone' });

    res.json(combined);
  } catch (error) { 
    console.error('Donation Fetch Error:', error);
    res.status(500).json({ message: 'Server error' }); 
  }
});

// Accept/Reject Donation
app.put('/api/donations/:id', async (req, res) => {
  try {
    const { status, ngoId } = req.body;
    
    const existingDonation = await Donation.findById(req.params.id);
    if (!existingDonation) return res.status(404).json({ message: 'Donation not found' });

    // Expiry Check: Only block if trying to ACCEPT a donation that is already expired.
    // If it was already accepted, the NGO should still be allowed to finish the collection.
    const isExpired = new Date(existingDonation.timeLimit) < new Date();
    if (status === 'accepted' && isExpired) {
      return res.status(400).json({ message: 'This donation has expired and can no longer be accepted.' });
    }

    // Race Condition Check (Status changed by someone else)
    if (status === 'accepted' && existingDonation.status !== 'pending') {
      return res.status(400).json({ message: 'This donation has already been accepted by another NGO.' });
    }

    let update = { status };
    if (status === 'accepted') update.claimedBy = ngoId;
    if (status === 'completed') {
      update.claimedBy = ngoId;
      update.collectedAt = new Date();
    }
    
    // IF rejected, find the NEXT nearest NGO within 50km
    if (status === 'rejected') {
       const rejectedNgoId = ngoId;
       const donation = await Donation.findById(req.params.id);
       
       // Record this rejection
       const updatedRejected = [...donation.rejectedBy, rejectedNgoId];
       
       // Find next nearest online NGO
       const nextNgo = await User.findOne({
         role: 'ngo',
         isBlocked: false,
         isOnline: { $ne: false },
         _id: { $nin: updatedRejected },
         location: {
           $near: {
             $geometry: donation.location,
             $maxDistance: 50000
           }
         }
       });

       update.status = nextNgo ? 'pending' : 'rejected';
       update.assignedTo = nextNgo ? nextNgo._id : null; 
       update.$unset = { claimedBy: "" };
       update.$addToSet = { rejectedBy: rejectedNgoId };
    }

    const donation = await Donation.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(donation);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

// Edit Donation (Donor Only)
app.put('/api/donations/:id/edit', async (req, res) => {
  try {
    const { foodType, quantity, address, description, timeLimit, image } = req.body;
    const donation = await Donation.findById(req.params.id);
    
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    if (donation.status !== 'pending') return res.status(400).json({ message: 'Cannot edit a donation that has already been accepted or completed.' });

    const updated = await Donation.findByIdAndUpdate(req.params.id, { 
      foodType, quantity, address, description, timeLimit, image 
    }, { new: true });
    res.json(updated);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

// Delete Donation
app.delete('/api/donations/:id', async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    if (donation.status !== 'pending') return res.status(400).json({ message: 'Cannot delete a donation that has already been accepted or completed.' });

    await Donation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Donation removed successfully' });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

// History
app.get('/api/donations/history', async (req, res) => {
  try {
    const { donorId, ngoId } = req.query;
    let query = {};
    if (donorId) query.donorId = donorId;
    if (ngoId) query.claimedBy = ngoId;
    const donations = await Donation.find(query).populate('donorId', 'name email phone').populate('claimedBy', 'name email phone').sort({ createdAt: -1 });
    
    // For donor history, we might want to flag if all nearby NGOs have rejected it
    const enhanced = await Promise.all(donations.map(async d => {
      if (d.status !== 'pending') return d.toObject();
      
      const nearbyNgosCount = await User.countDocuments({
        role: 'ngo',
        location: {
          $geoWithin: {
            $centerSphere: [ d.location.coordinates, 50 / 6378.1 ] // Global 50km limit
          }
        }
      });
      
      const obj = d.toObject();
      obj.allRejected = nearbyNgosCount > 0 && d.rejectedBy.length >= nearbyNgosCount;
      return obj;
    }));

    res.json(enhanced);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

// ========== ADMIN ROUTES ==========
app.get('/api/admin/stats', async (req, res) => {
  try {
    const ngoCount = await User.countDocuments({ role: 'ngo' });
    const donationCount = await Donation.countDocuments();
    res.json({ ngoCount, donationCount });
  } catch(e) { res.status(500).json({message: 'Server error'}) }
});

app.get('/api/admin/ngos', async (req, res) => {
  try {
    const ngos = await User.find({ role: 'ngo' }, 'name email phone location serviceRadiusKm isBlocked');
    res.json(ngos);
  } catch(e) { res.status(500).json({message: 'Server error'}) }
});

// PUBLIC: Fetch all active NGOs for Landing Page coverage map
app.get('/api/public/ngos', async (req, res) => {
  try {
    const ngos = await User.find({ role: 'ngo', isBlocked: false }, 'name location serviceRadiusKm');
    res.json(ngos);
  } catch(e) { res.status(500).json({message: 'Server error'}) }
});

app.put('/api/admin/ngos/:id/toggle-block', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json(user);
  } catch(e) { res.status(500).json({message: 'Server error'}) }
});

// ========== USER PROFILE ROUTES ==========
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '-password');
    res.json(user);
  } catch(e) { res.status(500).json({message: 'Server error'}) }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { name, phone, profilePicture } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { name, phone, profilePicture }, { new: true, select: '-password' });
    res.json(user);
  } catch(e) { res.status(500).json({message: 'Server error'}) }
});

app.put('/api/users/:id/status', async (req, res) => {
  try {
    const { isOnline } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isOnline }, { new: true, select: '-password' });
    res.json(user);
  } catch(e) { res.status(500).json({message: 'Server error'}) }
});

const PORT = process.env.PORT || 5000;
// ADMIN: Add another admin
app.post('/api/admin/add-admin', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new User({
      name,
      email,
      password: hashedPassword,
      role: 'admin'
    });

    await newAdmin.save();
    res.status(201).json({ message: 'Admin account created successfully' });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
