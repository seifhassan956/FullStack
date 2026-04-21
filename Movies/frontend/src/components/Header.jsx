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

  // 🔐 Auth state
  const { userInfo } = useSelector((state) => state.auth);

  // Data fetching logic
  const movieRequest = useGetNewMoviesQuery(undefined, { skip: activeType !== "movie" });
  const seriesRequest = useGetTopSeriesQuery(undefined, { skip: activeType !== "tv" });

  const currentRequest = activeType === "movie" ? movieRequest : seriesRequest;
  const { data, isLoading } = currentRequest;

  const featuredContent = Array.isArray(data) ? data.slice(0, 6) : [];

  return (
    <header className="relative w-full h-[80vh] bg-[#141414]">
      
      <nav className="absolute top-0 left-0 w-full z-50 bg-gradient-to-b from-black/90 to-transparent p-6">
        <div className="container mx-auto flex justify-between items-center">

          {/* LEFT */}
          <div className="flex items-center space-x-10">
            <Link to="/" className="text-[#E50914] text-3xl font-black tracking-tighter">
              SEIFMovies
            </Link>

            <div className="flex bg-black/40 border border-gray-700 rounded-full p-1">
              <button
                onClick={() => setActiveType("movie")}
                className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${
                  activeType === "movie" ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                MOVIES
              </button>

              <button
                onClick={() => setActiveType("tv")}
                className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${
                  activeType === "tv" ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                SERIES
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center space-x-8">

            {/* Search */}
            <Link
              to="/search"
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <AiOutlineSearch size={22} />
              <span className="text-sm font-bold uppercase hidden md:inline">
                Search
              </span>
            </Link>

            {/* ⭐ My List (ONLY if logged in) */}
            {userInfo && (
              <Link
                to="/my-list"
                className="text-white/80 hover:text-white transition-colors text-sm font-bold uppercase hidden md:inline"
              >
                My List
              </Link>
            )}

            {/* User Dropdown */}
            <User 
              dropdownOpen={dropdownOpen} 
              toggleDropdown={toggleDropdown} 
            />
          </div>

        </div>
      </nav>

      {/* HERO */}
      <div className="w-full h-full">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div>
          </div>
        ) : (
          <MovieSlider
            key={activeType}
            data={featuredContent}
            isHero={true}
          />
        )}
      </div>

      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#141414] to-transparent" />
    </header>
  );
};

export default Header;