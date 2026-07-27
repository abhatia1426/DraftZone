import { Search, X } from 'lucide-react';

const FOCUS_RING = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]';

export default function SearchBar({ id, query, setQuery }) {
  return (
    <div
      className="flex items-center rounded-2xl"
      style={{ background: 'rgba(var(--bg-surface-rgb), 0.7)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid rgba(var(--text-primary-rgb), 0.1)' }}
    >
      <Search size={18} style={{ color: 'var(--text-muted)', marginLeft: 18 }} aria-hidden="true" />
      <input
        id={id}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search players, teams..."
        className={`flex-1 bg-transparent px-4 py-4 text-base outline-none rounded-2xl ${FOCUS_RING}`}
        style={{ color: 'var(--text-primary)' }}
      />
      {query && (
        <button
          onClick={() => setQuery('')}
          aria-label="Clear search"
          className={`p-2 mr-3 rounded-full hover:opacity-70 transition-opacity ${FOCUS_RING}`}
        >
          <X size={18} style={{ color: 'var(--text-muted)' }} />
        </button>
      )}
    </div>
  );
}
