export default function Logo({ size = 36 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: '#1A1814',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 52 52" fill="none">
        <path d="M26 6l18 8v12c0 12-8 18-18 20-10-2-18-8-18-20V14z" stroke="#3FCB6E" strokeWidth="3.5" />
        <rect x="15" y="24" width="15" height="9" rx="2" stroke="#3FCB6E" strokeWidth="2.3" opacity="0.5" />
        <rect x="18" y="19" width="15" height="9" rx="2" stroke="#3FCB6E" strokeWidth="2.3" opacity="0.75" />
        <rect x="21" y="14" width="15" height="9" rx="2" stroke="#3FCB6E" strokeWidth="2.3" />
      </svg>
    </div>
  );
}
