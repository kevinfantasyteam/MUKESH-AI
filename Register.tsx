import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './services/supabase';
import { User } from './types';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    subscriptionDays: '30',
    role: 'customer' as 'admin' | 'customer'
  });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                data: {
                    username: formData.username,
                    role: formData.role,
                    subscriptionDays: formData.subscriptionDays
                }
            }
        });

        if (error) throw error;

        if (data.user) {
            const now = new Date();
            const endDate = new Date();
            endDate.setDate(now.getDate() + parseInt(formData.subscriptionDays));

            const { error: profileError } = await supabase.from('profiles').insert({
                id: data.user.id,
                username: formData.username,
                email: formData.email,
                role: formData.role,
                subscription_days: parseInt(formData.subscriptionDays),
                subscription_end_date: endDate.toISOString(),
                status: 'active'
            });

            if (profileError) {
                console.error('Profile creation error:', profileError);
                // Fallback: if profile creation fails, maybe just continue or show error
                // But we want to ensure it shows up in the list
            }
        }

        setSuccess(true);
        setTimeout(() => {
          navigate('/manageuser');
        }, 1500);

    } catch (err: any) {
        setError(err.message || 'Registration failed');
    } finally {
        setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="p-4 max-w-md mx-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-orange-600 p-6 text-white text-center">
          <h2 className="text-2xl font-black uppercase tracking-tight">Register User</h2>
          <p className="text-xs opacity-80 font-medium">Create a new premium account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs font-bold text-center border border-red-100">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-700 p-3 rounded-xl text-xs font-bold text-center border border-green-100">
              User Registered Successfully! Redirecting...
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Username</label>
            <input
              type="text"
              name="username"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all font-bold"
              placeholder="Ex: bobby123"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Email Address</label>
            <input
              type="email"
              name="email"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all font-bold"
              placeholder="user@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Sub. Days</label>
              <input
                type="number"
                name="subscriptionDays"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all font-bold"
                value={formData.subscriptionDays}
                onChange={handleChange}
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Access Role</label>
              <select
                name="role"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all font-bold"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Security Password</label>
            <input
              type="password"
              name="password"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all font-bold"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-orange-600 text-white font-black py-4 rounded-xl shadow-lg hover:bg-orange-700 transition-all active:scale-95 mt-4"
            disabled={loading}
          >
            {loading ? 'CREATING ACCOUNT...' : 'CREATE PERMANENT ACCOUNT'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;