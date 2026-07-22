import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X, Info } from 'lucide-react';

const NotificationContext = createContext(() => {});
export const useNotify = () => useContext(NotificationContext);

const STYLES = {
  success: { icon: Check, color: '#3FCB6E', dot: '#3FCB6E' },
  error: { icon: X, color: '#E5847A', dot: '#E5847A' },
  info: { icon: Info, color: '#7EC8C8', dot: '#7EC8C8' },
};

export default function NotificationProvider({ children }) {
  const [toast, setToast] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const timers = useRef([]);

  const notify = useCallback(({ type = 'info', title, message, meta }) => {
    timers.current.forEach(clearTimeout);
    timers.current = [];

    const id = Date.now();
    setToast({ id, type, title, message, meta });
    setCollapsed(false);

    timers.current.push(setTimeout(() => setCollapsed(true), 2800));
    timers.current.push(
      setTimeout(() => setToast((current) => (current?.id === id ? null : current)), 4200)
    );
  }, []);

  const style = toast ? STYLES[toast.type] || STYLES.info : STYLES.info;
  const Icon = style.icon;

  return (
    <NotificationContext.Provider value={notify}>
      {children}
      <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 200, pointerEvents: 'none' }}>
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -16, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              style={{
                pointerEvents: 'auto',
                borderRadius: collapsed ? 22 : 18,
                background: 'rgba(22,20,17,0.88)',
                backdropFilter: 'blur(22px)',
                WebkitBackdropFilter: 'blur(22px)',
                border: '1px solid rgba(255,255,255,0.14)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.16)',
                overflow: 'hidden',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {collapsed ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: style.dot, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#F4F6F4', whiteSpace: 'nowrap' }}>{toast.title}</span>
                </div>
              ) : (
                <div style={{ width: 300, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: style.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={15} color="#0C120D" />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#F4F6F4', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{toast.title}</div>
                      {toast.message && (
                        <div style={{ fontSize: 11, color: '#9CA79E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{toast.message}</div>
                      )}
                    </div>
                  </div>

                  {toast.meta && toast.meta.length > 0 && (
                    <>
                      <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '12px 0' }} />
                      <div style={{ display: 'flex', gap: 8 }}>
                        {toast.meta.map((m) => (
                          <div key={m.label} style={{ flex: 1, textAlign: 'center', padding: 8, borderRadius: 10, background: 'rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: 10, color: '#8A9089' }}>{m.label}</div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: '#F4F6F4' }}>{m.value}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}
