import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import { Loader2, Github, Chrome, Eye, EyeOff, ArrowRight, Shield, Mail, Clock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const intent = searchParams.get('intent');
  const isAuditIntent = intent === 'audit';

  const [isLogin, setIsLogin] = useState(isAuditIntent ? true : mode !== 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [useMagicLink, setUseMagicLink] = useState(isAuditIntent);
  const [showOauthOptions, setShowOauthOptions] = useState(!isAuditIntent);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [shakeError, setShakeError] = useState(false);

  const { signIn, signUp, session, isLoading, signInWithGithub, signInWithGoogle, resetPassword, signInWithMagicLink, hasCompletedOnboarding } = useAuth();
  const auditRedirectTo = isAuditIntent ? `${window.location.origin}/onboarding?intent=audit` : undefined;

  useEffect(() => {
    if (session && !isLoading) {
      if (!hasCompletedOnboarding) navigate(intent === 'audit' ? '/onboarding?intent=audit' : '/onboarding', { replace: true });
      else navigate(intent === 'audit' ? '/audit?continue=1' : '/dashboard', { replace: true });
    }
  }, [session, isLoading, navigate, hasCompletedOnboarding, intent]);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const resetForm = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
    setMagicLinkSent(false);
    setResendCountdown(0);
  }, []);

  const triggerShake = useCallback(() => {
    setShakeError(true);
    setTimeout(() => setShakeError(false), 500);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (useMagicLink) {
      const { error: magicLinkError } = await signInWithMagicLink(email, auditRedirectTo);
      setLoading(false);
      if (magicLinkError) {
        setError(magicLinkError.message);
        triggerShake();
      } else {
        setMagicLinkSent(true);
        setSuccessMessage('Check your email for a magic link to sign in');
        setResendCountdown(60);
      }
      return;
    }

    const { data, error: authError } = isLogin
      ? await signIn(email, password)
      : await signUp(email, password);

    if (authError) {
      setError(authError.message);
      setLoading(false);
      triggerShake();
    } else if (data?.session || data?.user) {
      if (!isLogin) {
        setSuccessMessage('Account created! Check your email to verify your account.');
      }
    } else {
      setLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setLoading(true);
    setError(null);
    const { error } = await signInWithGithub(auditRedirectTo);
    if (error) { setError(error.message); setLoading(false); triggerShake(); }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    const { error } = await signInWithGoogle(auditRedirectTo);
    if (error) { setError(error.message); setLoading(false); triggerShake(); }
  };

  const handleForgotPassword = async () => {
    if (!email) { setError('Please enter your email address first.'); triggerShake(); return; }
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) { setError(error.message); triggerShake(); }
    else setSuccessMessage('Password reset link sent! Check your email.');
  };

  const handleResendMagicLink = async () => {
    if (resendCountdown > 0) return;
    setLoading(true);
    const { error } = await signInWithMagicLink(email, auditRedirectTo);
    setLoading(false);
    if (error) { setError(error.message); triggerShake(); }
    else { setResendCountdown(60); setSuccessMessage('Another magic link has been sent to your email'); }
  };

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-emerald-500'];
    return { score, label: labels[score - 1] || '', color: colors[score - 1] || '' };
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="min-h-screen bg-[#08090a] text-white flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1c20_1px,transparent_1px),linear-gradient(to_bottom,#1a1c20_1px,transparent_1px)] bg-[size:64px_64px] opacity-40" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-[#d4af37]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link to="/" className="flex items-center gap-3">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 1L17 9L9 17L1 9L9 1Z" stroke="#d4af37" strokeWidth="1.5" fill="none" />
              <path d="M9 5L13 9L9 13L5 9L9 5Z" fill="#d4af37" />
            </svg>
            <span className="text-sm font-semibold tracking-[0.1em] text-white uppercase">FlowStack</span>
          </Link>

          <div className="space-y-8">
            <div>
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#d4af37] mb-4">Why FlowStack</p>
              <h2
                className="text-4xl lg:text-5xl leading-tight mb-6"
                style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}
              >
                Everything your business needs,<br />
                <span style={{ WebkitTextFillColor: 'transparent', WebkitTextStroke: '1px rgba(212,175,55,0.5)' }}>
                  in one place.
                </span>
              </h2>
              <p className="text-[#6b7280] text-base leading-relaxed max-w-md">
                CRM, marketing automation, AI agents, and workflows — connected in a single platform that scales with you.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { num: '01', title: 'CRM & Pipelines', desc: 'Manage contacts, deals, and activities' },
                { num: '02', title: 'Workflow Automation', desc: 'Build and trigger automated flows' },
                { num: '03', title: 'AI Agents', desc: 'Agents that execute tasks for you' },
                { num: '04', title: 'Email Marketing', desc: 'Campaigns, sequences, and templates' },
              ].map((item) => (
                <div key={item.num} className="border border-[#2a2d35] p-4 group hover:border-[#d4af37]/30 transition-colors">
                  <span className="text-[10px] font-mono text-[#4b5563] tracking-wider">{item.num}</span>
                  <p className="text-sm font-medium text-white mt-1">{item.title}</p>
                  <p className="text-xs text-[#4b5563] mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 text-xs text-[#4b5563]">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>256-bit SSL</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>SOC 2 Compliant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>GDPR Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#d4af37]/3 rounded-full blur-3xl pointer-events-none" />

        <div className={cn(
          "w-full max-w-md space-y-8 relative z-10",
          shakeError && "animate-[shake_0.5s_ease-in-out]"
        )}>
          {/* Mobile Logo */}
          <Link to="/" className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 1L17 9L9 17L1 9L9 1Z" stroke="#d4af37" strokeWidth="1.5" fill="none" />
              <path d="M9 5L13 9L9 13L5 9L9 5Z" fill="#d4af37" />
            </svg>
            <span className="text-sm font-semibold tracking-[0.1em] text-white uppercase">FlowStack</span>
          </Link>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl font-medium text-white tracking-tight">
              {isAuditIntent ? 'Save your FlowStack audit' : isLogin ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-sm text-[#6b7280]">
              {isAuditIntent
                ? 'Use email to create a secure audit workspace. Google and GitHub are optional.'
                : isLogin
                ? 'Sign in to your workspace'
                : 'Start your 14-day free trial. No credit card required.'}
            </p>
            {isAuditIntent && (
              <Link to="/audit?continue=1" className="inline-flex text-xs text-[#d4af37] hover:text-[#e8c547]">
                Back to audit intake
              </Link>
            )}
          </div>

          {/* Magic Link Success */}
          {magicLinkSent && (
            <div className="p-4 border border-[#d4af37]/20 bg-[#d4af37]/5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#d4af37]/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-[#d4af37]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Magic link sent!</p>
                  <p className="text-xs text-[#6b7280] mt-1">
                    Check your email for a secure link to sign in. Expires in 1 hour.
                  </p>
                </div>
              </div>
              <ButtonUntitled
                variant="tertiary"
                size="sm"
                onClick={handleResendMagicLink}
                disabled={resendCountdown > 0 || loading}
                className="mt-3 w-full"
              >
                {resendCountdown > 0 ? (
                  <>
                    <Clock className="w-3.5 h-3.5" />
                    Resend in {resendCountdown}s
                  </>
                ) : (
                  'Resend magic link'
                )}
              </ButtonUntitled>
            </div>
          )}

          {/* Form */}
          {!magicLinkSent && (
            <div className="space-y-5">
              {/* OAuth */}
              {showOauthOptions ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <ButtonUntitled
                      variant="outline"
                      size="lg"
                      disabled={loading}
                      onClick={handleGithubSignIn}
                      fullWidth
                    >
                      <Github className="w-4 h-4" />
                      GitHub
                    </ButtonUntitled>
                    <ButtonUntitled
                      variant="outline"
                      size="lg"
                      disabled={loading}
                      onClick={handleGoogleSignIn}
                      fullWidth
                    >
                      <Chrome className="w-4 h-4" />
                      Google
                    </ButtonUntitled>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-[#2a2d35]" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-[#08090a] px-2 text-[#4b5563]">or continue with email</span>
                    </div>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowOauthOptions(true)}
                  className="text-xs text-[#6b7280] hover:text-white transition-colors"
                >
                  Prefer GitHub or Google? Show those options.
                </button>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <InputUntitled
                  label="Email"
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                {!useMagicLink && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="text-sm text-[#9ca3af]">Password</label>
                      {isLogin && (
                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          className="text-xs text-[#d4af37] hover:text-[#e8c547] transition-colors"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        id="password"
                        placeholder="••••••••"
                        type={showPassword ? 'text' : 'password'}
                        autoCapitalize="none"
                        autoComplete={isLogin ? 'current-password' : 'new-password'}
                        autoCorrect="off"
                        disabled={loading}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-10 px-4 rounded-lg border border-[#2a2d35] bg-transparent text-white placeholder:text-[#4b5563] focus:outline-none focus:border-[#d4af37]/50 focus:ring-2 focus:ring-[#d4af37]/10 transition-all text-sm disabled:opacity-50"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4b5563] hover:text-[#9ca3af] transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {!isLogin && password && (
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#4b5563]">Password strength</span>
                          <span className={cn(
                            "font-medium",
                            passwordStrength.score >= 4 ? "text-emerald-400" :
                            passwordStrength.score >= 3 ? "text-lime-400" :
                            passwordStrength.score >= 2 ? "text-yellow-400" : "text-red-400"
                          )}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={cn(
                                "h-0.5 flex-1 rounded-full transition-all duration-300",
                                level <= passwordStrength.score ? passwordStrength.color : "bg-[#2a2d35]"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Magic Link Toggle */}
                {(isLogin || isAuditIntent) && (
                  <button
                    type="button"
                    onClick={() => { setUseMagicLink(!useMagicLink); resetForm(); }}
                    className="text-xs text-[#d4af37] hover:text-[#e8c547] flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {useMagicLink ? 'Use password instead' : 'Use magic link instead'}
                  </button>
                )}

                {/* Error */}
                {error && (
                  <div className="p-3 border border-red-500/20 bg-red-500/5 text-sm text-red-400 animate-in fade-in slide-in-from-top-2 duration-300">
                    {error}
                  </div>
                )}

                {/* Success */}
                {successMessage && !magicLinkSent && (
                  <div className="p-3 border border-emerald-500/20 bg-emerald-500/5 text-sm text-emerald-400 animate-in fade-in slide-in-from-top-2 duration-300">
                    {successMessage}
                  </div>
                )}

                <ButtonUntitled
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={loading || !email || (!useMagicLink && !password)}
                  fullWidth
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {useMagicLink ? 'Sending magic link...' : isLogin ? 'Signing in...' : 'Creating account...'}
                    </>
                  ) : (
                    <>
                      {useMagicLink ? 'Send Magic Link' : isLogin ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </ButtonUntitled>
              </form>

              <p className="px-2 text-center text-xs text-[#4b5563]">
                By continuing, you agree to our{' '}
                <Link to="/terms" className="text-[#6b7280] hover:text-white transition-colors underline underline-offset-2">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-[#6b7280] hover:text-white transition-colors underline underline-offset-2">Privacy Policy</Link>
              </p>

              {!isAuditIntent && (
                <div className="text-center text-sm">
                  <button
                    type="button"
                    onClick={() => { setIsLogin(!isLogin); resetForm(); }}
                    className="text-[#d4af37] hover:text-[#e8c547] font-medium transition-colors"
                  >
                    {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                  </button>
                </div>
              )}
            </div>
          )}
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
