import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Sparkles, Check } from 'lucide-react';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import { useNotify } from '../components/NotificationProvider';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getPasswordStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: 'var(--text-muted)' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: 'Weak', color: 'var(--warn)' };
  if (score <= 3) return { score, label: 'Medium', color: 'var(--gold)' };
  return { score, label: 'Strong', color: 'var(--accent)' };
};

const ScoutBadge = () => (
  <motion.div
    animate={{ scale: [1, 1.1, 1] }}
    transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
    style={{
      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, var(--accent-mid), var(--accent))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(var(--accent-rgb), 0.35)',
    }}
  >
    <Sparkles size={12} color="var(--text-inverse)" />
  </motion.div>
);

const Login = ({ user, onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [securityTip, setSecurityTip] = useState('');
  const [tipLoading, setTipLoading] = useState(false);
  const navigate = useNavigate();
  const notify = useNotify();

  useEffect(() => {
    if (user) navigate(user.role === 'admin' ? '/admin' : '/draft');
  }, [user, navigate]);

  useEffect(() => {
    if (!isSignup || securityTip || tipLoading) return;
    setTipLoading(true);
    axios.post('http://localhost:8080/api/ai/chat', {
      message: 'Give me one short, specific tip (under 20 words, no preamble) for creating a strong, secure account password.',
      context: {},
    })
      .then((res) => setSecurityTip(res.data.reply || ''))
      .catch(() => setSecurityTip('Use a unique passphrase you don\'t reuse anywhere else.'))
      .finally(() => setTipLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignup]);

  const strength = getPasswordStrength(password);

  // Validates the values actually being submitted rather than reading state.
  // The demo-login buttons call this in the same tick as setEmail/setPassword,
  // so state is still stale at that point and validating it rejected valid input.
  const validate = (candidateEmail = email, candidatePassword = password) => {
    const errs = {};
    if (!EMAIL_RE.test(candidateEmail)) errs.email = 'Enter a valid email address.';
    if (isSignup) {
      if (candidatePassword.length < 8 || !/\d/.test(candidatePassword)) errs.password = 'At least 8 characters, including a number.';
      if (confirmPassword !== candidatePassword) errs.confirmPassword = "Passwords don't match.";
    } else if (!candidatePassword) {
      errs.password = 'Enter your password.';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submitCredentials = async (submitEmail, submitPassword) => {
    setError('');
    if (!validate(submitEmail, submitPassword)) return;

    setIsSubmitting(true);
    const endpoint = isSignup ? '/signup' : '/login';

    try {
      // Without a timeout a stalled request leaves the button stuck on
      // "Please wait…" forever with no way back.
      const res = await axios.post(`http://localhost:8080/api/auth${endpoint}`, {
        email: submitEmail, password: submitPassword, role,
      }, { timeout: 12000 });

      if (res.data.success) {
        const userData = res.data.user;
        const userRole = (typeof userData === 'string') ? userData : userData.role;

        onLogin(res.data.user);
        notify({
          type: 'success',
          title: isSignup ? 'Account created' : 'Welcome back',
          message: `Signed in as ${userRole}`,
        });
        navigate(userRole === 'admin' ? '/admin' : '/draft');
      } else {
        setError(res.data.message || 'Something went wrong.');
        notify({ type: 'error', title: isSignup ? 'Sign up failed' : 'Login failed', message: res.data.message });
      }
    } catch (err) {
      const timedOut = err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT';
      const msg = timedOut
        ? 'That took too long to respond. Check your connection and try again.'
        : err.response?.data?.message || 'Connection error. Is the backend running?';
      setError(msg);
      notify({ type: 'error', title: isSignup ? 'Sign up failed' : 'Login failed', message: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitCredentials(email, password);
  };

  const quickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setFieldErrors({});
    submitCredentials(demoEmail, demoPassword);
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError('');
    setFieldErrors({});
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="w-full min-h-screen" style={{ background: 'var(--bg-base)', fontFamily: "'Inter', sans-serif", position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Plus+Jakarta+Sans:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        .dz-wordmark { font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.02em; }
        .dz-heading { font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.02em; }
      `}</style>

      <motion.div animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }} transition={{ repeat: Infinity, duration: 18, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: -100, left: -80, width: 380, height: 380, borderRadius: '50%', background: 'var(--accent-bright)', opacity: 0.28, filter: 'blur(90px)', pointerEvents: 'none' }} />
      <motion.div animate={{ x: [0, -30, 20, 0], y: [0, 30, -20, 0] }} transition={{ repeat: Infinity, duration: 20, ease: 'easeInOut' }}
        style={{ position: 'absolute', bottom: -120, right: -100, width: 420, height: 420, borderRadius: '50%', background: '#4FA8D8', opacity: 0.24, filter: 'blur(90px)', pointerEvents: 'none' }} />
      <motion.div animate={{ x: [0, 25, -15, 0], y: [0, -20, 15, 0] }} transition={{ repeat: Infinity, duration: 15, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: '40%', left: '55%', width: 260, height: 260, borderRadius: '50%', background: '#FFD166', opacity: 0.18, filter: 'blur(90px)', pointerEvents: 'none' }} />

      <nav className="sticky top-0 z-50" style={{ background: 'rgba(var(--bg-base-rgb), 0.7)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(var(--text-primary-rgb), 0.08)', position: 'relative' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <Logo size={36} />
            <span className="dz-wordmark text-2xl" style={{ color: 'var(--text-primary)' }}>
              DRAFT<span style={{ color: 'var(--accent)' }}>ZONE</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="inline-flex items-center min-h-11 px-2 text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
              Back to homepage
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center px-4" style={{ minHeight: 'calc(100vh - 73px)', position: 'relative' }}>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          style={{
            width: '100%', maxWidth: 400, padding: '32px 28px', borderRadius: 24,
            background: 'rgba(var(--bg-surface-rgb), 0.5)', backdropFilter: 'blur(28px) saturate(1.6)', WebkitBackdropFilter: 'blur(28px) saturate(1.6)',
            border: '1px solid rgba(255,255,255,0.6)',
            boxShadow: '0 24px 60px rgba(30,25,15,0.15), inset 0 1px 0 rgba(255,255,255,0.7)',
          }}
        >
          <h1 className="dz-heading text-2xl font-bold text-center mb-1" style={{ color: 'var(--text-primary)' }}>
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-center text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            {isSignup ? 'Join DraftZone to start drafting.' : 'Log in to your DraftZone account.'}
          </p>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden', marginBottom: 14 }}
              >
                <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(196,87,10,0.12)', border: '1px solid rgba(196,87,10,0.25)', color: 'var(--warn)', fontSize: 12, fontWeight: 500, textAlign: 'center' }}>
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="dz-email" className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Email</label>
              <input
                id="dz-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl p-3 mt-1 outline-none transition-colors"
                style={{
                  background: 'rgba(var(--bg-surface-rgb), 0.6)', backdropFilter: 'blur(6px)',
                  border: `1px solid ${fieldErrors.email ? 'var(--warn)' : 'rgba(var(--text-primary-rgb), 0.12)'}`, color: 'var(--text-primary)', fontSize: 14,
                }}
                placeholder="admin@draftzone.com"
              />
              {fieldErrors.email && <p style={{ fontSize: 11, color: 'var(--warn)', marginTop: 4 }}>{fieldErrors.email}</p>}
            </div>

            <div>
              <label htmlFor="dz-password" className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="dz-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl p-3 mt-1 outline-none transition-colors"
                  style={{
                    background: 'rgba(var(--bg-surface-rgb), 0.6)', backdropFilter: 'blur(6px)',
                    border: `1px solid ${fieldErrors.password ? 'var(--warn)' : 'rgba(var(--text-primary-rgb), 0.12)'}`, color: 'var(--text-primary)', fontSize: 14, paddingRight: 40,
                  }}
                  placeholder="••••••••"
                />
                {/* 44x44 hit area per WCAG target size; the icon itself stays 16px. */}
                <button type="button" onClick={() => setShowPassword((s) => !s)}
                  style={{
                    position: 'absolute', right: 2, top: 'calc(50% + 2px)', transform: 'translateY(-50%)',
                    width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && <p style={{ fontSize: 11, color: 'var(--warn)', marginTop: 4 }}>{fieldErrors.password}</p>}

              {isSignup && password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ height: 4, borderRadius: 2, background: 'rgba(var(--text-primary-rgb), 0.08)', overflow: 'hidden' }}>
                    <motion.div
                      animate={{ width: `${(strength.score / 5) * 100}%`, background: strength.color }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      style={{ height: '100%', borderRadius: 2 }}
                    />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: strength.color }}>{strength.label}</span>
                </div>
              )}
            </div>

            <AnimatePresence>
              {isSignup && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 14 }}
                >
                  <div>
                    <label htmlFor="dz-confirm-password" className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Confirm password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="dz-confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-xl p-3 mt-1 outline-none transition-colors"
                        style={{
                          background: 'rgba(var(--bg-surface-rgb), 0.6)', backdropFilter: 'blur(6px)',
                          border: `1px solid ${fieldErrors.confirmPassword ? 'var(--warn)' : 'rgba(var(--text-primary-rgb), 0.12)'}`, color: 'var(--text-primary)', fontSize: 14, paddingRight: 34,
                        }}
                        placeholder="••••••••"
                      />
                      {confirmPassword && confirmPassword === password && (
                        <Check size={16} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-4px)', color: 'var(--accent)' }} />
                      )}
                    </div>
                    {fieldErrors.confirmPassword && <p style={{ fontSize: 11, color: 'var(--warn)', marginTop: 4 }}>{fieldErrors.confirmPassword}</p>}
                  </div>

                  <div>
                    <label htmlFor="dz-role" className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Select role</label>
                    <select
                      id="dz-role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full rounded-xl p-3 mt-1 outline-none cursor-pointer"
                      style={{ background: 'rgba(var(--bg-surface-rgb), 0.6)', backdropFilter: 'blur(6px)', border: '1px solid rgba(var(--text-primary-rgb), 0.12)', color: 'var(--text-primary)', fontSize: 14 }}
                    >
                      <option value="user">Fantasy Manager (User)</option>
                      <option value="admin">Commissioner (Admin)</option>
                    </select>
                  </div>

                  <div style={{
                    display: 'flex', gap: 8, alignItems: 'flex-start', padding: '10px 12px', borderRadius: 12,
                    background: 'rgba(var(--accent-rgb), 0.17)', backdropFilter: 'blur(10px)', border: '1px solid rgba(var(--accent-rgb), 0.15)',
                  }}>
                    <ScoutBadge />
                    <div style={{ fontSize: 11, lineHeight: 1.5, color: 'var(--accent-text)', paddingTop: 3 }}>
                      {tipLoading ? 'Scout is thinking of a tip…' : securityTip}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileTap={{ scale: 0.97 }}
              className="mt-1 py-3 rounded-full font-semibold uppercase tracking-wide text-sm"
              style={{
                background: isSubmitting ? 'rgba(var(--text-primary-rgb), 0.4)' : 'var(--text-primary)', color: 'var(--text-inverse)',
                boxShadow: '0 8px 20px rgba(var(--text-primary-rgb), 0.2)', cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? 'Please wait…' : isSignup ? 'Create account' : 'Log in'}
            </motion.button>
          </form>

          <div className="mt-5 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            {isSignup ? 'Already have an account?' : 'Need an account?'}{' '}
            <button onClick={toggleMode} className="font-semibold" style={{ color: 'var(--accent)', minHeight: 44, padding: '0 6px', cursor: 'pointer' }}>
              {isSignup ? 'Log in' : 'Sign up'}
            </button>
          </div>

          {!isSignup && (
            <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 12, background: 'rgba(var(--text-primary-rgb), 0.04)', border: '1px solid rgba(var(--text-primary-rgb), 0.08)' }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6, textAlign: 'center' }}>
                Quick demo login
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <motion.button whileTap={{ scale: 0.96 }} type="button" onClick={() => quickFill('admin@draftzone.com', 'admin')}
                  style={{ flex: 1, minHeight: 44, padding: '8px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'rgba(var(--bg-surface-rgb), 0.6)', border: '1px solid rgba(var(--text-primary-rgb), 0.1)', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  Admin
                </motion.button>
                <motion.button whileTap={{ scale: 0.96 }} type="button" onClick={() => quickFill('user@draftzone.com', 'user')}
                  style={{ flex: 1, minHeight: 44, padding: '8px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'rgba(var(--bg-surface-rgb), 0.6)', border: '1px solid rgba(var(--text-primary-rgb), 0.1)', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  User
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
