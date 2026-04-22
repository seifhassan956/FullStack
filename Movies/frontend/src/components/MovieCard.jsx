import React from 'react';
import { IMAGE_BASE_URL } from '../redux/constants.js';
import { Link } from 'react-router-dom';

const MovieCard = ({ movie, type = "movie" }) => {
  const title = movie.title || movie.name;

  const year =
    movie.release_date?.split('-')[0] ||
    movie.first_air_date?.split('-')[0];

  const isTV = type === "tv" || !!movie.first_air_date;

  const linkPath = isTV ? `/tv/${movie.id}` : `/movie/${movie.id}`;

  return (
    <Link to={linkPath} className="block active:scale-[0.98] transition-transform">
      
      <div className="relative group p-1 cursor-pointer">

        <div className="relative overflow-hidden rounded-md shadow-xl bg-[#181818]">

          {/* IMAGE */}
          <img
            src={
              movie.poster_path
                ? `${IMAGE_BASE_URL}${movie.poster_path}`
                : "https://via.placeholder.com/500x750?text=No+Image"
            }
            alt={title}
            className="w-full aspect-[2/3] object-cover transition-transform duration-500 group-active:scale-105 md:group-hover:scale-110"
          />

          {/* OVERLAY (always visible lightly on mobile, hover on desktop) */}
          <div className="
            absolute inset-0 
            bg-gradient-to-t from-black/90 via-black/30 to-transparent 
            flex flex-col justify-end p-2 sm:p-3 md:p-4
            opacity-100 md:opacity-0 md:group-hover:opacity-100
            transition-opacity duration-300
          ">

            {/* TITLE */}
            <h3 className="text-white text-xs sm:text-sm font-bold truncate">
              {title}
            </h3>

            {/* META */}
            <div className="flex items-center mt-1 gap-2">

              <span className="text-green-400 text-[10px] sm:text-xs font-bold">
                {Math.round(movie.vote_average * 10)}%
              </span>

              <span className="text-gray-300 text-[10px] border border-gray-600 px-1 rounded uppercase">
                {year || "N/A"}
              </span>

            </div>
          </div>

        </div>

      </div>
    </Link>
  );
};

export default MovieCard;