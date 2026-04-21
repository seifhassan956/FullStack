import React, { useState, useEffect } from 'react';
import { useGetProfileQuery } from '../../redux/api/users';
import { useGetMovieDetailsQuery, useGetSeriesDetailsQuery } from '../../redux/api/themoviedb.js';
import { Heart, Clock, CheckCircle, Film, Tv } from 'lucide-react';
import MovieSlider from '../../components/Slider';
import MovieCard from '../../components/MovieCard';

// ─── COMPONENT: FETCHES FRESH DATA FOR ALL FAVORITES ────────────────────
const HeroSliderWithApi = ({ favorites, type }) => {
    const isTv = type === "tv";
    
    // Fetch details for all favorites
    const queries = favorites.map(fav => {
        if (isTv) {
            return useGetSeriesDetailsQuery(fav.MovieID);
        } else {
            return useGetMovieDetailsQuery(fav.MovieID);
        }
    });

    // Check if any are still loading
    const isLoading = queries.some(q => q.isLoading);
    
    if (isLoading) return <div className="h-[50vh] md:h-[70vh] bg-[#1a1a1a] animate-pulse" />;

    // Map all successfully loaded details
    const sliderData = queries
        .filter(q => q.data)
        .map(q => ({
            id: q.data.id,
            title: q.data.title || q.data.name,
            backdrop_path: q.data.backdrop_path,
            overview: q.data.overview,
        }));

    if (sliderData.length === 0) return null;

    return (
        <div className="relative h-[50vh] md:h-[70vh] mb-10">
            <MovieSlider data={sliderData} isHero={true} />
            <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[#141414] to-transparent" />
        </div>
    );
};

// ─── COMPONENT: FETCHES FRESH POSTER FOR THE GRID ────────────────────
const MovieCardWithApi = ({ movieID, type }) => {
    const isTv = type === "tv";
    const { data: details, isLoading } = isTv 
        ? useGetSeriesDetailsQuery(movieID) 
        : useGetMovieDetailsQuery(movieID);

    if (isLoading) return <div className="aspect-[2/3] bg-white/5 animate-pulse rounded-md" />;
    if (!details) return null;

    return (
        <MovieCard 
            type={type} 
            movie={{
                id: details.id,
                title: details.title || details.name,
                poster_path: details.poster_path,
                vote_average: details.vote_average,
                release_date: details.release_date || details.first_air_date
            }} 
        />
    );
};

const MyList = () => {
    const { data: userInfo, isLoading } = useGetProfileQuery();
    const [activeType, setActiveType] = useState(() => localStorage.getItem("activeType_list") || "movie");

    useEffect(() => {
        localStorage.setItem("activeType_list", activeType);
    }, [activeType]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#141414] flex justify-center items-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div>
            </div>
        );
    }

    const allItems = userInfo?.movies || [];
    const filteredByMediaType = allItems.filter(m => m.mediaType === activeType);

    const favorites = filteredByMediaType.filter(m => m.ListType === "favourite");
    const watchLater = filteredByMediaType.filter(m => m.ListType === "watchLater");
    const watched = filteredByMediaType.filter(m => m.ListType === "watched");

    const MovieSection = ({ title, data, icon: Icon, color }) => (
        <section className="mb-14">
            <div className="flex items-center gap-3 mb-6">
                <Icon className={color} size={26} />
                <h2 className="text-2xl font-bold uppercase tracking-tight">{title}</h2>
                <span className="bg-white/10 px-3 py-1 rounded-full text-xs text-gray-400">{data.length}</span>
            </div>
            {data.length === 0 ? (
                <div className="py-10 border border-dashed border-white/10 rounded-xl text-center text-gray-500 italic">
                    No {activeType === "movie" ? "movies" : "series"} found
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {data.map((item) => (
                        <MovieCardWithApi 
                            key={item._id} 
                            movieID={item.MovieID} 
                            type={activeType === "series" ? "tv" : "movie"} 
                        />
                    ))}
                </div>
            )}
        </section>
    );

    return (
        <div className="min-h-screen bg-[#141414] text-white">
            {/* HERO SECTION - Shows ALL favorites in rotating slider */}
            {favorites.length > 0 && (
                <HeroSliderWithApi 
                    favorites={favorites}
                    type={activeType === "series" ? "tv" : "movie"} 
                />
            )}

            <div className="p-6 md:p-12">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-5xl md:text-7xl font-black mb-2 tracking-tighter uppercase">My Library</h1>
                        <p className="text-gray-500 font-medium italic">Your personalized collection.</p>
                    </div>

                    <div className="flex bg-white/5 p-1 rounded-full border border-white/10 w-fit">
                        <button onClick={() => setActiveType("movie")} className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${activeType === "movie" ? "bg-red-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}>
                            <Film size={16} /> Movies
                        </button>
                        <button onClick={() => setActiveType("series")} className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${activeType === "series" ? "bg-red-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}>
                            <Tv size={16} /> Series
                        </button>
                    </div>
                </header>

                <MovieSection title="Favourites" data={favorites} icon={Heart} color="text-red-500" />
                <MovieSection title="Watch Later" data={watchLater} icon={Clock} color="text-blue-500" />
                <MovieSection title="Watch History" data={watched} icon={CheckCircle} color="text-green-500" />
            </div>
        </div>
    );
};

export default MyList;