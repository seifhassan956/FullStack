import React, { useState, useEffect, useMemo } from 'react';
import {
  useGetNewMoviesQuery,
  useGetTopMoviesQuery,
  useGetRandomMoviesQuery,
  useGetTopSeriesQuery,
  useGetNewSeriesQuery
} from '../redux/api/themoviedb.js';

import Slider from 'react-slick';
import MovieCard from './MovieCard.jsx';

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Body = ({ activeType = "movie" }) => {
  const isMovie = activeType === "movie";

  // ---------------- SAFE HOOKS ----------------
  const moviesNew = useGetNewMoviesQuery(undefined, { skip: !isMovie });
  const seriesNew = useGetNewSeriesQuery(undefined, { skip: isMovie });

  const moviesTop = useGetTopMoviesQuery(undefined, { skip: !isMovie });
  const seriesTop = useGetTopSeriesQuery(undefined, { skip: isMovie });

  const newData = isMovie ? moviesNew.data : seriesNew.data;
  const topData = isMovie ? moviesTop.data : seriesTop.data;

  // ---------------- INFINITE SCROLL ----------------
  const [page, setPage] = useState(1);
  const [allContent, setAllContent] = useState([]);

  const { data: scrollData, isFetching } = useGetRandomMoviesQuery({
    page,
    type: activeType
  });

  // reset on type change
  useEffect(() => {
    setAllContent([]);
    setPage(1);
  }, [activeType]);

  const newItems = newData || [];
  const topItems = topData || [];

  // ---------------- FIXED MERGE (NO DUPLICATES) ----------------
  useEffect(() => {
    if (!scrollData?.length) return;

    setAllContent(prev => {
      const existingIds = new Set(prev.map(i => i.id));

      const filtered = scrollData.filter(item => !existingIds.has(item.id));

      return [...prev, ...filtered];
    });
  }, [scrollData]);

  // ---------------- SCROLL ----------------
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const current = window.innerHeight + window.scrollY;

      if (current >= scrollHeight - 600 && !isFetching) {
        setPage(prev => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isFetching]);

  // ---------------- SLIDER SETTINGS ----------------
  const standardSettings = useMemo(() => ({
    dots: false,
    infinite: newItems.length > 6,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 6,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 4, slidesToScroll: 4 } },
      { breakpoint: 800, settings: { slidesToShow: 3, slidesToScroll: 3 } },
      { breakpoint: 480, settings: { slidesToShow: 2, slidesToScroll: 2 } }
    ]
  }), [newItems.length]);

  const rankingSettings = {
    ...standardSettings,
    slidesToShow: 4,
    slidesToScroll: 4,
    infinite: false
  };

  return (
    <div className="bg-[#141414] min-h-screen text-white pb-20 overflow-x-hidden">
      <div className="px-6 md:px-12 space-y-12 -mt-32 relative z-10">

        {/* TOP 10 */}
        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-4 ml-2">
            Top 10 {isMovie ? "Movies" : "Series"} Today
          </h2>

          <Slider {...rankingSettings}>
            {topItems.slice(0, 10).map((item, index) => (
              <div key={item.id} className="relative group pr-4">
                <div className="flex items-center h-48 md:h-64">

                  <span className="text-[8rem] md:text-[12rem] font-black select-none"
                        style={{
                          WebkitTextStroke: "2px #595959",
                          color: "#141414",
                          letterSpacing: "-12px"
                        }}>
                    {index + 1}
                  </span>

                  <div className="w-[120px] md:w-[180px] -ml-8 z-20">
                    <MovieCard movie={item} type={activeType} />
                  </div>

                </div>
              </div>
            ))}
          </Slider>
        </section>

        {/* NEW */}
        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-4 ml-2">
            New {isMovie ? "Movie" : "Series"} Releases
          </h2>

          <Slider {...standardSettings}>
            {newItems.map(item => (
              <MovieCard key={item.id} movie={item} type={activeType} />
            ))}
          </Slider>
        </section>

        {/* EXPLORE */}
        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-6 ml-2">
            Explore More
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {allContent.map(item => (
              <MovieCard key={item.id} movie={item} type={activeType} />
            ))}
          </div>

          {isFetching && (
            <div className="flex justify-center py-10">
              <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-[#E50914]" />
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default Body;