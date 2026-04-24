import React, { useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';
import { Shield, UserPlus, LogOut, ArrowLeft } from 'lucide-react';
import { api, type SignupData, type UserProfile } from '@/services/api';

interface FaceRecognitionProps {
  onAuthenticated: (user: UserProfile) => void;
}

const FaceRecognition: React.FC<FaceRecognitionProps> = ({ onAuthenticated }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('INITIALIZING');
  const [error, setError] = useState<string | null>(null);
  const [showSignup, setShowSignup] = useState(false);
  const [signupData, setSignupData] = useState<SignupData>({ name: '', age: 0, phone: '', emergency_contact: '' });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);

  const startLogin = useCallback(async () => {
    setIsLoggingIn(true);
    setError(null);
    setProgress(0);
    setStatus('INITIALIZING');

    // Simulate progress while waiting for backend
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) { clearInterval(timer); return 90; }
        if (prev > 60) setStatus('VERIFYING_IDENTITY');
        else if (prev > 20) setStatus('SCANNING_FEATURES');
        return prev + 2;
      });
    }, 60);

    try {
      const user = await api.login();
      clearInterval(timer);
      setProgress(100);
      setStatus('AUTHENTICATED');
      setTimeout(() => onAuthenticated(user), 500);
    } catch (err) {
      clearInterval(timer);
      setProgress(0);
      setStatus('FAILED');
      setError('Authentication failed. Please try again.');
      setIsLoggingIn(false);
    }
  }, [onAuthenticated]);

  useEffect(() => {
    startLogin();
  }, [startLogin]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningUp(true);
    setError(null);
    try {
      await api.signup(signupData);
      setShowSignup(false);
      setSignupData({ name: '', age: 0, phone: '', emergency_contact: '' });
      // After signup, start login
      startLogin();
    } catch {
      setError('Signup failed. Please try again.');
    } finally {
      setIsSigningUp(false);
    }
  };

  if (showSignup) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background flex items-center justify-center z-50"
      >
        <div className="relative w-full max-w-[420px] mx-4 p-6 sm:p-8 bg-surface rounded-2xl glow-border">
          <button onClick={() => setShowSignup(false)} className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-primary transition-colors mb-4">
            <ArrowLeft size={14} />
            BACK
          </button>
          <div className="flex items-center gap-2 mb-2">
            <UserPlus size={16} className="text-primary" />
            <h2 className="text-primary font-mono text-sm tracking-widest uppercase">Sign Up</h2>
          </div>
          <p className="text-muted-foreground text-xs mb-6 font-mono">Register new user for face recognition</p>

          {error && <p className="text-destructive text-xs font-mono mb-4">{error}</p>}

          <form onSubmit={handleSignup} className="space-y-3">
            <input
              type="text" required placeholder="Full Name"
              value={signupData.name}
              onChange={(e) => setSignupData(d => ({ ...d, name: e.target.value }))}
              className="w-full h-9 px-3 bg-secondary rounded-lg text-xs font-mono text-foreground placeholder:text-muted-foreground border-none outline-none focus:ring-1 focus:ring-primary/30"
            />
            <input
              type="number" required placeholder="Age" min={1} max={120}
              value={signupData.age || ''}
              onChange={(e) => setSignupData(d => ({ ...d, age: parseInt(e.target.value) || 0 }))}
              className="w-full h-9 px-3 bg-secondary rounded-lg text-xs font-mono text-foreground placeholder:text-muted-foreground border-none outline-none focus:ring-1 focus:ring-primary/30"
            />
            <input
              type="tel" required placeholder="Phone (+20 XXX XXX XXXX)"
              value={signupData.phone}
              onChange={(e) => setSignupData(d => ({ ...d, phone: e.target.value }))}
              className="w-full h-9 px-3 bg-secondary rounded-lg text-xs font-mono text-foreground placeholder:text-muted-foreground border-none outline-none focus:ring-1 focus:ring-primary/30"
            />
            <input
              type="tel" required placeholder="Emergency Contact"
              value={signupData.emergency_contact}
              onChange={(e) => setSignupData(d => ({ ...d, emergency_contact: e.target.value }))}
              className="w-full h-9 px-3 bg-secondary rounded-lg text-xs font-mono text-foreground placeholder:text-muted-foreground border-none outline-none focus:ring-1 focus:ring-primary/30"
            />
            <button
              type="submit" disabled={isSigningUp}
              className="w-full h-9 bg-primary/20 border border-primary/30 rounded-lg text-primary text-xs font-mono font-bold hover:bg-primary/30 transition-all disabled:opacity-50"
            >
              {isSigningUp ? 'SCANNING...' : 'REGISTER & SCAN FACE'}
            </button>
          </form>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background flex items-center justify-center z-50"
    >
      <div className="relative w-full max-w-[420px] mx-4 p-6 sm:p-8 bg-surface rounded-2xl glow-border">
        <div className="flex items-center gap-2 mb-2">
          <Shield size={16} className="text-primary" />
          <h2 className="text-primary font-mono text-sm tracking-widest uppercase">Face Recognition</h2>
        </div>
        <p className="text-muted-foreground text-xs mb-6 font-mono">Hold still... System authenticating</p>

        {error && (
          <div className="mb-4 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-destructive text-xs font-mono">{error}</p>
          </div>
        )}

        <div className="relative w-full aspect-square bg-background rounded-lg overflow-hidden">
          <Webcam
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            mirrored audio={false} screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: 'user' }}
          />
          <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-primary" />
          <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-primary" />
          <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-primary" />
          <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-primary" />
          <motion.div
            animate={{ translateY: [0, 300, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute top-0 left-0 w-full h-[2px] bg-primary scan-line"
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-20 h-20 rounded-full border border-primary/30" />
            <div className="absolute w-[1px] h-10 bg-primary/30" />
            <div className="absolute w-10 h-[1px] bg-primary/30" />
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-[10px] font-mono text-primary">
            <span>{status}...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
            <motion.div className="h-full bg-primary glow-cyan" style={{ width: `${progress}%` }} transition={{ duration: 0.1 }} />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button onClick={() => setShowSignup(true)} className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-primary transition-colors">
            <UserPlus size={14} />
            SIGN_UP
          </button>
          {error && (
            <button onClick={startLogin} className="flex items-center gap-2 text-xs font-mono text-primary hover:text-primary/80 transition-colors">
              RETRY
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default FaceRecognition;
