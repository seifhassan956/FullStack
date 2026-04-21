import React, { useState, useEffect } from 'react';
import { useGetSearchMoviesQuery, useGetSearchSeriesQuery } from '../../redux/api/themoviedb';
import MovieCard from '../../components/MovieCard.jsx';
import { AiOutlineSearch } from 'react-icons/ai';

const Search = () => {
    const [searchTerm, setSearchTerm] = useState("");
    
    // Initialize state from localStorage, but keep it in local state for reactivity
    const [activeType, setActiveType] = useState(() => {
        return localStorage.getItem("activeType") || "movie";
    });

    // Update localStorage whenever the user toggles the type
    useEffect(() => {
        localStorage.setItem("activeType", activeType);
    }, [activeType]);

    const isMovie = activeType === "movie";

    // Queries
    const { data: movieData, isLoading: movieLoading, error: movieError } = useGetSearchMoviesQuery(
        { query: searchTerm },
        { skip: !isMovie || searchTerm.length < 1 }
    );

    const { data: seriesData, isLoading: seriesLoading, error: seriesError } = useGetSearchSeriesQuery(
        { query: searchTerm },
        { skip: isMovie || searchTerm.length < 1 }
    );

    const results = isMovie ? (movieData || []) : (seriesData || []);
    const isLoading = isMovie ? movieLoading : seriesLoading;
    const error = isMovie ? movieError : seriesError;

    return (
        <div className="min-h-screen bg-[#141414] pt-28 px-6 md:px-10 pb-20">
            
            {/* TYPE TOGGLE SECTION */}
            <div className="flex justify-center mb-8">
                <div className="bg-[#1c1c1c] p-1 rounded-xl flex items-center border border-white/10 shadow-xl">
                    <button
                        onClick={() => setActiveType("movie")}
                        className={`px-8 py-2 rounded-lg font-bold transition-all ${
                            isMovie 
                            ? "bg-red-600 text-white shadow-lg" 
                            : "text-gray-500 hover:text-gray-300"
                        }`}
                    >
                        Movies
                    </button>
                    <button
                        onClick={() => setActiveType("tv")}
                        className={`px-8 py-2 rounded-lg font-bold transition-all ${
                            !isMovie 
                            ? "bg-red-600 text-white shadow-lg" 
                            : "text-gray-500 hover:text-gray-300"
                        }`}
                    >
                        Series
                    </button>
                </div>
            </div>

            {/* SEARCH BAR SECTION */}
            <div className="max-w-4xl mx-auto mb-12">
                <div className="relative group">
                    <AiOutlineSearch
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors"
                        size={24}
                    />
                    <input
                        type="text"
                        autoFocus
                        placeholder={`Search for a ${isMovie ? "movie" : "series"}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#1c1c1c] border-2 border-transparent focus:border-red-600 text-white text-lg md:text-xl py-4 pl-14 pr-6 rounded-2xl outline-none shadow-2xl transition-all"
                    />
                </div>
            </div>

            {/* RESULTS SECTION */}
            <div className="max-w-7xl mx-auto">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div>
                    </div>
                ) : error ? (
                    <div className="text-red-500 font-bold text-center">Error fetching search results.</div>
                ) : results.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {results.map((item) => (
                            <MovieCard 
                                key={item.id} 
                                movie={item} 
                                // CRITICAL: Pass the type so MovieCard knows which route to use
                                type={isMovie ? "movie" : "tv"} 
                            />
                        ))}
                    </div>
                ) : searchTerm.length >= 1 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-xl font-light">
                            No {isMovie ? "movies" : "series"} found matching <span className="text-white">"{searchTerm}"</span>.
                        </p>
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-gray-400/30 text-6xl mb-4 flex justify-center">
                            <AiOutlineSearch />
                        </p>
                        <p className="text-gray-500 text-xl">
                            Search for your favorite {isMovie ? "movies" : "series"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;