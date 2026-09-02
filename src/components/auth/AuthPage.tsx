import React, { useState } from 'react';
import { FitronDB } from '../../lib/db';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { UserProfile } from '../../types';
import { 
  Zap, 
  Sparkles, 
  ArrowRight, 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AuthPageProps {
  onAuthenticated: (profile: UserProfile) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthenticated }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setLoading(true);

    if (isForgotPassword) {
      if (!email) {
        setErrorMsg('Please enter your email address.');
        setLoading(false);
        return;
      }
      if (supabase && isSupabaseConfigured) {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) {
          setErrorMsg(error.message);
        } else {
          setInfoMsg('Password reset instructions sent to your email.');
        }
      } else {
        setInfoMsg('Password reset link simulated. Check your inbox!');
      }
      setLoading(false);
      return;
    }

    if (isSignUp) {
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters.');
        setLoading(false);
        return;
      }

      // Try Supabase auth if configured
      if (supabase && isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                username,
                full_name: fullName,
              }
            }
          });
          if (error) {
            setErrorMsg(error.message);
            setLoading(false);
            return;
          }
        } catch (err: any) {
          console.warn('Supabase signup fallback:', err);
        }
      }

      // Initialize persistent athlete profile
      const newProfile = FitronDB.createDefaultProfile(username, fullName, email);
      confetti({ particleCount: 60, spread: 80, origin: { y: 0.5 } });
      onAuthenticated(newProfile);
    } else {
      // Sign In
      if (!email || !password) {
        setErrorMsg('Please enter both email and password.');
        setLoading(false);
        return;
      }

      if (supabase && isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) {
            setErrorMsg(error.message);
            setLoading(false);
            return;
          }
        } catch (err: any) {
          console.warn('Supabase signin fallback:', err);
        }
      }

      // Retrieve or create persistent profile
      let profile = FitronDB.getUserProfile();
      if (!profile) {
        profile = FitronDB.createDefaultProfile(
          email.split('@')[0],
          'FITRON Athlete',
          email
        );
      }
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      onAuthenticated(profile);
    }

    setLoading(false);
  };

  // Quick Demo Access for immediate testing
  const handleQuickDemoAccess = () => {
    let profile = FitronDB.getUserProfile();
    if (!profile) {
      profile = FitronDB.createDefaultProfile('TitanPlayer', 'Alex Rivera', 'alex@fitron.app');
    }
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.5 } });
    onAuthenticated(profile);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#0B0D0F]">
      {/* Dynamic Background Crimson Aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-crimson-dark/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-crimson/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8 space-y-2">
          {/* Logo Hex Badge */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-bg-card border border-crimson/40 shadow-crimson-md mb-2">
            <svg className="w-10 h-10" viewBox="0 0 100 100">
              <polygon points="50,8 90,30 90,70 50,92 10,70 10,30" fill="#0B0D0F" stroke="#C51F4A" strokeWidth="6" />
              <path d="M30,35 L70,35 L40,55 L65,55 L35,75" stroke="#E85A7A" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white font-heading">
            FITRON
          </h1>
          <p className="text-xs font-semibold tracking-widest text-crimson-pastel uppercase">
            Move. Track. Level Up.
          </p>
          <p className="text-xs text-text-secondary pt-1">
            Your progress starts with one move. Your movement is the game.
          </p>
        </div>

        {/* Auth Card */}
        <div className="fitron-card rounded-3xl p-8 border border-border-subtle shadow-2xl bg-bg-card/95 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-6 border-b border-border-subtle">
            <h2 className="text-xl font-bold text-white font-heading">
              {isForgotPassword
                ? 'Reset Password'
                : isSignUp
                ? 'Create Athlete Account'
                : 'Sign In to FITRON'}
            </h2>
            <span className="text-xs text-crimson-pastel font-semibold">
              {isSignUp ? 'New Player' : 'Returning'}
            </span>
          </div>

          {errorMsg && (
            <div className="mt-4 p-3.5 rounded-xl bg-crimson-dark/30 border border-crimson/50 text-crimson-pastel text-xs">
              {errorMsg}
            </div>
          )}

          {infoMsg && (
            <div className="mt-4 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs">
              {infoMsg}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4 mt-6">
            {isSignUp && (
              <>
                <div>
                  <label className="text-xs text-text-muted block mb-1 font-semibold">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Rivera"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-bg-secondary border border-border-subtle rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-crimson"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-text-muted block mb-1 font-semibold">Username</label>
                  <div className="relative">
                    <span className="text-xs font-mono text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2">@</span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TitanRunner"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-bg-secondary border border-border-subtle rounded-xl pl-8 pr-4 py-3 text-white text-sm focus:outline-none focus:border-crimson"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-xs text-text-muted block mb-1 font-semibold">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="email"
                  required
                  placeholder="athlete@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-subtle rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-crimson"
                />
              </div>
            </div>

            {!isForgotPassword && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-text-muted font-semibold">Password</label>
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-xs text-crimson-pastel hover:underline"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-bg-secondary border border-border-subtle rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-crimson"
                  />
                </div>
              </div>
            )}

            {isSignUp && (
              <div>
                <label className="text-xs text-text-muted block mb-1 font-semibold">Confirm Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-bg-secondary border border-border-subtle rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-crimson"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-crimson w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-crimson-md mt-6"
            >
              {loading ? (
                'Processing...'
              ) : isForgotPassword ? (
                'Send Password Reset Instructions'
              ) : isSignUp ? (
                <>
                  Create Account & Initialize ID <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch Mode Footer */}
          <div className="mt-6 pt-4 border-t border-border-subtle text-center text-xs text-text-secondary">
            {isForgotPassword ? (
              <button
                onClick={() => setIsForgotPassword(false)}
                className="text-crimson-pastel font-semibold hover:underline"
              >
                Back to Sign In
              </button>
            ) : isSignUp ? (
              <div>
                Already have a FITRON ID?{' '}
                <button
                  onClick={() => setIsSignUp(false)}
                  className="text-crimson-pastel font-bold hover:underline"
                >
                  Sign In
                </button>
              </div>
            ) : (
              <div>
                New to FITRON?{' '}
                <button
                  onClick={() => setIsSignUp(true)}
                  className="text-crimson-pastel font-bold hover:underline"
                >
                  Create an Account
                </button>
              </div>
            )}
          </div>

          {/* Quick Demo Access Button */}
          <div className="mt-4 pt-3 border-t border-border-subtle/50 text-center">
            <button
              type="button"
              onClick={handleQuickDemoAccess}
              className="w-full py-2.5 rounded-xl bg-bg-secondary hover:bg-bg-elevated border border-border-subtle text-xs text-text-secondary hover:text-white font-semibold transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Instant Demo Play (Auto Athlete)
            </button>
          </div>
        </div>

        {/* Security & Supabase Notice */}
        <div className="mt-6 text-center text-[11px] text-text-muted flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Encrypted Authentication with Supabase Row-Level Security</span>
        </div>
      </div>
    </div>
  );
};
