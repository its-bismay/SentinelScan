import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Mail, Lock, ShieldAlert, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error: authError } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oauthError = searchParams.get('error');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    
    const res = await login(email, password);
    if (res?.success) {
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } else {
      toast.error(res?.message || 'Login failed');
    }
  };

  const handleGoogleLogin = () => {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    window.location.href = `${baseURL.replace(/\/api$/, '')}/api/auth/google`;
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <div className="card bg-base-100 border border-base-content/10 shadow-xl max-w-md w-full glass-panel">
        <div className="card-body p-6 md:p-8 flex flex-col gap-6">
          <div className="text-center flex flex-col items-center gap-1">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary w-fit mb-2">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h2 className="card-title text-2xl font-bold font-display text-base-content">
              Welcome back to SentinelScan
            </h2>
            <p className="text-xs text-base-content/60">
              Access your security control center to audit assets.
            </p>
          </div>

          {/* Errors */}
          {(authError || oauthError) && (
            <div className="alert alert-error text-xs flex gap-2">
              <ShieldAlert className="h-5 w-5 flex-shrink-0" />
              <span>{authError || 'Google authentication failed. Please try again.'}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Security Email</span>
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <Mail className="h-4 w-4 text-base-content/40" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="grow bg-transparent"
                />
              </label>
            </div>

            <div className="form-control">
              <label className="label flex justify-between">
                <span className="label-text font-semibold">Password</span>
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <Lock className="h-4 w-4 text-base-content/40" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="grow bg-transparent"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary mt-2 text-primary-content"
            >
              {loading ? <span className="loading loading-spinner"></span> : 'Login to Control Panel'}
            </button>
          </form>

          {/* Divider */}
          <div className="divider text-4xs uppercase tracking-widest text-base-content/40 font-semibold my-1">
            Or Authenticate With
          </div>

          {/* Google Login button */}
          <button
            onClick={handleGoogleLogin}
            className="btn btn-outline flex gap-2 items-center justify-center"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Register Redirect */}
          <p className="text-xs text-center text-base-content/65 mt-2">
            Don't have a security profile?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Create profile
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
