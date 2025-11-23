import DraftLogo from "./assets/FFLogo.jpeg";
import FieldImg from "./assets/Field.jpeg";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="w-full overflow-hidden">

      {/* NAVBAR */}
      <nav className="bg-[#0f1f33]/95 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 border-b border-[#1DB954]/40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src={DraftLogo}
              className="h-12 w-12 rounded-full border border-[#1DB954]"
              alt="Fantasy Football Logo"
            />
            <span className="text-2xl font-bold tracking-wide text-[#1DB954]">
              DraftZone
            </span>
          </div>

          {/* Links */}
          <div className="hidden md:flex gap-8 text-gray-300 text-lg">
            <Link to="/" className="hover:text-white">Home</Link>
            <Link to="/player-search" className="hover:text-white">Players</Link>
            <a className="hover:text-white">Rankings</a>
            <a className="hover:text-white">Draft</a>
            <a className="hover:text-white">FAQ</a>
          </div>

        </div>
      </nav>

      {/* HERO SECTION */}
      <div
        className="h-[95vh] bg-cover bg-center flex flex-col justify-center items-center text-center px-4"
        style={{ backgroundImage: `url(${FieldImg})` }}
      >
        <h1 className="text-5xl md:text-7xl font-extrabold text-white drop-shadow-lg">
          Master Your Fantasy <br /> Football Draft
        </h1>

        <p className="mt-6 text-lg text-gray-200 max-w-2xl">
          Get expert insights, real-time rankings, and the tools you need to dominate your league.
        </p>

        <div className="mt-8 flex gap-6">
          <Link
            to="/player-search"
            className="px-8 py-3 bg-[#1DB954] text-black font-semibold rounded-full hover:bg-[#17a84d]"
          >
            Start Drafting
          </Link>

          <a
            className="px-8 py-3 border border-[#1DB954] text-[#1DB954] rounded-full hover:bg-[#1DB954] hover:text-black"
          >
            View Players
          </a>
        </div>
      </div>

      {/* FEATURES */}
      <section className="bg-[#0f1f33] py-20">
        <h2 className="text-4xl font-bold text-center">Why Choose DraftZone?</h2>
        <p className="text-center text-gray-300 mt-4">Everything you need to build a championship fantasy football team.</p>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto px-6">

          <div className="bg-[#16233b] p-8 rounded-2xl text-center">
            <div className="text-5xl mb-4">🏆</div>
            <h3 className="text-2xl font-bold mb-3">Rankings</h3>
            <p className="text-gray-300">Real-time expert rankings and projections.</p>
          </div>

          <div className="bg-[#16233b] p-8 rounded-2xl text-center">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-2xl font-bold mb-3">Analytics</h3>
            <p className="text-gray-300">Dive into trends and advanced metrics.</p>
          </div>

          <div className="bg-[#16233b] p-8 rounded-2xl text-center">
            <div className="text-5xl mb-4">🧠</div>
            <h3 className="text-2xl font-bold mb-3">Draft Assistant</h3>
            <p className="text-gray-300">Get personalized draft recommendations.</p>
          </div>

        </div>
      </section>

    </div>
  );
}
