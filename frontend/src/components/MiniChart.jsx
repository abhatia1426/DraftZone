export default function MiniChart({ data, color }) {
    if (!data || data.length === 0) return null;
  
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
  
    const points = data
      .map(
        (v, i) =>
          `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 80}`
      )
      .join(" ");
  
    return (
      <svg viewBox="0 0 100 100" className="w-full h-12">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  