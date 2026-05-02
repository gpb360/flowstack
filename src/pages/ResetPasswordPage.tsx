import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import { Command, Eye, EyeOff, Lock, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accessToken = searchParams.get('access_token') || searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  // Check if we have the required token
  const [hasValidToken, setHasValidToken] = useState(false);

  useEffect(() => {
    // Check if user is in a recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      // Check if this is a password recovery session
      const isRecovery = session?.access_token && accessToken;
      setHasValidToken(!!isRecovery);
    };
    checkSession();
  }, [accessToken]);

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
    const colors = ['bg-destructive', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-success'];

    return { score, label: labels[score - 1] || '', color: colors[score - 1] || '' };
  };

  const passwordStrength = getPasswordStrength(password);

  const triggerShake = () => {
    setShakeError(true);
    setTimeout(() => setShakeError(false), 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!password) {
      setError('Please enter a new password.');
      triggerShake();
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      triggerShake();
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      triggerShake();
      return;
    }

    if (passwordStrength.score < 3) {
      setError('Please choose a stronger password.');
      triggerShake();
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password
      });

      if (error) {
        setError(error.message);
        triggerShake();
      } else {
        setSuccess(true);
        // Redirect to login after a short delay
        setTimeout(() => {
          navigate('/auth', { replace: true });
        }, 2000);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  if (!hasValidToken && !success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="card-linear rounded-2xl p-8 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-surface flex items-center justify-center">
              <Lock className="w-8 h-8 text-text-muted" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary mb-2">
                Invalid Reset Link
              </h1>
              <p className="text-text-secondary">
                This password reset link is invalid or has expired.
              </p>
            </div>
            <div className="space-y-3">
              <ButtonUntitled
                onClick={() => navigate('/auth')}
                variant="primary"
                fullWidth
              >
                Go to Sign In
              </ButtonUntitled>
              <ButtonUntitled
                onClick={() => navigate('/auth?mode=forgot')}
                variant="ghost"
                fullWidth
              >
                Request New Reset Link
              </ButtonUntitled>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="card-linear rounded-2xl p-8 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary mb-2">
                Password Updated!
              </h1>
              <p className="text-text-secondary">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-text-muted">
              <Loader2 className="w-4 h-4 animate-spin" />
              Redirecting to sign in...
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gold-gradient opacity-5" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#23252a_1px,transparent_1px),linear-gradient(to_bottom,#23252a_1px,transparent_1px)] bg-[size:64px_64px] opacity-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-center p-12 w-full">
          <Link to="/" className="flex items-center gap-3 text-xl font-semibold mb-12">
            <div className="w-10 h-10 rounded-lg bg-gold-gradient flex items-center justify-center shadow-gold">
              <Command className="w-6 h-6 text-background" />
            </div>
            <span className="text-text-primary">FlowStack</span>
          </Link>

          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-gold-gradient">
              Secure your account
            </h2>
            <p className="text-xl text-text-secondary">
              Create a new password to regain access to your account.
            </p>

            <div className="space-y-4">
              {[
                { title: 'Strong encryption', desc: 'Your data is protected with industry-standard security' },
                { title: 'Privacy first', desc: 'We never store your password in plain text' },
                { title: 'Stay secure', desc: 'Use a unique password you don\'t use elsewhere' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 rounded-xl bg-surface"
                >
                  <p className="font-medium text-text-primary">{item.title}</p>
                  <p className="text-sm text-text-secondary mt-1">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Reset Password Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          {/* Mobile Logo */}
          <Link to="/" className="lg:hidden flex items-center justify-center gap-3 text-xl font-semibold mb-8">
            <div className="w-10 h-10 rounded-lg bg-gold-gradient flex items-center justify-center shadow-gold">
              <Command className="w-6 h-6 text-background" />
            </div>
            <span className="text-text-primary">FlowStack</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "card-linear rounded-2xl p-8 space-y-6",
              shakeError && "animate-[shake_0.5s_ease-in-out]"
            )}
          >
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gold-gradient flex items-center justify-center shadow-gold">
                <Lock className="w-8 h-8 text-background" />
              </div>
              <h1 className="text-2xl font-bold text-text-primary">
                Reset Password
              </h1>
              <p className="text-text-secondary">
                Enter your new password below
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <InputUntitled
                    id="password"
                    label="New Password"
                    placeholder="Enter new password"
                    type={showPassword ? 'text' : 'password'}
                    autoCapitalize="none"
                    autoComplete="new-password"
                    autoCorrect="off"
                    disabled={loading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[38px] text-text-muted hover:text-text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted">Password strength:</span>
                      <span className={cn("font-medium", passwordStrength.score >= 3 ? "text-success" : passwordStrength.score >= 2 ? "text-warning" : "text-destructive")}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={cn(
                            "h-1 flex-1 rounded-full transition-all duration-300",
                            level <= passwordStrength.score ? passwordStrength.color : "bg-surface"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <InputUntitled
                    id="confirmPassword"
                    label="Confirm Password"
                    placeholder="Confirm new password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoCapitalize="none"
                    autoComplete="new-password"
                    autoCorrect="off"
                    disabled={loading}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-[38px] text-text-muted hover:text-text-primary transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Match Indicator */}
                {confirmPassword && (
                  <div className="flex items-center gap-2 text-xs">
                    {password === confirmPassword ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        <span className="text-success">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <span className="text-destructive">Passwords do not match</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Password Requirements */}
              <div className="p-3 rounded-lg bg-surface space-y-1">
                <p className="text-xs font-medium text-text-primary mb-2">Password requirements:</p>
                <div className="space-y-1">
                  {[
                    { test: password.length >= 8, text: 'At least 8 characters' },
                    { test: password.length >= 12, text: '12+ characters (recommended)' },
                    { test: /[A-Z]/.test(password), text: 'Contains uppercase letter' },
                    { test: /[0-9]/.test(password), text: 'Contains number' },
                    { test: /[^A-Za-z0-9]/.test(password), text: 'Contains special character' },
                  ].map((req, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className={cn(
                        "w-3 h-3 flex-shrink-0",
                        req.test ? "text-success" : "text-text-muted"
                      )} />
                      <span className={cn(
                        req.test ? "text-text-primary" : "text-text-muted"
                      )}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive animate-in fade-in slide-in-from-top-2 duration-300">
                  {error}
                </div>
              )}

              <ButtonUntitled
                type="submit"
                disabled={loading || !password || !confirmPassword || password !== confirmPassword}
                variant="primary"
                isLoading={loading}
                fullWidth
                className="h-11"
              >
                {loading ? 'Updating Password...' : 'Update Password'}
              </ButtonUntitled>
            </form>

            {/* Back to Sign In */}
            <div className="text-center">
              <ButtonUntitled
                type="button"
                variant="ghost"
                onClick={() => navigate('/auth')}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back to Sign In
              </ButtonUntitled>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
};
