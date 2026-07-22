import { Search, X } from 'lucide-react';

export default function SearchBar({ query, setQuery }) {
  return (
    <div
      className="flex items-center rounded-2xl"
      style={{ background: 'rgba(253,250,245,0.7)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid rgba(26,24,20,0.1)' }}
    >
      <Search size={18} style={{ color: '#A89E8E', marginLeft: 18 }} />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search players, teams..."
        className="flex-1 bg-transparent px-4 py-4 text-base outline-none"
        style={{ color: '#1A1814' }}
      />
      {query && (
        <button
          onClick={() => setQuery('')}
          className="p-2 mr-3 rounded-full hover:opacity-70 transition-opacity"
        >
          <X size={18} style={{ color: '#A89E8E' }} />
        </button>
      )}
    </div>
  );
}
