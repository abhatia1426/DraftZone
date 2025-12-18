import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DraftLogo from './assets/FFLogo.jpeg';

export default function Authors() {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const authors = [
    {
      name: "Neel Rajan",
      role: "Data Science Lead",
      email: "neel9033@iastate.edu",
      img: "data:image/jpeg;base64,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",
      bio: "Data science major at ISU with a passion for creating intuitive user interfaces and leveraging machine learning to solve real-world problems. When not coding, you'll find me in the pool or dominating in video games.",
      skills: ["Data Science", "Machine Learning", "UI/UX", "Data Viz"]
    },
    {
      name: "Aadi Bhatia",
      role: "Software Engineer",
      email: "aadi2005@iastate.edu",
      img: "data:image/jpeg;base64,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",
      bio: "Computer Science major at ISU specializing in full-stack development and API design. Football enthusiast both on and off the field, combining my love for the game with cutting-edge technology.",
      skills: ["Software Dev", "APIs", "UI Design", "React"]
    }
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0a1628] via-[#0f1f33] to-[#0a1628] text-white relative overflow-hidden">
      
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#1DB954] rounded-full blur-[120px] opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#1DB954] rounded-full blur-[120px] opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-[#1DB954] rounded-full blur-[120px] opacity-10 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* NAVBAR */}
      <nav 
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrollY > 50 ? 'rgba(10, 14, 26, 0.95)' : 'transparent',
          backdropFilter: scrollY > 50 ? 'blur(12px)' : 'none'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={DraftLogo}
              className="h-12 w-12 rounded-full ring-2 ring-[#1DB954]/30"
              alt="Fantasy Football Logo"
            />
            <span className="text-2xl font-bold tracking-wide">
              <span className="text-white">DRAFT</span>
              <span className="text-[#1DB954]">ZONE</span>
            </span>
          </Link>

          <div className="hidden md:flex gap-8 text-gray-400 text-sm font-semibold tracking-wider">
            <Link to="/" className="hover:text-[#1DB954] transition-colors">HOME</Link>
            <Link to="/player-search" className="hover:text-[#1DB954] transition-colors">PLAYERS</Link>
            <Link to="/draft" className="hover:text-[#1DB954] transition-colors">DRAFT</Link>
            <Link to="/odds" className="hover:text-[#1DB954] transition-colors">ODDS</Link>
            <Link to="/login" className="hover:text-[#1DB954] transition-colors">LOGIN & SIGNUP</Link>
          </div>
        </div>
      </nav>

      <div className="pt-32 px-6 md:px-10 max-w-7xl mx-auto pb-20 relative z-10">

        {/* Enhanced Header */}
        <div className="mb-12 text-center">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-[#1DB954]/20 rounded-full text-[#1DB954] text-sm font-bold border border-[#1DB954]/30">
              👥 MEET THE TEAM
            </span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black mb-4 bg-gradient-to-r from-white via-[#1DB954] to-white bg-clip-text text-transparent">
            Built by Fantasy Enthusiasts
          </h1>
          <p className="text-gray-400 text-xl">The passionate developers behind your ultimate fantasy football companion</p>
        </div>

        {/* AUTHORS GRID */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {authors.map((author, index) => (
            <div
              key={index}
              className="group relative overflow-hidden"
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Glowing border effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#1DB954]/0 via-[#1DB954]/50 to-[#1DB954]/0 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative bg-gradient-to-br from-[#111318]/90 to-[#16233b]/90 backdrop-blur-xl p-8 rounded-3xl border border-[#1DB954]/20 hover:border-[#1DB954]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#1DB954]/30 hover:-translate-y-2">
                
                {/* HEADER WITH IMAGE */}
                <div className="flex items-start gap-6 mb-6 pb-6 border-b border-[#1DB954]/20">
                  {/* Profile Image */}
                  <div className="relative group/img flex-shrink-0">
                    <div className="absolute inset-0 bg-[#1DB954] blur-2xl opacity-30 group-hover/img:opacity-50 transition-opacity"></div>
                    <img 
                      src={author.img}
                      alt={author.name}
                      className="relative h-24 w-24 rounded-2xl border-2 border-[#1DB954]/50 bg-gradient-to-br from-white/10 to-white/5 object-cover backdrop-blur-sm shadow-xl transition-transform group-hover/img:scale-110" 
                    />
                  </div>

                  {/* Name & Role */}
                  <div className="flex-1 pt-2">
                    <h3 className="text-3xl font-black text-white leading-tight mb-2 group-hover:text-[#1DB954] transition-colors">
                      {author.name}
                    </h3>
                    <p className="text-[#1DB954] font-bold text-sm uppercase tracking-wider">
                      {author.role}
                    </p>
                  </div>
                </div>

                {/* BIO */}
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  {author.bio}
                </p>

                {/* SKILLS */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 rounded-full bg-[#1DB954] shadow-lg shadow-[#1DB954]/50"></div>
                    <p className="text-white font-black text-lg tracking-wide">SKILLS</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {author.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-gradient-to-br from-[#1DB954]/10 to-[#1DB954]/5 hover:from-[#1DB954]/20 hover:to-[#1DB954]/10 text-white text-xs font-bold rounded-xl transition-all duration-300 cursor-default border border-[#1DB954]/30 hover:border-[#1DB954]/60 hover:scale-105 hover:shadow-lg hover:shadow-[#1DB954]/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CONTACT SECTION */}
                <div>
                  {/* Email Button */}
                  <a
                    href={`mailto:${author.email}`}
                    className="group/btn flex items-center justify-center gap-3 w-full py-4 bg-gradient-to-br from-[#1DB954]/10 to-[#1DB954]/5 hover:from-[#1DB954]/20 hover:to-[#1DB954]/10 border border-[#1DB954]/30 hover:border-[#1DB954]/60 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#1DB954]/20"
                  >
                    <svg className="w-5 h-5 text-gray-400 group-hover/btn:text-[#1DB954] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-white font-bold text-sm">{author.email}</span>
                  </a>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* CTA SECTION */}
        <div className="relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1DB954]/0 via-[#1DB954]/50 to-[#1DB954]/0 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative bg-gradient-to-br from-[#1DB954] to-[#17a84d] p-12 rounded-3xl overflow-hidden">
            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-10">
              <div 
                className="absolute inset-0"
                style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                  backgroundSize: '40px 40px'
                }}
              />
            </div>

            <div className="relative z-10 text-center">
              <h2 className="text-4xl md:text-5xl font-black mb-4 text-black">
                Ready to Elevate Your Draft?
              </h2>
              <p className="text-lg text-black/80 mb-8 max-w-2xl mx-auto">
                Join us in revolutionizing fantasy football with data-driven insights and cutting-edge technology
              </p>
              <Link
                to="/draft"
                className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white font-bold rounded-full hover:scale-105 transition-all duration-300 shadow-2xl"
              >
                Start Drafting
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="relative py-8 px-6 border-t border-[#1DB954]/20">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400 text-sm">
            © 2025 DraftZone | Construction of User Interfaces, Fall 2025, COMS 3190
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Built with passion by Neel Rajan & Aadi Bhatia at Iowa State University
          </p>
        </div>
      </footer>
    </div>
  );
}