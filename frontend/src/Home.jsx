import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DraftLogo from './assets/FFLogo.jpeg';
import FieldImg from './assets/Field.jpeg';

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="w-full overflow-hidden bg-[#0a0e1a]">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a0e1a] via-[#0f1524] to-[#1a1f35] opacity-90 pointer-events-none" />
      
      {/* Floating Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#1DB954] rounded-full blur-[120px] opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full blur-[120px] opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrollY > 50 ? 'rgba(10, 14, 26, 0.95)' : 'transparent',
          backdropFilter: scrollY > 50 ? 'blur(12px)' : 'none',
          borderBottom: scrollY > 50 ? '1px solid rgba(29, 185, 84, 0.2)' : 'none'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <img
                src={DraftLogo}
                className="h-12 w-12 rounded-full border-2 border-[#1DB954] group-hover:scale-110 transition-transform duration-300"
                alt="Fantasy Football Logo"
              />
              <div className="absolute inset-0 rounded-full bg-[#1DB954] opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />
            </div>
            <span className="text-2xl font-black tracking-tight">
              DRAFT<span className="text-[#1DB954]">ZONE</span>
            </span>
          </div>

          {/* Links */}
          <div className="hidden md:flex gap-8 text-sm font-bold uppercase tracking-wider">
            {['Home', 'Players', 'Draft', 'Odds', 'Login & Signup' ].map((item) => (
              <Link
                key={item}
                to={item === 'Home' ? '/' : item === 'Players' ? '/player-search' : item === 'Draft' ? '/draft' : item === 'Odds' ? '/odds' : '#'}
                className="relative text-gray-400 hover:text-white transition-colors group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#1DB954] group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <Link
            to="/login"
            className="hidden md:block px-6 py-2.5 bg-[#1DB954] text-black font-bold rounded-full hover:bg-[#17a84d] hover:scale-105 transition-all duration-300 shadow-lg shadow-[#1DB954]/30"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${FieldImg})`,
            transform: `translateY(${scrollY * 0.5}px)`,
            filter: 'brightness(0.4)'
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0e1a]/50 to-[#0a0e1a]" />

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          {/* Animated Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1DB954]/10 border border-[#1DB954]/30 rounded-full mb-8 backdrop-blur-sm animate-fade-in">
            <div className="w-2 h-2 bg-[#1DB954] rounded-full animate-pulse" />
            <span className="text-[#1DB954] text-sm font-bold uppercase tracking-wider">2025 Season Live</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight animate-slide-up">
            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Master Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#1DB954] to-[#17a84d] bg-clip-text text-transparent">
              Fantasy Draft
            </span>
          </h1>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
            AI-powered insights, real-time rankings, and advanced analytics to dominate your league
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Link
              to="/player-search"
              className="group relative px-8 py-4 bg-[#1DB954] text-black font-bold rounded-full overflow-hidden hover:scale-105 transition-all duration-300 shadow-2xl shadow-[#1DB954]/50"
            >
              <span className="relative z-10">Start Drafting Now</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#17a84d] to-[#1DB954] opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            <a
              href="#features"
              className="px-8 py-4 border-2 border-[#1DB954]/50 text-white font-bold rounded-full hover:bg-[#1DB954]/10 hover:border-[#1DB954] transition-all duration-300 backdrop-blur-sm"
            >
              Explore Features
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto">
            {[
              { value: '1000+', label: 'NFL Players' },
              { value: '50K+', label: 'Active Users' },
              { value: '99%', label: 'Accuracy' }
            ].map((stat, i) => (
              <div key={i} className="text-center group cursor-pointer">
                <div className="text-4xl font-black text-[#1DB954] group-hover:scale-110 transition-transform">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm uppercase tracking-wider mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-[#1DB954]/50 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-[#1DB954] rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-1.5 bg-[#1DB954]/10 border border-[#1DB954]/30 rounded-full mb-6">
              <span className="text-[#1DB954] text-sm font-bold uppercase tracking-wider">Why DraftZone</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Everything You Need to Win
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Powerful tools and insights that give you the competitive edge
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🏆',
                title: 'Real-Time Rankings',
                description: 'Live player rankings updated every minute with expert projections and injury reports',
                gradient: 'from-yellow-500/20 to-orange-500/20'
              },
              {
                icon: '📊',
                title: 'Advanced Analytics',
                description: 'Deep dive into player stats, trends, and matchup analysis powered by machine learning',
                gradient: 'from-blue-500/20 to-cyan-500/20'
              },
              {
                icon: '🧠',
                title: 'AI Draft Assistant',
                description: 'Get personalized recommendations based on your league settings and draft position',
                gradient: 'from-purple-500/20 to-pink-500/20'
              }
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative bg-gradient-to-br from-[#1a1f35] to-[#0f1524] p-8 rounded-3xl border border-gray-800 hover:border-[#1DB954]/50 transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden"
              >
                {/* Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                {/* Icon */}
                <div className="relative mb-6">
                  <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                </div>

                {/* Content */}
                <h3 className="relative text-2xl font-black mb-4 text-white group-hover:text-[#1DB954] transition-colors">
                  {feature.title}
                </h3>
                <p className="relative text-gray-400 leading-relaxed">
                  {feature.description}
                </p>

                {/* Arrow Icon */}
                <div className="relative mt-6 flex items-center gap-2 text-[#1DB954] opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm font-bold">Learn More</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative bg-gradient-to-br from-[#1DB954] to-[#17a84d] p-12 rounded-3xl overflow-hidden">
            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '40px 40px'
              }} />
            </div>

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black mb-6 text-black">
                Ready to Dominate Your Draft?
              </h2>
              <p className="text-xl text-black/80 mb-8 max-w-2xl mx-auto">
                Join thousands of fantasy managers who trust DraftZone
              </p>
              <Link
                to="/draft"
                className="inline-block px-10 py-4 bg-black text-white font-bold rounded-full hover:scale-105 transition-all duration-300 shadow-2xl"
              >
                Start Your Draft Legacy
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        .animate-slide-up {
          animation: slide-up 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}