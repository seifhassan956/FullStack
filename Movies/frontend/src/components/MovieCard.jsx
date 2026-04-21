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
    <Link to={linkPath} className="block">
      <div className="relative group p-1 cursor-pointer">
        <div className="relative overflow-hidden rounded-md shadow-2xl bg-[#181818] transition-all duration-300">
          
          <img
            src={
              movie.poster_path
                ? `${IMAGE_BASE_URL}${movie.poster_path}`
                : "https://via.placeholder.com/500x750?text=No+Image"
            }
            alt={title}
            className="w-full aspect-[2/3] object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* OVERLAY */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <h3 className="text-white text-sm font-bold truncate">
              {title}
            </h3>

            <div className="flex items-center mt-1">
              <span className="text-green-400 text-xs font-bold mr-2">
                {Math.round(movie.vote_average * 10)}% Match
              </span>

              <span className="text-gray-300 text-[10px] border border-gray-500 px-1 uppercase">
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