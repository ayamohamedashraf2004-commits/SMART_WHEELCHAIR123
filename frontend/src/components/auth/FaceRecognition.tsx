import React, { useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';
import { Shield, UserPlus, LogOut } from 'lucide-react';

interface FaceRecognitionProps {
  onAuthenticated: () => void;
}

const FaceRecognition: React.FC<FaceRecognitionProps> = ({ onAuthenticated }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('INITIALIZING');

  const handleComplete = useCallback(() => {
    setTimeout(onAuthenticated, 500);
  }, [onAuthenticated]);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setStatus('AUTHENTICATED');
          handleComplete();
          return 100;
        }
        if (prev > 60) setStatus('VERIFYING_IDENTITY');
        else if (prev > 20) setStatus('SCANNING_FEATURES');
        return prev + 2;
      });
    }, 60);
    return () => clearInterval(timer);
  }, [handleComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background flex items-center justify-center z-50"
    >
      <div className="relative w-full max-w-[420px] mx-4 p-6 sm:p-8 bg-surface rounded-2xl glow-border">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <Shield size={16} className="text-primary" />
          <h2 className="text-primary font-mono text-sm tracking-widest uppercase">
            Face Recognition
          </h2>
        </div>
        <p className="text-muted-foreground text-xs mb-6 font-mono">
          Hold still... System authenticating
        </p>

        {/* Webcam Frame */}
        <div className="relative w-full aspect-square bg-background rounded-lg overflow-hidden">
          <Webcam
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            mirrored
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: 'user' }}
          />

          {/* Corner Brackets */}
          <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-primary" />
          <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-primary" />
          <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-primary" />
          <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-primary" />

          {/* Scanning Line */}
          <motion.div
            animate={{ translateY: [0, 300, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute top-0 left-0 w-full h-[2px] bg-primary scan-line"
          />

          {/* Center reticle */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-20 h-20 rounded-full border border-primary/30" />
            <div className="absolute w-[1px] h-10 bg-primary/30" />
            <div className="absolute w-10 h-[1px] bg-primary/30" />
          </div>
        </div>

        {/* Progress */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-[10px] font-mono text-primary">
            <span>{status}...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary glow-cyan"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>

        {/* Auth Actions */}
        <div className="mt-6 flex items-center justify-between">
          <button className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-primary transition-colors">
            <UserPlus size={14} />
            SIGN_UP
          </button>
          <button className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-destructive transition-colors">
            <LogOut size={14} />
            SIGN_OUT
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default FaceRecognition;
