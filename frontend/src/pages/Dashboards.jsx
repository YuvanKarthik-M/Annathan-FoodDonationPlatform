import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Activity, Settings, LogOut, Package, Users, Bell, MapPin, Clock, Map as MapIcon, Crosshair, Trash2, ShieldCheck, ArrowRight, Trophy, TrendingUp, Power, Mail, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// Leaflet Map Imports
import { MapContainer, TileLayer, Marker, useMapEvents, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';

const customIcon = new L.Icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Countdown Timer Component
const CountdownTimer = ({ expiryString }) => {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const timer = setInterval(() => {
      const diff = new Date(expiryString).getTime() - new Date().getTime();
      if (diff <= 0) {
        setTimeLeft('EXPIRED');
        clearInterval(timer);
      } else {
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hrs}h ${mins}m ${secs}s left`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [expiryString]);

  return <span style={{ color: timeLeft === 'EXPIRED' ? '#ef4444' : '#eab308' }}>{timeLeft || 'Calculating...'}</span>;
};

// A component to capture clicks on the map
function LocationPicker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });
  return position ? <Marker position={position} icon={customIcon} /> : null;
}

// User Profile Editing Tool
export const ProfileTab = ({ user, setUser }) => {
  const [formData, setFormData] = useState({ name: '', phone: '', profilePicture: '' });

  useEffect(() => {
    if (!user || !user.id) return;
    fetch(`http://localhost:5000/api/users/${user.id}`)
      .then(res => res.json())
      .then(data => {
        setFormData({ name: data.name || '', phone: data.phone || '', profilePicture: data.profilePicture || '' });
      });
  }, [user]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setFormData({ ...formData, profilePicture: reader.result }); }
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`http://localhost:5000/api/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      const updated = await res.json();
      const u = { ...user, ...updated, id: updated._id }; // Sync full user object
      localStorage.setItem('user', JSON.stringify(u));
      setUser(u);
      alert('Profile Updated Successfully!');
    }
  };

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h3 className="font-bold text-xl mb-6 border-b border-[var(--border)] pb-4">My Account Profile</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-4 mb-4">
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--surface)', overflow: 'hidden', border: '2px solid var(--primary)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {formData.profilePicture ? (
              <img src={formData.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span className="text-muted text-sm">No Image</span>
            )}
          </div>
          <label className="btn btn-outline" style={{ cursor: 'pointer', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
            Upload New Image
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
          </label>
        </div>
        <div>
          <label className="form-label text-primary">Full Name / Organization Name</label>
          <input type="text" className="form-input" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
        </div>
        <div>
          <label className="form-label text-primary">Contact Phone Number</label>
          <input type="text" className="form-input" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
        </div>
        <button type="submit" className="btn btn-primary w-full mt-4" style={{ padding: '1rem', fontSize: '1.1rem' }}>Save Configuration</button>
      </form>
    </div>
  );
};

export function DashboardLayout({ user, role, children, activeTab, setActiveTab }) {
  const navigate = useNavigate();

  const getNavStyle = (tabName) => {
    const isActive = activeTab === tabName;
    return {
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      fontWeight: 500,
      background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
      color: isActive ? 'var(--primary)' : 'var(--text-muted)'
    };
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <div style={{ width: '260px', minWidth: '260px', background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border)' }}>
          <Heart className="text-primary" size={24} />
          <span className="font-bold text-xl text-main">Annathan</span>
        </div>

        <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button onClick={() => setActiveTab('home')} className="flex items-center gap-4 w-full" style={getNavStyle('home')}>
            <Activity size={20} /> Overview
          </button>

          {role === 'donor' && (
            <button onClick={() => setActiveTab('donate')} className="flex items-center gap-4 w-full" style={getNavStyle('donate')}>
              <Package size={20} /> Donate Food
            </button>
          )}

          {role === 'ngo' && (
            <>
              <button onClick={() => setActiveTab('hq')} className="flex items-center gap-4 w-full" style={getNavStyle('hq')}>
                <MapPin size={20} /> Location
              </button>
              <button onClick={() => setActiveTab('donations')} className="flex items-center gap-4 w-full" style={getNavStyle('donations')}>
                <Package size={20} /> Donations
              </button>
            </>
          )}

          {role === 'admin' && (
            <>
              <button onClick={() => setActiveTab('users')} className="flex items-center gap-4 w-full" style={getNavStyle('users')}>
                <Users size={20} /> Network & NGOs
              </button>
              <button onClick={() => setActiveTab('admins')} className="flex items-center gap-4 w-full" style={getNavStyle('admins')}>
                <ShieldCheck size={20} /> Manage Admins
              </button>
            </>
          )}

          <button onClick={() => setActiveTab('profile')} className="flex items-center gap-4 w-full" style={getNavStyle('profile')}>
            <Settings size={20} /> Profile Settings
          </button>
        </nav>

        <div style={{ padding: '1.5rem 1rem', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => { localStorage.removeItem('user'); navigate('/login'); }}
            className="flex items-center gap-4 w-full"
            style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', fontWeight: 500, color: 'var(--danger)', transition: 'background 0.2s' }}
            onMouseOver={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
            onMouseOut={(e) => e.target.style.background = 'transparent'}
          >
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ background: 'var(--surface)', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
          <h2 className="font-bold text-xl">{user ? `Welcome, ${user.name}` : `Loading...`} | <span className="text-primary">{role.toUpperCase()} AI Auto-Dispatcher</span></h2>
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab('profile')} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', overflow: 'hidden', padding: 0, border: 'none', cursor: 'pointer' }}>
              {user && user.profilePicture ? <img src={user.profilePicture} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : role.charAt(0).toUpperCase()}
            </button>
          </div>
        </header>

        <main style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export const DonorDashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);

  // Default Map center (Chennai, default zoom)
  const [position, setPosition] = useState({ lat: 13.0827, lng: 80.2707 });
  const [formData, setFormData] = useState({ foodType: '', quantity: '', address: '', description: '', timeLimit: '', image: '' });

  const handleDonationPhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setFormData({ ...formData, image: reader.result }); }
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (savedUser.id) {
      setUser(savedUser);
      fetchHistory(savedUser.id);
    }
  }, [activeTab]);

  const fetchHistory = async (donorId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/donations/history?donorId=${donorId}`);
      if (res.ok) setHistory(await res.json());
    } catch (e) { }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!position) return alert("Please drop a pin on the map!");

    const isEdit = !!formData._id;
    const url = isEdit ? `http://localhost:5000/api/donations/${formData._id}/edit` : 'http://localhost:5000/api/donations';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, donorId: user.id, lat: position.lat, lng: position.lng })
      });
      if (response.ok) {
        const data = await response.json();
        if (isEdit) {
          alert("✅ Donation details updated successfully!");
        } else {
          if (!data.assignedNgoId) {
            alert("⚠️ NOTICE: There are currently no NGOs available within a 50km radius. Your request will remain active in the system till one becomes available.");
          } else {
            alert(`✅ SUCCESS! Your request has been assigned to the nearest NGO within 50km. If they pass, our AI will automatically route it to the next nearest partner!`);
          }
        }

        setFormData({ foodType: '', quantity: '', address: '', description: '', timeLimit: '', image: '' });
        fetchHistory(user.id);
        setActiveTab('home');
      }
    } catch (err) {
      alert('Error processing donation');
    }
  };

  const deleteDonation = async (id) => {
    if (!window.confirm("Are you sure you want to remove this donation request?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/donations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchHistory(user.id);
        alert("Donation removed.");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete.");
      }
    } catch (e) { }
  };

  const startEdit = (donation) => {
    setFormData({ ...donation });
    setPosition({ lat: donation.location.coordinates[1], lng: donation.location.coordinates[0] });
    setActiveTab('donate');
  };

  return (
    <DashboardLayout user={user} role="donor" activeTab={activeTab} setActiveTab={setActiveTab}>

      {activeTab === 'home' && (
        <div>
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 className="font-bold text-2xl mb-2">Impact Dashboard</h2>
            <p className="text-muted">Tracking your contribution toward ending hunger in your local community.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
            <div className="card card-glow" style={{ borderTop: '4px solid #3b82f6', background: 'linear-gradient(135deg, var(--surface) 0%, #172554 100%)' }}>
              <div className="flex justify-between items-center p-4">
                <h2 style={{ color: '#3b82f6', fontSize: '1.25rem', fontWeight: 600 }}>Total Completed</h2>
                <h2 style={{ color: '#3b82f6', fontSize: '2rem', fontWeight: 700 }}>{history.filter(d => d.status === 'completed').length}</h2>
              </div>
            </div>

            <div className="card card-glow" style={{ borderTop: '4px solid #f59e0b', background: 'linear-gradient(135deg, var(--surface) 0%, #451a03 100%)' }}>
              <div className="flex justify-between items-center p-4">
                <h2 style={{ color: '#f59e0b', fontSize: '1.25rem', fontWeight: 600 }}>Active Requests</h2>
                <h2 style={{ color: '#f59e0b', fontSize: '2rem', fontWeight: 700 }}>{history.filter(d => d.status === 'pending' || d.status === 'accepted').length}</h2>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl">Your Recent Donations</h3>
              <button onClick={() => fetchHistory(user.id)} className="text-xs text-primary font-bold hover:underline">REFRESH DATA</button>
            </div>
            {history.length === 0 ? <p className="text-muted">You haven't made any donations yet.</p> : (
              <div className="flex-col gap-6" style={{ display: 'flex' }}>
                {history.map(d => (
                  <div key={d._id} style={{ background: 'var(--bg-color)', padding: '1.5rem', borderRadius: '0.5rem', borderLeft: '4px solid var(--primary)', display: 'flex', gap: '1.5rem' }}>
                    {d.image && <img src={d.image} alt="Food" style={{ width: '100px', height: '100px', borderRadius: '0.5rem', objectFit: 'cover' }} />}
                    <div style={{ flex: 1 }}>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold">{d.foodType} ({d.quantity})</h4>
                        <div className="flex items-center gap-2">
                          {d.status === 'pending' && !(new Date(d.timeLimit) < new Date()) && (
                            <div className="flex gap-2 mr-4">
                              {!d.allRejected && <button onClick={() => startEdit(d)} className="text-xs text-primary hover:underline">Edit</button>}
                              <button onClick={() => deleteDonation(d._id)} className="hover:scale-125 transition-transform" style={{ color: 'var(--danger)', background: 'none', border: 'none', padding: '0.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                <Trash2 size={18} />
                              </button>
                            </div>
                          )}
                          {/* DYNAMIC STATUS BADGE */}
                          <span style={{
                            fontSize: '0.75rem',
                            padding: '0.2rem 0.5rem',
                            background: 'var(--surface)',
                            borderRadius: '0.25rem',
                            fontWeight: 'bold',
                            color: d.status === 'accepted' ? '#10b981' : d.status === 'completed' ? '#3b82f6' : (new Date(d.timeLimit) < new Date() ? '#ef4444' : (d.allRejected ? '#ef4444' : '#f59e0b'))
                          }}>
                            {d.status === 'accepted' ? 'ACCEPTED' : (d.status === 'completed' ? 'COMPLETED' : (new Date(d.timeLimit) < new Date() ? 'EXPIRED' : (d.allRejected ? 'REJECTED' : 'PENDING')))}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted mb-1"><strong>Status:</strong> {
                        d.status === 'accepted' ? 'Assigned & En Route' :
                          (d.status === 'completed' ? 'Completed' :
                            (new Date(d.timeLimit) < new Date() ? 'Time Limit Reached' :
                              (d.allRejected ? 'Rejected by all nearby NGOs' : 'Awaiting NGO Acceptance')))
                      }</p>
                      {d.status === 'completed' && (
                        <p className="text-xs text-muted mb-1 flex items-center gap-1">
                          <Clock size={13} className="text-primary inline" />
                          <strong>Time Collected:</strong> {new Date(d.collectedAt || d.updatedAt || d.createdAt).toLocaleString()}
                        </p>
                      )}

                      {d.allRejected && (
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.75rem', borderRadius: '0.5rem', marginTop: '0.75rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Bell size={16} />
                          <span>All nearby NGOs have passed this request. You may want to edit details or increase quantity to attract more help!</span>
                        </div>
                      )}
                      {d.claimedBy && (
                        <div style={{ background: 'var(--surface)', padding: '0.75rem', borderRadius: '0.5rem', marginTop: '0.5rem' }}>
                          <p className="text-sm font-bold text-primary mb-1">Claimed By: {d.claimedBy.name}</p>
                          <p className="text-xs text-muted">Phone: {d.claimedBy.phone || 'N/A'}</p>
                          <p className="text-xs text-muted">Email: {d.claimedBy.email}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'donate' && (
        <div className="card" style={{ maxWidth: '1000px' }}>
          <h3 className="font-bold text-lg mb-1">{formData._id ? 'Edit Your Donation' : 'Post a New Food Donation'}</h3>
          <p className="text-muted mb-6 text-sm">{formData._id ? 'Update the details of your active donation request.' : 'Tap on the map below exactly where the food is. Our AI will automatically assign it to the nearest NGO base!'}</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* THE MAP */}
            <div style={{ height: '300px', width: '100%', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <MapContainer center={[13.0827, 80.2707]} zoom={11} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationPicker position={position} setPosition={setPosition} />
              </MapContainer>
            </div>

            <div>
              <label className="form-label text-primary">Food Type (e.g. Vegetarian Meals, Raw Groceries)</label>
              <input type="text" className="form-input" required value={formData.foodType} onChange={e => setFormData({ ...formData, foodType: e.target.value })} />
            </div>
            <div className="flex gap-6">
              <div className="flex-1">
                <label className="form-label text-primary">Quantity</label>
                <input type="text" className="form-input" placeholder="e.g. 50 Servings" required value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} />
              </div>
              <div className="flex-1">
                <label className="form-label text-primary">Full Address Text</label>
                <input type="text" className="form-input" required value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="form-label text-primary">Description / Instructions</label>
              <textarea className="form-input" rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div>
              <label className="form-label text-primary">Auto-Expires At (Time Limit)</label>
              <input type="datetime-local" className="form-input" required value={formData.timeLimit} onChange={e => setFormData({ ...formData, timeLimit: e.target.value })} style={{ color: 'var(--text-main)', display: 'block' }} />
            </div>

            <div className="card" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px dashed var(--border)', padding: '1.5rem' }}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="font-bold mb-1">Food Photo / Proof</h4>
                  <p className="text-xs text-muted">Upload a clear photo to help NGOs identify and prioritize.</p>
                </div>
                <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
                  Choose Photo
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleDonationPhoto} />
                </label>
              </div>
              {formData.image && (
                <div style={{ position: 'relative', width: '200px', height: '150px', borderRadius: '0.5rem', overflow: 'hidden' }}>
                  <img src={formData.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={() => setFormData({ ...formData, image: '' })} style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}>×</button>
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <button type="submit" className="btn btn-primary flex-1 mt-2" style={{ padding: '1rem', fontSize: '1.1rem' }}><Crosshair size={20} className="inline mr-2" /> {formData._id ? 'Update Donation Details' : 'Auto-Detect Nearest NGO & Submit'}</button>
              {formData._id && (
                <button type="button" onClick={() => { setFormData({ foodType: '', quantity: '', address: '', description: '', timeLimit: '' }); setActiveTab('home'); }} className="btn btn-outline mt-2" style={{ padding: '1rem' }}>Discard Changes</button>
              )}
            </div>
          </form>
        </div>
      )}

      {activeTab === 'profile' && <ProfileTab user={user} setUser={setUser} />}

    </DashboardLayout>
  )
};

export const NgoDashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);
  const [isOnline, setIsOnline] = useState(true);

  const [activeDonations, setActiveDonations] = useState([]);
  const [pastDonations, setPastDonations] = useState([]);

  // NGO Base Coordinates
  const [hqPosition, setHqPosition] = useState({ lat: 13.0827, lng: 80.2707 });

  useEffect(() => {
    const fetchUser = async () => {
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (savedUser.id) {
        setUser(savedUser);
        setIsOnline(savedUser.isOnline !== false);
        // Refresh online status and profile from backend
        try {
          const res = await fetch(`http://localhost:5000/api/users/${savedUser.id}`);
          if (res.ok) {
            const data = await res.json();
            if (data && typeof data.isOnline === 'boolean') {
              setIsOnline(data.isOnline);
              const merged = { ...savedUser, ...data };
              localStorage.setItem('user', JSON.stringify(merged));
              setUser(merged);
            }
          }
        } catch (e) { }

        if (savedUser.location && savedUser.location.coordinates) {
          setHqPosition({
            lng: savedUser.location.coordinates[0] || 80.2707,
            lat: savedUser.location.coordinates[1] || 13.0827
          });
        }
        // Refetch
        fetchDonationsData(savedUser);
      }
    };
    fetchUser();
  }, [activeTab]);

  const toggleOnlineStatus = async () => {
    if (!user) return;
    const nextStatus = !isOnline;
    setIsOnline(nextStatus);
    const updatedUser = { ...user, isOnline: nextStatus };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));

    try {
      await fetch(`http://localhost:5000/api/users/${user.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: nextStatus })
      });
    } catch (e) {
      console.error('Failed to update status', e);
    }
  };

  const fetchDonationsData = async (userObj) => {
    try {
      const lng = userObj.location?.coordinates[0] || hqPosition.lng;
      const lat = userObj.location?.coordinates[1] || hqPosition.lat;

      // 1. Fetch pending requests mapped to this NGO (AI MATCHED or NEARBY)
      const resPending = await fetch(`http://localhost:5000/api/donations?ngoId=${userObj.id}&lat=${lat}&lng=${lng}`);
      if (resPending.ok) setActiveDonations(await resPending.json());

      // 2. Fetch history (accepted/completed/rejected) where claimedBy = me
      const resPast = await fetch(`http://localhost:5000/api/donations/history?ngoId=${userObj.id}`);
      if (resPast.ok) setPastDonations(await resPast.json());

    } catch (e) { }
  };

  const updateDonationStatus = async (id, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/donations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ngoId: user.id })
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.message || 'Error updating status');
      }
      fetchDonationsData(user);
    } catch (e) {
      alert('Network error. Please try again.');
    }
  };

  const saveHqLocation = async () => {
    if (user && hqPosition) {
      await fetch(`http://localhost:5000/api/users/${user.id}/location`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: hqPosition.lat, lng: hqPosition.lng })
      });
      alert('HQ Coordinates Synced with AI Network!');

      // update local storage
      const u = { ...user };
      u.location = { type: 'Point', coordinates: [hqPosition.lng, hqPosition.lat] };
      localStorage.setItem('user', JSON.stringify(u));
    }
  };

  return (
    <DashboardLayout user={user} role="ngo" activeTab={activeTab} setActiveTab={setActiveTab}>

      {activeTab === 'home' && (
        <div>
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 className="font-bold text-2xl mb-2">Logistics Control</h3>
            <p className="text-muted">Managing incoming surplus food and tracking delivery operations.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div className="card card-glow" style={{ borderTop: '4px solid #a855f7', background: 'linear-gradient(135deg, var(--surface) 0%, #2e1065 100%)' }}>
              <div className="flex justify-between items-center p-4">
                <h2 style={{ color: '#a855f7', fontSize: '1.25rem', fontWeight: 600 }}>Total Operations</h2>
                <h2 style={{ color: '#a855f7', fontSize: '2rem', fontWeight: 700 }}>{pastDonations.filter(d => d.status === 'completed').length}</h2>
              </div>
            </div>

            <div className="card card-glow" onClick={() => setActiveTab('donations')} style={{ borderTop: '4px solid #0ea5e9', cursor: 'pointer', background: 'linear-gradient(135deg, var(--surface) 0%, #082f49 100%)' }}>
              <div className="flex justify-between items-center p-4">
                <h2 style={{ color: '#0ea5e9', fontSize: '1.25rem', fontWeight: 600 }}>Active Requests</h2>
                <h2 style={{ color: '#0ea5e9', fontSize: '2rem', fontWeight: 700 }}>{activeDonations.length}</h2>
              </div>
            </div>

            {/* Status Online/Offline Component on the right side */}
            <div className="card card-glow" style={{ 
              borderTop: isOnline ? '4px solid #10b981' : '4px solid #ef4444', 
              background: isOnline ? 'linear-gradient(135deg, var(--surface) 0%, #064e3b 100%)' : 'linear-gradient(135deg, var(--surface) 0%, #450a0a 100%)',
              transition: 'all 0.3s ease'
            }}>
              <div className="flex justify-between items-center p-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div style={{ 
                      width: '10px', 
                      height: '10px', 
                      borderRadius: '50%', 
                      background: isOnline ? '#10b981' : '#ef4444', 
                      boxShadow: isOnline ? '0 0 10px #10b981' : '0 0 10px #ef4444' 
                    }}></div>
                    <h2 style={{ color: isOnline ? '#10b981' : '#ef4444', fontSize: '1.25rem', fontWeight: 700 }}>
                      {isOnline ? 'ONLINE' : 'OFFLINE'}
                    </h2>
                  </div>
                  <p className="text-xs text-muted">{isOnline ? 'Receiving Auto-Dispatches' : 'Dispatch Paused'}</p>
                </div>
                <button
                  onClick={toggleOnlineStatus}
                  className="btn"
                  title={isOnline ? 'Go Offline' : 'Go Online'}
                  style={{
                    padding: '0.45rem 0.9rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    border: isOnline ? '1px solid #10b981' : '1px solid #ef4444',
                    background: isOnline ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: isOnline ? '#34d399' : '#f87171'
                  }}
                >
                  <Power size={14} />
                  {isOnline ? 'Go Offline' : 'Go Online'}
                </button>
              </div>
            </div>
          </div>

          <div className="card mb-8" style={{ borderTop: '4px solid #10b981' }}>
            <h3 className="font-bold text-lg mb-4 text-emerald-500">Accepted Requests</h3>
            {pastDonations.filter(d => d.status === 'accepted').length === 0 ? (
              <p className="text-muted">No accepted donations. Claim a package from the Requests tab</p>
            ) : (
              <div className="flex-col gap-6" style={{ display: 'flex' }}>
                {pastDonations.filter(d => d.status === 'accepted').map(d => (
                  <div key={d._id} style={{ background: 'var(--bg-color)', padding: '1.5rem', borderRadius: '0.5rem', borderLeft: '4px solid #10b981' }}>
                    <div className="flex justify-between items-start mb-2">
                      <div style={{ display: 'flex', gap: '1.5rem' }}>
                        {d.image && <img src={d.image} alt="Food" style={{ width: '80px', height: '80px', borderRadius: '0.5rem', objectFit: 'cover' }} />}
                        <div>
                          <h4 className="font-bold text-lg">{d.foodType} <span className="text-sm font-normal text-muted ml-2">({d.quantity})</span></h4>
                          <p className="text-sm text-muted mb-2"><MapPin size={14} className="inline mr-1" /> {d.address}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${d.location.coordinates[1]},${d.location.coordinates[0]}`, '_blank')}
                          className="btn btn-outline"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                        >
                          <MapIcon size={16} className="inline mr-2" /> Directions
                        </button>
                        <button onClick={() => updateDonationStatus(d._id, 'completed')} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Mark as Collected</button>
                      </div>
                    </div>
                    <div style={{ height: '150px', width: '100%', borderRadius: '0.5rem', overflow: 'hidden', margin: '1rem 0', border: '1px solid var(--border)' }}>
                      <MapContainer center={[d.location.coordinates[1], d.location.coordinates[0]]} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false} dragging={false} scrollWheelZoom={false}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={[d.location.coordinates[1], d.location.coordinates[0]]} icon={customIcon} />
                      </MapContainer>
                    </div>
                    <p className="text-sm text-primary font-bold"><Clock size={16} className="inline mr-1" /> Status: {new Date(d.timeLimit) < new Date() ? <span className="text-red-500">EXPIRED (Safe to Collect)</span> : <CountdownTimer expiryString={d.timeLimit} />}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="font-bold text-lg mb-4">Pending Requests</h3>
            {activeDonations.length === 0 ? (
              <p className="text-muted">No active donations at the moment. You're all caught up</p>
            ) : (
              <div className="flex gap-4" style={{ overflowX: 'auto', paddingBottom: '1rem' }}>
                {activeDonations.map(d => (
                  <div key={d._id} style={{ minWidth: '300px', background: 'var(--bg-color)', padding: '1.5rem', borderRadius: '0.5rem', borderLeft: '4px solid #f59e0b' }}>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold truncate">{d.foodType}</h4>
                    </div>
                    <p className="text-sm text-muted"><strong>Qty:</strong> {d.quantity}</p>
                    <p className="text-sm text-muted mt-2 truncate text-orange-500"><strong>Expires:</strong> {d.timeLimit && new Date(d.timeLimit).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'hq' && (
        <div className="card">
          <h3 className="font-bold text-lg mb-1">Set Your Location</h3>
          <p className="text-muted mb-4 text-sm">Your exact coordinates below would be used to route the nearest donor packages directly to your dashboard.</p>

          <div style={{ height: '400px', width: '100%', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
            <MapContainer center={[hqPosition.lat, hqPosition.lng]} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <LocationPicker position={hqPosition} setPosition={setHqPosition} />
            </MapContainer>
          </div>

          <div className="flex justify-between items-center">
            <button onClick={saveHqLocation} className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontWeight: 'bold' }}>Sync Location with Backend</button>
          </div>
        </div>
      )}

      {activeTab === 'donations' && (
        <div>
          <div className="card mb-8">
            <h3 className="font-bold text-lg mb-4">Pending Auto-Assigned Requests</h3>
            {activeDonations.length === 0 ? (
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '2rem', textAlign: 'center', borderRadius: '0.5rem', border: '1px dashed var(--border)' }}>
                <Crosshair size={48} className="text-muted mx-auto mb-2" style={{ opacity: 0.5, margin: '0 auto' }} />
                <p className="text-muted">No packages available currently.</p>
              </div>
            ) : (
              <div className="flex-col gap-6" style={{ display: 'flex' }}>
                {activeDonations.map(d => (
                  <div key={d._id} style={{ background: 'var(--bg-color)', padding: '1.5rem', borderRadius: '0.5rem', borderLeft: '4px solid #f59e0b', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="flex justify-between items-start">
                      <div style={{ display: 'flex', gap: '1.5rem' }}>
                        {d.image && <img src={d.image} alt="Food" style={{ width: '100px', height: '100px', borderRadius: '0.5rem', objectFit: 'cover' }} />}
                        <div style={{ flex: 1 }}>
                          <h4 className="font-bold text-lg mb-1">{d.foodType} <span className="text-sm font-normal text-muted ml-2">({d.quantity})</span></h4>
                          <p className="text-sm text-muted mb-1"><MapPin size={14} className="inline mr-1" /> {d.address}</p>
                          <p className="text-sm text-muted">Instructions: {d.description || 'None'}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateDonationStatus(d._id, 'rejected')}
                          className="btn btn-outline"
                          style={{ color: '#ef4444', borderColor: '#ef4444' }}
                        >
                          Pass
                        </button>
                        <button
                          onClick={() => updateDonationStatus(d._id, 'accepted')}
                          className="btn btn-primary"
                          disabled={new Date(d.timeLimit) < new Date()}
                          style={{ opacity: new Date(d.timeLimit) < new Date() ? 0.5 : 1, cursor: new Date(d.timeLimit) < new Date() ? 'not-allowed' : 'pointer' }}
                        >
                          {new Date(d.timeLimit) < new Date() ? 'Expired' : 'Claim Package'}
                        </button>
                      </div>
                    </div>

                    {/* MINI MAP PREVIEW */}
                    <div style={{ height: '180px', width: '100%', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <MapContainer center={[d.location.coordinates[1], d.location.coordinates[0]]} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={[d.location.coordinates[1], d.location.coordinates[0]]} icon={customIcon} />
                      </MapContainer>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: new Date(d.timeLimit) < new Date() ? '#ef4444' : '#eab308' }}>
                        <Clock size={16} />
                        Expires: {new Date(d.timeLimit).toLocaleString()}
                      </div>
                      <button
                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${d.location.coordinates[1]},${d.location.coordinates[0]}`, '_blank')}
                        className="text-xs text-primary font-bold hover:underline"
                      >
                        Open in Google Maps
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="font-bold text-lg mb-4">Your Past Operations</h3>
            {pastDonations.filter(d => d.status === 'completed').length === 0 ? <p className="text-muted">No completed history found.</p> : (
              <div className="flex-col gap-4" style={{ display: 'flex' }}>
                {pastDonations.filter(d => d.status === 'completed').map(d => (
                  <div key={d._id} style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '0.5rem', background: 'var(--bg-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div className="flex justify-between items-start">
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {d.image ? (
                          <img src={d.image} alt="Food" style={{ width: '60px', height: '60px', borderRadius: '0.5rem', objectFit: 'cover', border: '1px solid var(--border)' }} />
                        ) : (
                          <div style={{ width: '60px', height: '60px', borderRadius: '0.5rem', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                            <Package size={24} />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-lg">{d.foodType}</h4>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.5rem', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', borderRadius: '4px' }}>
                              Qty: {d.quantity}
                            </span>
                          </div>
                          <p className="text-sm text-muted mt-1"><MapPin size={14} className="inline mr-1 text-primary" /> {d.address}</p>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.6rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderRadius: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <CheckCircle2 size={13} /> COMPLETED
                      </span>
                    </div>

                    {/* Metadata details row: Time of Collected, Quantity, Donor Email */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.85rem' }}>
                      <div className="flex items-center gap-2 text-muted">
                        <Clock size={15} className="text-primary flex-shrink-0" />
                        <span><strong>Time Collected:</strong> {new Date(d.collectedAt || d.updatedAt || d.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted">
                        <Mail size={15} className="text-blue-400 flex-shrink-0" />
                        <span><strong>Donor Email:</strong> <span className="text-blue-300 font-semibold">{d.donorId?.email || 'N/A'}</span></span>
                      </div>
                      {d.donorId?.name && (
                        <div className="flex items-center gap-2 text-muted">
                          <Users size={15} className="text-emerald-400 flex-shrink-0" />
                          <span><strong>Donor:</strong> {d.donorId.name} {d.donorId?.phone ? `(${d.donorId.phone})` : ''}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'profile' && <ProfileTab user={user} setUser={setUser} />}

    </DashboardLayout>
  )
};

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [stats, setStats] = useState({ ngoCount: 0, donationCount: 0 });
  const [ngos, setNgos] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [adminData, setAdminData] = useState({ name: '', email: '', password: '' });
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);

  useEffect(() => {
    fetchStats();
    if (activeTab === 'users') fetchNgos();
  }, [activeTab]);

  const fetchStats = async () => {
    const res = await fetch('http://localhost:5000/api/admin/stats');
    if (res.ok) setStats(await res.json());
  };

  const fetchNgos = async () => {
    const res = await fetch('http://localhost:5000/api/admin/ngos');
    if (res.ok) setNgos(await res.json());
  };

  const toggleBlock = async (id) => {
    await fetch(`http://localhost:5000/api/admin/ngos/${id}/toggle-block`, { method: 'PUT' });
    fetchNgos();
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setIsAddingAdmin(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/add-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminData)
      });
      const data = await res.json();
      if (res.ok) {
        alert("Admin account authorized and created successfully!");
        setAdminData({ name: '', email: '', password: '' });
      } else {
        alert(data.message || "Failed to add admin");
      }
    } catch (err) {
      alert("Network error while adding admin.");
    } finally {
      setIsAddingAdmin(false);
    }
  };

  return (
    <DashboardLayout user={user} role="admin" activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'home' && (
        <div>
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 className="font-bold text-2xl mb-2">Platform Overview</h3>
            <p className="text-muted">Real-time monitoring of Annathan's anti-hunger network and logistics.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
            <div className="card card-glow" style={{ borderTop: '4px solid #f97316', background: 'linear-gradient(135deg, var(--surface) 0%, #431407 100%)' }}>
              <div className="flex justify-between items-start mb-4">
                <div style={{ background: 'rgba(249, 115, 22, 0.1)', padding: '0.75rem', borderRadius: '0.75rem', color: '#f97316' }}>
                  <Users size={24} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'rgba(249, 115, 22, 0.1)', color: '#f97316', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>LIVE NETWORK</span>
              </div>
              <h3 className="text-muted text-sm font-semibold mb-1">Impact Partners</h3>
              <p className="text-4xl font-bold" style={{ color: '#f97316' }}>{stats.ngoCount}</p>
              <p className="text-xs text-muted mt-2">Verified NGOs actively collecting food</p>
            </div>

            <div className="card card-glow" style={{ borderTop: '4px solid #06b6d4', background: 'linear-gradient(135deg, var(--surface) 0%, #083344 100%)' }}>
              <div className="flex justify-between items-start mb-4">
                <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '0.75rem', borderRadius: '0.75rem', color: '#06b6d4' }}>
                  <Heart size={24} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>TOTAL HELP</span>
              </div>
              <h3 className="text-muted text-sm font-semibold mb-1">Delivered Meals</h3>
              <p className="text-4xl font-bold" style={{ color: '#06b6d4' }}>{stats.donationCount}</p>
              <p className="text-xs text-muted mt-2">Successful handovers recorded</p>
            </div>

            <div className="card card-glow" onClick={() => setActiveTab('admins')} style={{ borderTop: '4px solid #a855f7', cursor: 'pointer', background: 'linear-gradient(135deg, var(--surface) 0%, #4c1d95 100%)' }}>
              <div className="flex justify-between items-start mb-4">
                <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '0.75rem', borderRadius: '0.75rem', color: '#a855f7' }}>
                  <ShieldCheck size={24} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>SECURITY</span>
              </div>
              <h3 className="text-muted text-sm font-semibold mb-1">System Control</h3>
              <p className="text-4xl font-bold" style={{ color: '#a855f7' }}>Admins <ArrowRight size={24} className="inline" /></p>
              <p className="text-xs text-muted mt-2">Manage authorized access levels</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="card" style={{ gridColumn: 'span 2' }}>
              <h4 className="font-bold text-lg mb-4">System Logistics Status</h4>
              <div style={{ height: '180px', background: 'var(--bg-color)', borderRadius: '0.75rem', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <Activity size={48} className="opacity-20 mr-4" />
                <div>
                  <p className="font-bold text-main">AI Dispatcher is Healthy</p>
                  <p className="text-sm">Sequential 50km radius routing actively matching donors to NGOs.</p>
                </div>
              </div>
            </div>

            <div className="card" style={{ background: 'var(--surface)', borderLeft: '4px solid var(--primary)' }}>
              <h4 className="font-bold text-lg mb-4">Quick Links</h4>
              <nav className="flex flex-col gap-4">
                <button onClick={() => setActiveTab('users')} className="btn btn-outline w-full justify-between">Review NGOs <ArrowRight size={16} /></button>
                <button onClick={() => setActiveTab('profile')} className="btn btn-outline w-full justify-between">Security Audit <Settings size={16} /></button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <div className="card mb-8">
            <h3 className="font-bold text-lg mb-1">Global NGO Coverage Map</h3>
            <p className="text-muted mb-4 text-sm">Visualizing all registered NGO Base Headquarters and their AI service coverage radius.</p>
            <div style={{ height: '400px', width: '100%', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <MapContainer center={[13.0827, 80.2707]} zoom={10} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
                {ngos.filter(n => n.location && n.location.coordinates).map(ngo => (
                  <Marker key={ngo._id} position={[ngo.location.coordinates[1], ngo.location.coordinates[0]]} icon={customIcon} />
                ))}
              </MapContainer>
            </div>
          </div>

          <div className="card">
            <h3 className="font-bold text-lg mb-4">NGO Directory & Access Control</h3>
            {ngos.length === 0 ? <p className="text-muted">No NGOs registered.</p> : (
              <div className="flex-col gap-4" style={{ display: 'flex' }}>
                {ngos.map(ngo => (
                  <div key={ngo._id} className="flex justify-between items-center" style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: '0.5rem', borderLeft: `4px solid ${ngo.isBlocked ? '#ef4444' : '#10b981'}` }}>
                    <div>
                      <h4 className="font-bold">{ngo.name} {ngo.isBlocked && <span className="text-xs ml-2 font-bold" style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>BLOCKED</span>}</h4>
                      <p className="text-sm text-muted">{ngo.email} • {ngo.phone || 'No Phone'}</p>
                    </div>
                    <button onClick={() => toggleBlock(ngo._id)} className="btn" style={{ padding: '0.5rem 1rem', background: ngo.isBlocked ? '#10b981' : 'transparent', border: ngo.isBlocked ? 'none' : '1px solid #ef4444', color: ngo.isBlocked ? 'white' : '#ef4444' }}>
                      {ngo.isBlocked ? 'Unblock NGO' : 'Block & Suspend'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'admins' && (
        <div className="card" style={{ maxWidth: '600px' }}>
          <h3 className="font-bold text-lg mb-1">Create New Admin Account</h3>
          <p className="text-muted mb-6 text-sm">Admins have full access to manage NGOs, block users, and monitor all donations. Exercise caution when adding new administrators.</p>

          <form onSubmit={handleAddAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" required value={adminData.name} onChange={e => setAdminData({ ...adminData, name: e.target.value })} placeholder="Admin name" />
            </div>
            <div className="form-group">
              <label className="form-label">Authorized Email</label>
              <input type="email" className="form-input" required value={adminData.email} onChange={e => setAdminData({ ...adminData, email: e.target.value })} placeholder="admin@annathan.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Set Initial Password</label>
              <input type="password" className="form-input" required value={adminData.password} onChange={e => setAdminData({ ...adminData, password: e.target.value })} placeholder="Set a secure password" />
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={isAddingAdmin}>
              {isAddingAdmin ? 'Creating Account...' : 'Authorize & Create Admin'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'profile' && <ProfileTab user={user} setUser={setUser} />}

    </DashboardLayout>
  )
};
