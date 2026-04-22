import React from 'react';
import { useParams } from 'react-router-dom';
import {
  useGetMovieDetailsQuery,
} from '../../redux/api/themoviedb.js';

import {
  useAddMovieToListMutation,
  useRemoveMovieFromListMutation,
  useGetProfileQuery
} from '../../redux/api/users.js';

import { IMAGE_BASE_URL } from '../../redux/constants.js';
import Comments from '../../components/Comments.jsx';
import { Plus, Heart, Check } from "lucide-react";

const AboutMovie = () => {
  const { id } = useParams();
  const movie_id = Number(id);

  const { data: movie, isLoading, error } = useGetMovieDetailsQuery(movie_id);
  const { data: userProfile, refetch: refetchProfile } = useGetProfileQuery();

  const [addMovieToList, { isLoading: adding }] = useAddMovieToListMutation();
  const [removeMovieFromList, { isLoading: removing }] = useRemoveMovieFromListMutation();

  const trailer = movie?.videos?.results?.find(
    vid => vid.type === "Trailer" && vid.site === "YouTube"
  );

  const formatCurrency = (amount) =>
    amount > 0
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0
        }).format(amount)
      : "N/A";

  const isInList = (listType) => {
    if (!userProfile?.movies || !Array.isArray(userProfile.movies)) return false;

    return userProfile.movies.some(
      m => m.MovieID === movie_id &&
           m.ListType === listType &&
           m.mediaType === "movie"
    );
  };

  const handleToggleList = async (listType) => {
    if (!userProfile) {
      alert("Please log in to manage your lists");
      return;
    }

    try {
      if (isInList(listType)) {
        await removeMovieFromList({
          MovieID: movie_id,
          ListType: listType,
          mediaType: "movie"
        }).unwrap();
      } else {
        await addMovieToList({
          title: movie.title,
          MovieID: movie.id,
          genre: movie.genres?.[0]?.name || "Unknown",
          ListType: listType,
          mediaType: "movie",
        }).unwrap();
      }

      await refetchProfile();
    } catch (err) {
      console.error(err);
      alert(err?.data?.message || "Action failed");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="animate-spin h-14 w-14 border-2 border-red-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#141414] text-white flex items-center justify-center">
        Error loading movie details
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white font-sans pb-16 overflow-x-hidden">

      {/* HERO */}
      <div className="relative h-[55vh] md:h-[75vh] w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-black/40 to-transparent z-10" />

        <img
          src={`https://image.tmdb.org/t/p/original${movie?.backdrop_path}`}
          alt={movie?.title}
          className="w-full h-full object-cover opacity-60"
        />

        <div className="absolute bottom-6 md:bottom-10 left-4 md:left-12 z-20 max-w-4xl pr-4">

        <h1 className="text-xl sm:text-3xl md:text-5xl lg:text-6xl font-black uppercase leading-tight">
            {movie?.title}
        </h1>

          <div className="flex flex-wrap gap-3 mt-2 text-sm md:text-lg font-bold">
            <span className="text-green-400">
              {Math.round(movie?.vote_average * 10)}% Match
            </span>
            <span>{movie?.release_date?.split('-')[0]}</span>
            <span className="bg-white/10 px-2 py-0.5 rounded text-xs">
              4K ULTRA HD
            </span>
          </div>

          {/* BUTTONS */}
          <div className="flex flex-wrap gap-3 mt-4">

            <button
              onClick={() => handleToggleList("watchLater")}
              disabled={adding || removing}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition ${
                isInList("watchLater")
                  ? "bg-white text-black"
                  : "bg-white/10 hover:bg-white/20 border-white/20"
              }`}
            >
              {isInList("watchLater") ? <Check size={16} /> : <Plus size={16} />}
              Watch Later
            </button>

            <button
              onClick={() => handleToggleList("favourite")}
              disabled={adding || removing}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${
                isInList("favourite")
                  ? "bg-red-600"
                  : "bg-red-600/80 hover:bg-red-600"
              }`}
            >
              <Heart
                size={16}
                fill={isInList("favourite") ? "white" : "transparent"}
              />
              Favourite
            </button>

            <button
              onClick={() => handleToggleList("watched")}
              disabled={adding || removing}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${
                isInList("watched")
                  ? "bg-green-600"
                  : "bg-green-600/80 hover:bg-green-600"
              }`}
            >
              {isInList("watched") ? <Check size={16} /> : <Plus size={16} />}
              Watched
            </button>

          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-4 md:px-12 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* LEFT */}
        <div className="lg:col-span-8 space-y-10">

          <section>
            <h2 className="text-xl md:text-2xl font-bold text-gray-400 uppercase mb-3">
              Synopsis
            </h2>
            <p className="text-base md:text-xl leading-relaxed text-gray-200">
              {movie?.overview}
            </p>
          </section>

          {/* CAST */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-gray-400 uppercase mb-4">
              Top Cast
            </h2>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {movie?.credits?.cast?.slice(0, 8).map(person => (
                <div key={person.id} className="min-w-[90px] sm:min-w-[120px] text-center">

                  <img
                    src={person.profile_path
                      ? `${IMAGE_BASE_URL}${person.profile_path}`
                      : "https://via.placeholder.com/150x225?text=No+Photo"}
                    className="w-full h-28 sm:h-40 object-cover rounded-lg"
                    alt={person.name}
                  />

                  <p className="text-[10px] sm:text-xs mt-1 truncate">
                    {person.name}
                  </p>

                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-4 bg-white/5 p-5 md:p-8 rounded-2xl border border-white/10 space-y-6">

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[10px] text-gray-500 uppercase">Budget</p>
              <p>{formatCurrency(movie?.budget)}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase">Revenue</p>
              <p className="text-green-400">{formatCurrency(movie?.revenue)}</p>
            </div>
          </div>

          <div>
            <p className="text-[10px] text-gray-500 uppercase mb-2">Genres</p>
            <div className="flex flex-wrap gap-2">
              {movie?.genres?.map(g => (
                <span
                  key={g.id}
                  className="text-[10px] bg-white/10 px-2 py-1 rounded"
                >
                  {g.name}
                </span>
              ))}
            </div>
          </div>

          <a
            href={`https://www.imdb.com/title/${movie?.imdb_id}`}
            target="_blank"
            rel="noreferrer"
            className="block text-center bg-[#f5c518] text-black font-bold py-2 rounded-lg"
          >
            IMDb
          </a>

        </div>
      </div>

      {/* TRAILER */}
      {trailer && (
        <div className="px-4 md:px-12 mt-10">
          <h2 className="text-xl md:text-3xl font-black mb-4">
            Official Trailer
          </h2>

          <iframe
            className="w-full aspect-video rounded-xl"
            src={`https://www.youtube.com/embed/${trailer.key}`}
            allowFullScreen
            title="trailer"
          />
        </div>
      )}

      {/* COMMENTS */}
      <div className="px-4 md:px-12 mt-16">
        <h2 className="text-xl md:text-3xl font-black mb-6">
          User Reviews
        </h2>
        <Comments movieId={movie_id} />
      </div>

    </div>
  );
};

export default AboutMovie;