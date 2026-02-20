import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './services/supabase';
import './Auth.css';

const Login = ({ onLoginSuccess }: { onLoginSuccess: (role: string) => void }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        // Hardcoded admin bypass (optional, keep if needed for legacy)
        if (formData.email === 'admin@tg.in' && formData.password === 'admin123') {
            localStorage.setItem('userRole', 'admin');
            onLoginSuccess('admin');
            navigate('/admindecisionpanel');
            return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
        });

        if (error) throw error;

        if (data.user) {
            // Check if user has a specific role in metadata or profiles table
            // For now, default to customer unless specified
            const role = data.user.user_metadata?.role || 'customer';
            localStorage.setItem('userRole', role);
            onLoginSuccess(role);
            navigate(role === 'admin' ? '/admindecisionpanel' : '/');
        }
    } catch (err: any) {
        setError(err.message || 'Login failed');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="auth-container p-4">
      <div className="auth-box">
        <h2 className="text-orange-600">Mukesh AI Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="name@company.com"
              className="focus:border-orange-600"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              className="focus:border-orange-600"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="auth-button bg-orange-600 hover:bg-orange-700" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;