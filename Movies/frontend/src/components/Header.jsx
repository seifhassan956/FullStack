import React, { useState } from 'react';
import { useGetNewMoviesQuery, useGetTopSeriesQuery } from '../redux/api/themoviedb.js';
import { Link } from 'react-router-dom';
import { AiOutlineSearch } from 'react-icons/ai';
import MovieSlider from './Slider.jsx';
import User from './User.jsx';
import { useSelector } from 'react-redux';

const Header = ({ activeType, setActiveType }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const { userInfo } = useSelector((state) => state.auth);

  const movieRequest = useGetNewMoviesQuery(undefined, { skip: activeType !== "movie" });
  const seriesRequest = useGetTopSeriesQuery(undefined, { skip: activeType !== "tv" });

  const currentRequest = activeType === "movie" ? movieRequest : seriesRequest;
  const { data, isLoading } = currentRequest;

  const featuredContent = Array.isArray(data) ? data.slice(0, 6) : [];

  return (
    <header className="relative w-full h-[60vh] md:h-[80vh] bg-[#141414]">

      {/* NAVBAR */}
      <nav className="absolute top-0 left-0 w-full z-50 bg-gradient-to-b from-black/90 via-black/40 to-transparent px-4 py-3 md:p-6">
        <div className="container mx-auto flex justify-between items-center">

          {/* LEFT: Logo & Switcher */}
          <div className="flex items-center gap-3 md:gap-6">
            <Link
              to="/"
              className="text-[#E50914] text-xl md:text-3xl font-black tracking-tighter shrink-0"
            >
              SEIFMOVIES
            </Link>

            <div className="flex bg-black/60 backdrop-blur-md border border-white/10 rounded-full p-1 shadow-xl">
              <button
                onClick={() => setActiveType("movie")}
                className={`px-3 md:px-5 py-1 rounded-full text-[9px] md:text-xs font-bold transition-all uppercase tracking-wider ${activeType === "movie"
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                    : "text-gray-400 hover:text-white"
                  }`}
              >
                Movies
              </button>

              <button
                onClick={() => setActiveType("tv")}
                className={`px-3 md:px-5 py-1 rounded-full text-[9px] md:text-xs font-bold transition-all uppercase tracking-wider ${activeType === "tv"
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                    : "text-gray-400 hover:text-white"
                  }`}
              >
                Series
              </button>
            </div>
          </div>

          {/* RIGHT: Search, List, User */}
          <div className="flex items-center gap-3 md:gap-8">

            {/* Search - Icon only on mobile */}
            <Link
              to="/search"
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors p-1"
            >
              <AiOutlineSearch size={22} className="md:size-5" />
              <span className="text-xs font-bold uppercase hidden lg:inline">
                Search
              </span>
            </Link>

            {/* My List - Hidden on very small screens, visible from md up */}
            {userInfo && (
              <Link
                to="/my-list"
                className="text-white/80 hover:text-white transition-colors text-[10px] md:text-sm font-bold uppercase hidden sm:inline"
              >
                My List
              </Link>
            )}

            {/* User Dropdown - Simplified container */}
            <div className="relative shrink-0">
              <User
                dropdownOpen={dropdownOpen}
                toggleDropdown={toggleDropdown}
              />
            </div>
          </div>

        </div>
      </nav>

      {/* HERO */}
      <div className="w-full h-full">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-red-600"></div>
          </div>
        ) : (
          <MovieSlider
            key={activeType}
            data={featuredContent}
            isHero={true}
          />
        )}
      </div>

      <div className="absolute bottom-0 left-0 w-full h-32 md:h-40 bg-gradient-to-t from-[#141414] to-transparent" />
    </header>
  );
};

export default Header;