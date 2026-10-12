import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Mail, Lock, User, Building, Phone, ArrowRight, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../api';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('donor'); // 'donor', 'ngo', 'admin'
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('mode') === 'signup') setIsLogin(false);
    if (params.get('role')) setRole(params.get('role'));
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const url = isLogin ? `${API_BASE_URL}/api/auth/login` : `${API_BASE_URL}/api/auth/signup`;
    const payload = { ...formData, role };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      navigate(`/${data.user.role}/dashboard`);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* Visual Left Pane */}
      <div className="w-full flex-col justify-center items-center p-12" style={{ flex: 1, background: 'linear-gradient(135deg, var(--surface) 0%, var(--bg-color) 100%)', color: 'var(--text-main)', display: 'none' }}>
        {/* We will hide this on mobile and show on desktop via custom inline CSS logic below */}
      </div>

      {/* The actual structured left pane using inline styles for responsiveness */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(135deg, var(--surface) 0%, var(--bg-color) 100%)',
        color: 'var(--text-main)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '3rem',
        borderRight: '1px solid var(--border)'
      }} className="hidden-mobile">
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '2rem' }}>
            <img src="/icon.png" alt="Annathan Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
            <h2>Annathan</h2>
          </div>
          <h1 className="font-bold" style={{ fontSize: '2.5rem', lineHeight: 1.2, marginBottom: '1.5rem' }}>
            Join the movement against food waste.
          </h1>
          <p style={{ opacity: 0.9, fontSize: '1.1rem' }}>
            Whether you have excess food or the means to distribute it, your contribution matters. Let's make sure no meal goes to waste.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .hidden-mobile { display: none !important; }
        }
      `}</style>

      {/* Right form pane */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '2rem' }}>

        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="text-muted hover:text-main flex items-center gap-2 font-medium"
          >
            <ArrowLeft size={18} /> Back to Home
          </button>
          <button
            onClick={() => { setIsLogin(!isLogin); if (isLogin && role === 'admin') setRole('donor'); }}
            className="text-primary font-semibold"
          >
            {isLogin ? 'Create an account' : 'Log in instead'}
          </button>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '400px' }}>
            <h2 className="font-bold text-2xl" style={{ marginBottom: '0.5rem' }}>
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="text-muted" style={{ marginBottom: '2rem' }}>
              Please enter your details to continue.
            </p>

            {/* Role Selector Tabs (Only for Signup) */}
            {!isLogin && (
              <div className="flex gap-2" style={{ padding: '0.25rem', background: 'var(--border)', borderRadius: '0.5rem', marginBottom: '2rem' }}>
                {['donor', 'ngo'].map(r => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    type="button"
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      borderRadius: '0.4rem',
                      fontWeight: 500,
                      background: role === r ? 'var(--surface)' : 'transparent',
                      color: role === r ? 'var(--text-main)' : 'var(--text-muted)',
                      boxShadow: role === r ? 'var(--shadow-sm)' : 'none',
                      textTransform: 'capitalize'
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={isLogin ? 'login' : 'signup'}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >

                  {errorMsg && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                      {errorMsg}
                    </div>
                  )}

                  {!isLogin && (
                    <>
                      <div className="form-group">
                        <label className="form-label">{role === 'ngo' ? 'Organization Name' : 'Full Name / Business Name'}</label>
                        <div style={{ position: 'relative' }}>
                          <div style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }}>
                            {role === 'ngo' ? <Building size={20} /> : <User size={20} />}
                          </div>
                          <input type="text" className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="Enter name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <div style={{ position: 'relative' }}>
                          <div style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }}>
                            <Phone size={20} />
                          </div>
                          <input type="tel" className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="Your phone number" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }}>
                        <Mail size={20} />
                      </div>
                      <input type="email" className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="name@example.com" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '2rem' }}>
                    <div className="flex justify-between items-center mb-2">
                      <label className="form-label" style={{ margin: 0 }}>Password</label>
                      {isLogin && <a href="#" className="text-primary text-sm font-medium">Forgot password?</a>}
                    </div>

                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }}>
                        <Lock size={20} />
                      </div>
                      <input type="password" className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="••••••••" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary w-full" disabled={isLoading} style={{ opacity: isLoading ? 0.7 : 1 }}>
                    {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')} <ArrowRight size={18} />
                  </button>

                </motion.div>
              </AnimatePresence>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
