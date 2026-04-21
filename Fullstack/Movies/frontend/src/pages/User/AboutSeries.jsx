import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetSeriesDetailsQuery } from '../../redux/api/themoviedb.js';
import { 
    useAddMovieToListMutation, 
    useRemoveMovieFromListMutation,
    useGetProfileQuery 
} from '../../redux/api/users.js';
import { Plus, Heart, Check } from "lucide-react";

const IMG = "https://image.tmdb.org/t/p";

const AboutSeries = () => {
  const { id } = useParams();
  const series_id = Number(id);
  
  const { data, isLoading, error } = useGetSeriesDetailsQuery(series_id);
  const { data: userProfile, refetch: refetchProfile } = useGetProfileQuery();
  
  const [addMovieToList, { isLoading: adding }] = useAddMovieToListMutation();
  const [removeMovieFromList, { isLoading: removing }] = useRemoveMovieFromListMutation();

  // 1. Extract Basic Info
  const title = data?.name;
  const releaseYear = data?.first_air_date?.split("-")[0];
  const lastAirYear = data?.last_air_date?.split("-")[0];
  const rating = Math.round((data?.vote_average || 0) * 10);

  // 2. Find Trailer (YouTube)
  const trailer = data?.videos?.results?.find(
    (vid) => vid.site === "YouTube" && (vid.type === "Trailer" || vid.type === "Teaser")
  );

  // 3. Extract Top Cast (Limit to 10)
  const cast = data?.credits?.cast?.slice(0, 10);

  // 4. Check if series is in a specific list
  const isInList = (listType) => {
    if (!userProfile?.movies || !Array.isArray(userProfile.movies)) {
      return false;
    }
    return userProfile.movies.some(
      m => m.MovieID === series_id && m.ListType === listType && m.mediaType === "series"
    );
  };

  // 5. Toggle handler - adds or removes based on current state
  const handleToggleList = async (listType) => {
    if (!userProfile) {
      alert("Please log in to manage your lists");
      return;
    }

    try {
      if (isInList(listType)) {
        // Remove from list
        await removeMovieFromList({
          MovieID: series_id,
          ListType: listType,
          mediaType: "series"
        }).unwrap();
      } else {
        // Add to list
        await addMovieToList({
          title: data.name,
          MovieID: data.id,
          genre: data.genres?.[0]?.name || "Unknown",
          ListType: listType,
          mediaType: "series",
          poster_path: data.poster_path
        }).unwrap();
      }
      
      // Refresh profile to update button states
      await refetchProfile();
    } catch (err) {
      console.error("List operation failed:", err);
      alert(err?.data?.message || err?.message || "Action failed");
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#141414] flex justify-center items-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-red-600"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#141414] text-white flex items-center justify-center">
      Error loading series details.
    </div>
  );

  return (
    <div className="min-h-screen bg-[#141414] text-white font-sans pb-20">
      
      {/* HERO SECTION WITH VIDEO OR BACKDROP */}
      <div className="relative h-[80vh] w-full bg-black">
        {trailer ? (
          <div className="absolute inset-0 w-full h-full">
            <iframe
              className="w-full h-full object-cover opacity-60"
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailer.key}`}
              title="Trailer"
              allow="autoplay; encrypted-media"
              frameBorder="0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
          </div>
        ) : (
          <>
            <img
              src={`${IMG}/original${data?.backdrop_path}`}
              alt={title}
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
          </>
        )}

        <div className="absolute bottom-10 left-6 md:left-12 z-20 max-w-4xl">
          <p className="text-red-600 font-bold tracking-[0.3em] mb-2 uppercase text-sm">Series</p>
          <h1 className="text-5xl md:text-8xl font-black mb-4 uppercase tracking-tighter drop-shadow-2xl">
            {title}
          </h1>
          <div className="flex items-center gap-4 text-lg font-bold mb-6">
            <span className="text-green-400">{rating}% Match</span>
            <span>{releaseYear} - {data?.status === "Ended" ? lastAirYear : "Present"}</span>
            <span className="bg-white/10 px-2 py-0.5 rounded text-xs border border-white/20">
              {data?.number_of_seasons} Seasons
            </span>
          </div>

          {/* TOGGLE BUTTONS WITH STATE */}
          <div className="flex gap-4 mt-6">
            {/* WATCH LATER */}
            <button
              onClick={() => handleToggleList("watchLater")}
              disabled={adding || removing}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg border transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                isInList("watchLater")
                  ? "bg-white text-black border-white"
                  : "bg-white/10 hover:bg-white/20 border-white/20"
              }`}
            >
              {isInList("watchLater") ? <Check size={18} /> : <Plus size={18} />}
              {isInList("watchLater") ? "In Watch Later" : "Watch Later"}
            </button>

            {/* FAVOURITE */}
            <button
              onClick={() => handleToggleList("favourite")}
              disabled={adding || removing}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                isInList("favourite")
                  ? "bg-red-600 text-white"
                  : "bg-red-600/80 hover:bg-red-600 border border-transparent"
              }`}
            >
              <Heart 
                size={18} 
                fill={isInList("favourite") ? "white" : "transparent"}
              />
              {isInList("favourite") ? "Favourited" : "Favourite"}
            </button>

            {/* WATCHED */}
            <button
              onClick={() => handleToggleList("watched")}
              disabled={adding || removing}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                isInList("watched")
                  ? "bg-green-600 text-white"
                  : "bg-green-600/80 hover:bg-green-600 border border-transparent"
              }`}
            >
              {isInList("watched") ? <Check size={18} /> : <Plus size={18} />}
              {isInList("watched") ? "Watched" : "Mark as Watched"}
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-12 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* LEFT COLUMN: Synopsis, Cast, Seasons */}
        <div className="lg:col-span-8 space-y-12">
          
          <section>
            <h2 className="text-xl font-bold mb-4 text-gray-500 uppercase tracking-widest border-b border-white/10 pb-2">Synopsis</h2>
            <p className="text-xl md:text-2xl leading-relaxed font-light text-gray-200 italic mb-4">
              "{data?.tagline}"
            </p>
            <p className="text-lg leading-relaxed text-gray-300">
              {data?.overview}
            </p>
          </section>

          {/* CAST SECTION */}
          <section>
            <h2 className="text-xl font-bold mb-6 text-gray-500 uppercase tracking-widest border-b border-white/10 pb-2">Top Cast</h2>
            <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
              {cast?.map(person => (
                <div key={person.id} className="min-w-[120px] text-center">
                  <img
                    src={
                      person.profile_path
                        ? `${IMG}/w185${person.profile_path}`
                        : "https://via.placeholder.com/185x278?text=No+Image"
                    }
                    className="w-full aspect-square object-cover rounded-full border-2 border-white/10 mb-2"
                    alt={person.name}
                  />
                  <p className="text-xs font-bold truncate w-24 mx-auto">{person.name}</p>
                  <p className="text-[10px] text-gray-500 truncate w-24 mx-auto">{person.character}</p>
                </div>
              ))}
            </div>
          </section>

          {/* SEASONS SECTION */}
          <section>
            <h2 className="text-xl font-bold mb-6 text-gray-500 uppercase tracking-widest border-b border-white/10 pb-2">Seasons</h2>
            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
              {data?.seasons?.map(season => (
                <div key={season.id} className="min-w-[160px] group cursor-pointer">
                  <div className="relative overflow-hidden rounded-lg mb-3">
                    <img
                      src={
                        season.poster_path
                          ? `${IMG}/w342${season.poster_path}`
                          : "https://via.placeholder.com/342x513?text=No+Poster"
                      }
                      alt={season.name}
                      className="w-full h-60 object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <h3 className="font-bold text-sm">{season.name}</h3>
                  <p className="text-xs text-gray-500">{season.episode_count} Episodes</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Sidebar Stats */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white/5 p-8 rounded-2xl border border-white/10 space-y-6">
            
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-bold mb-2 tracking-widest">Created By</p>
              <div className="flex flex-wrap gap-2 text-sm">
                {data?.created_by?.length > 0
                  ? data.created_by.map(c => c.name).join(", ")
                  : "Information Unavailable"}
              </div>
            </div>

            <div>
              <p className="text-[10px] text-gray-500 uppercase font-bold mb-2 tracking-widest">Network</p>
              <div className="flex items-center gap-3">
                {data?.networks?.[0]?.logo_path && (
                  <img
                    src={`${IMG}/w92${data.networks[0].logo_path}`}
                    alt="network"
                    className="h-6 brightness-200"
                  />
                )}
                <span className="text-sm font-medium">{data?.networks?.[0]?.name}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold">Status</p>
                <p className="text-sm">{data?.status}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold">Total Episodes</p>
                <p className="text-sm">{data?.number_of_episodes}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] text-gray-500 uppercase font-bold mb-2 tracking-widest">Genres</p>
              <div className="flex flex-wrap gap-2">
                {data?.genres?.map(g => (
                  <span key={g.id} className="text-[10px] bg-white/10 px-2 py-1 rounded-sm border border-white/10 uppercase">
                    {g.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutSeries;