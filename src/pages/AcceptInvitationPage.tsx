import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { getInvitationByToken, acceptInvitation, type InvitationWithDetails } from '@/lib/invitations';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { Command, Building2, Mail, UserCheck, UserX, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const AcceptInvitationPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  const [invitation, setInvitation] = useState<InvitationWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [declined, setDeclined] = useState(false);

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!token) {
        setError('Invalid invitation link.');
        setLoading(false);
        return;
      }

      const { data, error } = await getInvitationByToken(token);

      if (error) {
        setError(error.message || 'Failed to load invitation.');
      } else {
        setInvitation(data);
      }

      setLoading(false);
    };

    fetchInvitation();
  }, [token]);

  const handleAccept = async () => {
    if (!user || !token) {
      // Redirect to auth with return URL
      navigate(`/auth?redirect=${encodeURIComponent(`/invite/${token}`)}`);
      return;
    }

    setAccepting(true);
    setError(null);

    const { success, error: acceptError } = await acceptInvitation(token, user.id);

    if (success) {
      setSuccess(true);
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 2000);
    } else {
      setError(acceptError?.message || 'Failed to accept invitation.');
    }

    setAccepting(false);
  };

  const handleDecline = async () => {
    if (!token) return;

    setAccepting(true);
    setError(null);

    // Update invitation status to expired
    const { error } = await supabase
      .from('invitations')
      .update({ status: 'expired' })
      .eq('token', token);

    if (error) {
      setError('Failed to decline invitation.');
    } else {
      setDeclined(true);
      // Redirect to home after a short delay
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 2000);
    }

    setAccepting(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-text-secondary">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="card-linear rounded-2xl p-8 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary mb-2">
                Invitation Not Found
              </h1>
              <p className="text-text-secondary">
                {error || 'This invitation link is invalid or has expired.'}
              </p>
            </div>
            <ButtonUntitled
              onClick={() => navigate('/')}
              variant="primary"
              fullWidth
            >
              Go to Homepage
            </ButtonUntitled>
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
                Welcome to the Team!
              </h1>
              <p className="text-text-secondary">
                You've successfully joined <span className="font-semibold text-primary">{invitation?.organization_name}</span>.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-text-muted">
              <Loader2 className="w-4 h-4 animate-spin" />
              Redirecting to dashboard...
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (declined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="card-linear rounded-2xl p-8 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-surface flex items-center justify-center">
              <UserX className="w-8 h-8 text-text-muted" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary mb-2">
                Invitation Declined
              </h1>
              <p className="text-text-secondary">
                You've declined this invitation. No worries!
              </p>
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
              Join the team
            </h2>
            <p className="text-xl text-text-secondary">
              You've been invited to collaborate on FlowStack.
            </p>

            <div className="space-y-4">
              {[
                { icon: Building2, title: 'Work together', desc: 'Collaborate on projects and workflows' },
                { icon: UserCheck, title: 'Shared access', desc: 'Access the same tools and resources' },
                { icon: Mail, title: 'Stay connected', desc: 'Real-time updates and notifications' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-surface"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">{item.title}</p>
                    <p className="text-sm text-text-secondary">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Invitation Content */}
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
            className="card-linear rounded-2xl p-8 space-y-6"
          >
            {/* Organization Icon */}
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gold-gradient flex items-center justify-center shadow-gold">
              <Building2 className="w-8 h-8 text-background" />
            </div>

            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-text-primary">
                You're Invited!
              </h1>
              <p className="text-text-secondary">
                Join <span className="font-semibold text-primary">{invitation?.organization_name}</span> on FlowStack
              </p>
            </div>

            {/* Invitation Details */}
            <div className="space-y-3 py-4 border-t border-b border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Invited by</span>
                <span className="text-sm font-medium text-text-primary">{invitation?.inviter_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Role</span>
                <span className="text-sm font-medium text-primary capitalize">{invitation?.role}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Email</span>
                <span className="text-sm font-medium text-text-primary">{invitation?.email}</span>
              </div>
            </div>

            {/* Auth Notice */}
            {!user && (
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">Sign in required</p>
                    <p className="text-xs text-text-secondary mt-1">
                      You'll need to sign in to {invitation?.email} to accept this invitation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <ButtonUntitled
                onClick={handleAccept}
                disabled={accepting}
                variant="primary"
                isLoading={accepting}
                fullWidth
                leftIcon={!accepting ? <UserCheck className="h-4 w-4" /> : undefined}
                className="h-11"
              >
                {accepting ? 'Accepting...' : 'Accept Invitation'}
              </ButtonUntitled>

              <ButtonUntitled
                onClick={handleDecline}
                disabled={accepting}
                variant="ghost"
                fullWidth
                className="h-11"
              >
                Decline
              </ButtonUntitled>
            </div>

            {/* Terms */}
            <p className="px-4 text-center text-xs text-text-muted">
              By accepting, you agree to the organization's terms and your role as {invitation?.role}.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
