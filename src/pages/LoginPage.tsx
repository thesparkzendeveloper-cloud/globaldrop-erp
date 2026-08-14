import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    const success = await login(email, password);
    if (!success) {
      setError('Invalid credentials. Try: john.smith@company.com with password: password123');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-xl sm:rounded-2xl shadow-xl mb-3 sm:mb-4">
            <span className="text-xl sm:text-2xl font-bold text-blue-600">GD</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">GlobalDrop ERP</h1>
          <p className="text-blue-100 mt-1 sm:mt-2 text-sm sm:text-base">Enterprise Resource Planning</p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-5 sm:p-8">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-800 text-center mb-4 sm:mb-6">Welcome Back</h2>

          {error && (
            <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-red-50 border border-red-200 rounded-lg text-xs sm:text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="form-label text-xs sm:text-sm">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="form-input pl-8 sm:pl-10"
                  autoCapitalize="off"
                />
              </div>
            </div>

            <div>
              <label className="form-label text-xs sm:text-sm">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="form-input pl-8 sm:pl-10 pr-9 sm:pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs sm:text-sm text-slate-600">Remember me</span>
              </label>
              <button type="button" className="text-xs sm:text-sm text-blue-600 hover:underline whitespace-nowrap">
                Forgot Password?
              </button>
            </div>

            <button type="submit" className="btn-primary w-full justify-center py-2.5 sm:py-3">
              Sign In
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-500 text-center mb-2 sm:mb-3">Demo credentials:</p>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-xs">
              <button onClick={() => { setEmail('john.smith@company.com'); setPassword('password123'); }} className="text-center p-2 sm:p-2.5 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <p className="font-medium text-slate-700">Admin</p>
                <p className="text-slate-500 text-[10px] sm:text-xs truncate">john.smith</p>
              </button>
              <button onClick={() => { setEmail('sarah.johnson@company.com'); setPassword('password123'); }} className="text-center p-2 sm:p-2.5 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <p className="font-medium text-slate-700">Super</p>
                <p className="text-slate-500 text-[10px] sm:text-xs truncate">sarah.j</p>
              </button>
              <button onClick={() => { setEmail('emily.davis@company.com'); setPassword('password123'); }} className="text-center p-2 sm:p-2.5 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <p className="font-medium text-slate-700">Employee</p>
                <p className="text-slate-500 text-[10px] sm:text-xs truncate">emily.d</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
