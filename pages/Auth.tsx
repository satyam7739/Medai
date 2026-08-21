import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MedAILogo } from '../components/Logo';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader2, Phone, Copy, Check, Sparkles, AlertTriangle, ExternalLink } from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';

export const Auth: React.FC = () => {
  const { login, signup, demoLogin, isAuthenticated, user } = useApp();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [showDomainHelp, setShowDomainHelp] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';

  // Automatic redirect when auth state settles
  useEffect(() => {
    if (isAuthenticated) {
      if (user.onboardingComplete) {
        navigate('/');
      } else {
        navigate('/onboarding');
      }
    }
  }, [isAuthenticated, user.onboardingComplete, navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowDomainHelp(false);
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!name) throw new Error("Please enter your name.");
        await signup(email, password, name);
      }
    } catch (err: any) {
      console.error(err);
      let msg = "Authentication failed.";
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        msg = "Invalid email or password.";
      } else if (err.code === 'auth/email-already-in-use') {
        msg = "Email already in use. Please log in.";
      } else if (err.code === 'auth/weak-password') {
        msg = "Password should be at least 6 characters.";
      } else if (err.code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain')) {
        msg = "Domain not authorized in Firebase Authentication.";
        setShowDomainHelp(true);
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setShowDomainHelp(false);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain')) {
        setError("Domain not authorized in Firebase Console.");
        setShowDomainHelp(true);
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError("Sign-in popup was closed before completing.");
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError("Sign-in request was cancelled.");
      } else {
        setError("Google Login failed: " + (err.message || "Unknown error"));
      }
      setLoading(false);
    }
  };

  const handleCopyDomain = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentHostname);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  const handleDemoAccess = () => {
    demoLogin();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-100 dark:bg-primary-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-100 dark:bg-purple-900/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 backdrop-blur-xl z-10 overflow-hidden">
        
        {/* Header */}
        <div className="pt-8 pb-6 px-8 text-center">
          <div className="inline-block p-3 bg-slate-50 dark:bg-slate-700 rounded-2xl mb-4 shadow-sm">
            <MedAILogo className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {isLogin ? 'Enter your details to access your account' : 'Start your health journey with Med AI'}
          </p>
        </div>

        {/* Demo Mode Quick Access */}
        <div className="px-8 mb-4">
          <button
            type="button"
            onClick={handleDemoAccess}
            className="w-full py-2.5 px-4 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Sparkles size={16} />
            <span>Instant Demo Mode (Guest Access)</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="px-8 mb-6">
          <div className="flex bg-slate-100 dark:bg-slate-700/50 p-1 rounded-xl">
            <button
              onClick={() => { setIsLogin(true); setAuthMethod('email'); setError(''); setShowDomainHelp(false); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                isLogin 
                  ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => { setIsLogin(false); setAuthMethod('email'); setError(''); setShowDomainHelp(false); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                !isLogin 
                  ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Auth Body */}
        <div className="px-8 pb-8">
          
          {authMethod === 'email' ? (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              
              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 text-slate-400" size={20} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Rahul Sharma"
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 dark:text-white font-medium"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-slate-400" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 dark:text-white font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-slate-400" size={20} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 dark:text-white font-medium"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-xs font-medium text-center">
                  {error}
                </div>
              )}

              {/* Domain Authorization Diagnostic Banner */}
              {showDomainHelp && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl text-left space-y-3">
                  <div className="flex items-start gap-2 text-amber-800 dark:text-amber-200">
                    <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold">Firebase Authorized Domain Setup Required</p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        To enable Google Sign-In on this domain, add it to your Firebase Console:
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800 text-xs">
                    <span className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-[220px]">
                      {currentHostname}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyDomain}
                      className="flex items-center gap-1 text-primary-600 dark:text-primary-400 font-semibold px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      {copiedDomain ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      <span>{copiedDomain ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <ol className="text-[11px] text-amber-800 dark:text-amber-300 list-decimal list-inside space-y-1 pl-1">
                    <li>Open <strong>Firebase Console &gt; medai-994cc</strong></li>
                    <li>Go to <strong>Authentication &gt; Settings &gt; Authorized domains</strong></li>
                    <li>Click <strong>Add domain</strong> and paste the domain above</li>
                  </ol>

                  <button
                    type="button"
                    onClick={handleDemoAccess}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                  >
                    Continue in Demo Mode
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] mt-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Log In' : 'Create Account')}
                {!loading && <ArrowRight size={20} />}
              </button>
            </form>
          ) : (
            // PHONE AUTH UI
            <div className="space-y-4 animate-slide-up">
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-700 text-sm text-yellow-800 dark:text-yellow-200">
                Phone authentication is currently in testing mode. Please use Email or Demo mode.
              </div>
              
              <button 
                type="button" 
                onClick={() => setAuthMethod('email')} 
                className="w-full text-center text-sm text-primary-600 font-bold hover:underline"
              >
                Back to Email Login
              </button>
            </div>
          )}

          {/* Social Login Dividers (Only show on Email tab) */}
          {authMethod === 'email' && (
            <div className="mt-6">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                <span className="flex-shrink-0 mx-4 text-xs font-bold text-slate-400 uppercase">Or continue with</span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <button 
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 py-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Google</span>
                </button>
                
                <button 
                  type="button"
                  onClick={handleDemoAccess}
                  className="flex items-center justify-center gap-2 py-3 border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl hover:bg-emerald-100/60 dark:hover:bg-emerald-900/30 transition-colors"
                >
                  <Sparkles size={18} className="text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Demo</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};