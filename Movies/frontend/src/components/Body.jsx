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

  // ---------------- DATA ----------------
  const moviesNew = useGetNewMoviesQuery(undefined, { skip: !isMovie });
  const seriesNew = useGetNewSeriesQuery(undefined, { skip: isMovie });

  const moviesTop = useGetTopMoviesQuery(undefined, { skip: !isMovie });
  const seriesTop = useGetTopSeriesQuery(undefined, { skip: isMovie });

  const newData = isMovie ? moviesNew.data : seriesNew.data;
  const topData = isMovie ? moviesTop.data : seriesTop.data;

  // Loading states
  const isLoadingNew = isMovie ? moviesNew.isLoading : seriesNew.isLoading;
  const isLoadingTop = isMovie ? moviesTop.isLoading : seriesTop.isLoading;

  // ---------------- INFINITE SCROLL ----------------
  const [page, setPage] = useState(1);
  const [allContent, setAllContent] = useState([]);

  const { data: scrollData, isFetching } = useGetRandomMoviesQuery({
    page,
    type: activeType
  });

  useEffect(() => {
    setAllContent([]);
    setPage(1);
  }, [activeType]);

  useEffect(() => {
    if (!scrollData?.length) return;

    setAllContent(prev => {
      const existingIds = new Set(prev.map(i => i.id));
      const filtered = scrollData.filter(item => !existingIds.has(item.id));
      return [...prev, ...filtered];
    });
  }, [scrollData]);

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

  const newItems = newData || [];
  const topItems = topData || [];

  // ---------------- MAIN SLIDER ----------------
  const standardSettings = useMemo(() => ({
    dots: false,
    infinite: newItems.length > 6,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 6,
    lazyLoad: 'ondemand',
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 4, slidesToScroll: 4 } },
      { breakpoint: 800, settings: { slidesToShow: 3, slidesToScroll: 3 } },
      { breakpoint: 480, settings: { slidesToShow: 2, slidesToScroll: 2 } }
    ]
  }), [newItems.length]);

  // ---------------- FIXED TOP 10 SLIDER ----------------
  const rankingSettings = useMemo(() => ({
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    centerMode: false,
    initialSlide: 0,
    variableWidth: false,
    swipeToSlide: true,
    arrows: true,
    lazyLoad: 'ondemand',
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      { breakpoint: 800, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } }
    ]
  }), []);

  // Loading skeleton for slider
  const SliderSkeleton = ({ count = 3 }) => (
    <div className="flex gap-2 px-2">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex-shrink-0 w-[280px] sm:w-[320px] md:w-[400px]">
          <div className="flex items-center h-40 md:h-64 bg-gray-800/50 rounded-lg animate-pulse" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-[#141414] min-h-screen text-white pb-20 overflow-x-hidden">

      <div className="px-3 sm:px-6 md:px-12 space-y-10 md:space-y-12 relative z-10">

        {/* TOP 10 SECTION */}
        <section className="w-full overflow-hidden">

          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 ml-1 md:ml-2">
            Top 10 {isMovie ? "Movies" : "Series"} Today
          </h2>

          {isLoadingTop ? (
            <SliderSkeleton count={3} />
          ) : topItems.length > 0 ? (
            <div className="relative">
              <Slider {...rankingSettings} key={`top-${activeType}`}>
                {topItems.slice(0, 10).map((item, index) => (
                  <div key={item.id} className="!flex justify-center px-2">

                    <div className="relative flex items-center justify-start h-40 md:h-64 w-full max-w-[280px] sm:max-w-[320px] md:max-w-[400px]">

                      {/* NUMBER */}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 z-0 overflow-hidden">
                        <span
                          className="
                            text-[4rem] sm:text-[6rem] md:text-[10rem] lg:text-[12rem]
                            font-black select-none leading-none
                            text-gray-700
                          "
                          style={{
                            WebkitTextStroke: "2px #888",
                            WebkitTextFillColor: "transparent"
                          }}
                        >
                          {index + 1}
                        </span>
                      </div>

                      {/* CARD */}
                      <div className="relative w-[100px] sm:w-[120px] md:w-[160px] lg:w-[180px] ml-[45px] sm:ml-[60px] md:ml-[90px] lg:ml-[110px] z-20 flex-shrink-0">
                        <MovieCard movie={item} type={activeType} />
                      </div>

                    </div>

                  </div>
                ))}
              </Slider>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              No {isMovie ? "movies" : "series"} available
            </div>
          )}

        </section>

        {/* NEW */}
        <section>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 ml-1 md:ml-2">
            New {isMovie ? "Movie" : "Series"} Releases
          </h2>

          {isLoadingNew ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-gray-800/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : newItems.length > 0 ? (
            <Slider {...standardSettings} key={`new-${activeType}`}>
              {newItems.map(item => (
                <div key={item.id} className="px-1">
                  <MovieCard movie={item} type={activeType} />
                </div>
              ))}
            </Slider>
          ) : (
            <div className="text-center py-10 text-gray-500">
              No new releases available
            </div>
          )}
        </section>

        {/* EXPLORE */}
        <section>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-5 ml-1 md:ml-2">
            Explore More
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {allContent.map(item => (
              <MovieCard key={item.id} movie={item} type={activeType} />
            ))}
          </div>

          {isFetching && (
            <div className="flex justify-center py-8 md:py-10">
              <div className="animate-spin h-8 w-8 md:h-10 md:w-10 border-t-2 border-b-2 border-[#E50914] rounded-full" />
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default Body;