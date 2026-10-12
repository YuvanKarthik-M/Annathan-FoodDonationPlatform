import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Clock, MapPin, ArrowRight, Utensils, ShieldCheck, Globe } from 'lucide-react';
import { API_BASE_URL } from '../api';

// Leaflet Imports
import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet';
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

export default function Home() {
  const [ngos, setNgos] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/public/ngos`)
      .then(res => res.json())
      .then(data => setNgos(data))
      .catch(e => console.error(e));
  }, []);

  return (
    <div className="min-h-screen">
      <nav className="navbar">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src="/icon.png" alt="Annathan Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
            <h1 style={{ background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Annathan</h1>
          </div>
          <div className="flex gap-4 items-center">
            <a href="#coverage" className="text-sm text-muted hover:text-primary transition-colors font-bold tracking-widest uppercase">Available Area</a>
            <div className="flex gap-4">
              <Link to="/login" className="btn btn-outline" style={{ border: '1px solid var(--border)', background: 'transparent' }}>Log in</Link>
              <Link to="/login?mode=signup" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="container hero-section" style={{ position: 'relative' }}>
        {/* BACKGROUND GLOWS */}
        <div style={{ position: 'absolute', top: '150px', left: '50%', transform: 'translateX(-50%)', width: '100%', height: '500px', pointerEvents: 'none', zIndex: -1 }}>
          <div style={{ position: 'absolute', top: '0', left: '25%', width: '400px', height: '400px', background: 'rgba(16, 185, 129, 0.15)', filter: 'blur(100px)', borderRadius: '50%' }}></div>
          <div style={{ position: 'absolute', top: '50px', right: '25%', width: '400px', height: '400px', background: 'rgba(59, 130, 246, 0.12)', filter: 'blur(120px)', borderRadius: '50%' }}></div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '1.5rem', display: 'block' }}>Eradicating Hunger Together</span>
          <h1 className="hero-title" style={{ fontSize: '4.5rem', lineHeight: '1', marginBottom: '2rem' }}>
            Transforming Waste <br />
            <span style={{ color: '#fff' }}>Into Impact.</span>
          </h1>
          <p className="hero-subtitle" style={{ fontSize: '1.25rem', marginBottom: '3rem' }}>
            Annathan leverages geospatial matching to route surplus food from restaurants and wedding halls to verified NGOs within minutes.
            Real-time tracking, zero waste, maximum help.
          </p>
          <div className="flex justify-center gap-6">
            <Link to="/login?role=donor" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
              Donate Food Now <ArrowRight size={20} />
            </Link>
            <Link to="/login?role=ngo" className="btn btn-outline" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
              Join as Partner NGO
            </Link>
          </div>
        </motion.div>

        {/* FEATURE CARDS */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-3 gap-8"
          style={{ textAlign: 'left', marginTop: '8rem' }}
        >
          <div className="card card-glow" style={{ borderTop: '4px solid #f97316', background: 'linear-gradient(135deg, var(--surface) 0%, #431407 100%)' }}>
            <div style={{ background: 'rgba(249, 115, 22, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#f97316' }}>
              <Utensils size={24} />
            </div>
            <h3 className="font-bold text-xl mb-3">Instant Listing</h3>
            <p className="text-muted text-sm leading-relaxed">Donors can list surplus food in 30 seconds. Our AI handles the logistics while you focus on sharing.</p>
          </div>

          <div className="card card-glow" style={{ borderTop: '4px solid #3b82f6', background: 'linear-gradient(135deg, var(--surface) 0%, #172554 100%)' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#3b82f6' }}>
              <MapPin size={24} />
            </div>
            <h3 className="font-bold text-xl mb-3">Precision Routing</h3>
            <p className="text-muted text-sm leading-relaxed">Automatic assignment to the single nearest NGO within 50km. Sequential waterfall logic for 100% reliability.</p>
          </div>

          <div className="card card-glow" style={{ borderTop: '4px solid #a855f7', background: 'linear-gradient(135deg, var(--surface) 0%, #2e1065 100%)' }}>
            <div style={{ background: 'rgba(168, 85, 247, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#a855f7' }}>
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-bold text-xl mb-3">Vetted Network</h3>
            <p className="text-muted text-sm leading-relaxed">Only verified NGOs and high-quality donors interact on our secure, administrative-monitored grid.</p>
          </div>
        </motion.div>

        {/* COVERAGE MAP SECTION */}
        <motion.div
          id="coverage"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          style={{ marginTop: '10rem', marginBottom: '10rem' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', padding: '0.5rem 1.5rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '2px' }}>
              <Globe size={16} /> LIVE GRID STATUS
            </div>
            <h2 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem', tracking: '-0.05em' }}>Available Areas</h2>
            <p className="text-muted" style={{ maxWidth: '750px', margin: '0 auto', fontSize: '1.2rem', lineHeight: '1.6' }}>
              Join hundreds of donors and NGOs across the region. Every pin on this map represent a base of operations dedicated to feeding the hungry.
            </p>
          </div>

          <div className="card card-glow" style={{ height: '700px', padding: '0.8rem', border: '1px solid var(--border)', maxWidth: '1400px', margin: '0 auto', background: 'rgba(30, 41, 59, 0.5)' }}>
            <MapContainer center={[13.0827, 80.2707]} zoom={11} style={{ height: '100%', width: '100%', borderRadius: '1rem' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
              {ngos.map(ngo => (
                ngo.location && ngo.location.coordinates && (
                  <React.Fragment key={ngo._id}>
                    <Marker position={[ngo.location.coordinates[1], ngo.location.coordinates[0]]} icon={customIcon}>
                      <Popup>
                        <div style={{ color: '#000', padding: '0.5rem' }}>
                          <strong style={{ fontSize: '1rem' }}>{ngo.name}</strong><br />
                          <span style={{ fontSize: '0.8rem', color: '#475569' }}>Verified NGO Partner</span>
                        </div>
                      </Popup>
                    </Marker>
                  </React.Fragment>
                )
              ))}
            </MapContainer>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
