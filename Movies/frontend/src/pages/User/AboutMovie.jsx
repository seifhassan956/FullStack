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
        if (!userProfile?.movies || !Array.isArray(userProfile.movies)) {
            return false;
        }
        return userProfile.movies.some(
            m => m.MovieID === movie_id && m.ListType === listType && m.mediaType === "movie"
        );
    };

    const handleToggleList = async (listType) => {
        if (!userProfile) {
            alert("Please log in to manage your lists");
            return;
        }

        try {
            if (isInList(listType)) {
                // Remove from list
                await removeMovieFromList({
                    MovieID: movie_id,
                    ListType: listType,
                    mediaType: "movie"
                }).unwrap();
            } else {
                // Add to list
                await addMovieToList({
                    title: movie.title,
                    MovieID: movie.id,
                    genre: movie.genres?.[0]?.name || "Unknown",
                    ListType: listType,
                    mediaType: "movie",
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
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#141414] text-white flex items-center justify-center font-bold">
            Error loading movie details.
        </div>
    );

    return (
        <div className="min-h-screen bg-[#141414] text-white font-sans pb-20">
            
            {/* HERO */}
            <div className="relative h-[60vh] md:h-[75vh] w-full">
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/20 to-transparent z-10" />
                
                <img 
                    src={`https://image.tmdb.org/t/p/original${movie?.backdrop_path}`} 
                    alt={movie?.title}
                    className="w-full h-full object-cover opacity-60"
                />

                <div className="absolute bottom-10 left-6 md:left-12 z-20 max-w-4xl">
                    <h1 className="text-5xl md:text-8xl font-black mb-4 uppercase tracking-tighter drop-shadow-2xl">
                        {movie?.title}
                    </h1>

                    <div className="flex items-center gap-4 text-lg font-bold">
                        <span className="text-green-400">
                            {Math.round(movie?.vote_average * 10)}% Match
                        </span>
                        <span>{movie?.release_date?.split('-')[0]}</span>
                        <span className="bg-white/10 px-2 py-0.5 rounded text-xs border border-white/20">
                            4K ULTRA HD
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

            {/* DETAILS */}
            <div className="px-6 md:px-12 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8 space-y-12">
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-gray-400 uppercase tracking-widest">
                            Synopsis
                        </h2>
                        <p className="text-xl md:text-2xl leading-relaxed font-light text-gray-200">
                            {movie?.overview}
                        </p>
                    </section>

                    {/* CAST */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6 text-gray-400 uppercase tracking-widest">
                            Top Cast
                        </h2>
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            {movie?.credits?.cast?.slice(0, 8).map(person => (
                                <div key={person.id} className="min-w-[120px] text-center">
                                    <img 
                                        src={person.profile_path 
                                            ? `${IMAGE_BASE_URL}${person.profile_path}` 
                                            : "https://via.placeholder.com/150x225?text=No+Photo"}
                                        className="w-full h-40 object-cover rounded-lg mb-2 border border-white/10"
                                        alt={person.name}
                                    />
                                    <p className="text-xs font-bold truncate">
                                        {person.name}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* SIDEBAR */}
                <div className="lg:col-span-4 bg-white/5 p-8 rounded-2xl border border-white/10 h-fit space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Budget</p>
                            <p>{formatCurrency(movie?.budget)}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Revenue</p>
                            <p className="text-green-400">{formatCurrency(movie?.revenue)}</p>
                        </div>
                    </div>

                    <div>
                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">Genres</p>
                        <div className="flex flex-wrap gap-2">
                            {movie?.genres?.map(g => (
                                <span key={g.id} className="text-[10px] bg-white/10 px-2 py-1 rounded-sm border border-white/10 uppercase">
                                    {g.name}
                                </span>
                            ))}
                        </div>
                    </div>

                    <a 
                        href={`https://www.imdb.com/title/${movie?.imdb_id}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="block w-full text-center bg-[#f5c518] text-black font-black py-3 rounded-lg"
                    >
                        IMDb
                    </a>
                </div>
            </div>

            {/* TRAILER */}
            {trailer && (
                <div className="px-6 md:px-12 mt-12">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl font-black mb-6">Official Trailer</h2>
                        <iframe
                            className="w-full aspect-video rounded-xl shadow-2xl"
                            src={`https://www.youtube.com/embed/${trailer.key}`}
                            allowFullScreen
                            title="trailer"
                        />
                    </div>
                </div>
            )}

            {/* COMMENTS */}
            <div className="px-6 md:px-12 mt-24">
                <div className="max-w-4xl">
                    <h2 className="text-3xl font-black mb-8">User Reviews</h2>
                    <Comments movieId={movie_id} />
                </div>
            </div>

        </div>
    );
};

export default AboutMovie;