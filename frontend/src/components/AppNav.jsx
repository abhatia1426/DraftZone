import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

const MotionDiv = motion.div;

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Players', to: '/player-search' },
  { label: 'Draft', to: '/draft' },
  { label: 'Odds', to: '/odds' },
  { label: 'Authors', to: '/authors' },
  { label: 'Bets', to: '/my-bets' },
];

const FOCUS_RING = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]';

// Shared top nav for Home and PlayerSearchPage: same links, same glass
// treatment, and (unlike the markup it replaces) an actual mobile menu —
// the auth action and every link besides the logo were previously
// `hidden md:*`, so phone-width visitors had no way to navigate or log in.
export default function AppNav({ user, onLogout }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navLinks = user?.role === 'admin' ? [...NAV_LINKS, { label: 'Admin', to: '/admin' }] : NAV_LINKS;

  return (
    <nav
      className="sticky top-0 z-50"
      style={{ background: 'rgba(var(--bg-base-rgb), 0.9)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(var(--text-primary-rgb), 0.08)' }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className={`flex items-center gap-3 rounded-lg ${FOCUS_RING}`} onClick={() => setMobileOpen(false)}>
          <Logo size={36} />
          <span className="dz-wordmark text-2xl" style={{ color: 'var(--text-primary)' }}>
            DRAFT<span style={{ color: 'var(--accent)' }}>ZONE</span>
          </span>
        </Link>

        <div className="hidden md:flex gap-8 text-sm font-medium">
          {navLinks.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`hover:opacity-70 transition-opacity rounded ${FOCUS_RING}`}
                style={{ color: active ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: active ? 600 : 500 }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <button
              onClick={onLogout}
              className={`hidden md:inline-block px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity ${FOCUS_RING}`}
              style={{ background: 'var(--text-primary)', color: 'var(--text-inverse)' }}
            >
              Log out
            </button>
          ) : (
            <Link
              to="/login"
              className={`hidden md:inline-block px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity ${FOCUS_RING}`}
              style={{ background: 'var(--text-primary)', color: 'var(--text-inverse)' }}
            >
              Get Started
            </Link>
          )}

          <button
            type="button"
            className={`md:hidden p-2 rounded-lg ${FOCUS_RING}`}
            style={{ color: 'var(--text-primary)' }}
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <MotionDiv
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="md:hidden overflow-hidden"
            style={{ borderTop: '1px solid rgba(var(--text-primary-rgb), 0.08)' }}
          >
            <div className="px-6 py-4 flex flex-col gap-1">
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`py-2.5 text-sm font-medium rounded-lg ${FOCUS_RING}`}
                  style={{ color: location.pathname === item.to ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-3 mt-2" style={{ borderTop: '1px solid rgba(var(--text-primary-rgb), 0.08)' }}>
                {user ? (
                  <button
                    onClick={() => { setMobileOpen(false); onLogout(); }}
                    className={`w-full px-5 py-2.5 rounded-full text-sm font-medium text-center ${FOCUS_RING}`}
                    style={{ background: 'var(--text-primary)', color: 'var(--text-inverse)' }}
                  >
                    Log out
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className={`block w-full px-5 py-2.5 rounded-full text-sm font-medium text-center ${FOCUS_RING}`}
                    style={{ background: 'var(--text-primary)', color: 'var(--text-inverse)' }}
                  >
                    Get Started
                  </Link>
                )}
              </div>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </nav>
  );
}
