// client/src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      addToast('Please enter both email and password', 'error');
      return;
    }
    setLoading(true);
    try {
      await login(formData);
      addToast('Welcome back to Enterprise CRM', 'success');
      navigate('/dashboard');
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (email, password) => {
    setFormData({ email, password });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-600 text-white font-bold text-2xl shadow-md mb-3">
            E
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Enterprise CRM</h2>
          <p className="text-sm text-slate-500 mt-1">Sign in to your CRM workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            label="Email Address"
            type="email"
            placeholder="name@company.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <Button type="submit" variant="primary" className="w-full py-2.5 mt-2" isLoading={loading}>
            Sign In
          </Button>
        </form>

        {/* Demo Fast Login Buttons */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
            One-Click Demo Credentials
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setDemoCredentials('admin@crm.enterprise', 'Password123!')}
              className="px-2 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded font-medium text-slate-700"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('manager@crm.enterprise', 'Password123!')}
              className="px-2 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded font-medium text-slate-700"
            >
              Manager
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('sales@crm.enterprise', 'Password123!')}
              className="px-2 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded font-medium text-slate-700"
            >
              Sales Rep
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-600 font-semibold hover:underline">
            Register new account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
