// src/components/Slider.jsx
import React from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const MovieSlider = ({ data, isHero }) => {
  const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/original";

  const settings = {
    dots: isHero ? true : false,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    arrows: false,
  };

  return (
    <div className="w-full h-full overflow-hidden">
      <Slider {...settings}>
        {data?.map((movie) => (
          <div key={movie.id} className="relative w-full h-[60vh] md:h-[80vh]">

            {/* BACKGROUND IMAGE */}
            <img
              src={
                movie.backdrop_path
                  ? `${BACKDROP_BASE_URL}${movie.backdrop_path}`
                  : ""
              }
              alt={movie.title || movie.original_title}
              className="w-full h-full object-cover"
            />

            {/* DARK OVERLAY */}
            <div className="absolute inset-0 bg-black/40" />

            {/* HERO CONTENT */}
            {isHero && (
              <div className="absolute inset-0 flex flex-col justify-end md:justify-center px-4 md:px-12 pb-10 md:pb-0">
                
                <div className="max-w-lg md:max-w-2xl space-y-2 md:space-y-4">

                  {/* TITLE */}
                  <h2 className="
                    text-lg sm:text-xl md:text-5xl lg:text-7xl 
                    font-black text-white uppercase tracking-tight 
                    drop-shadow-2xl leading-tight
                  ">
                    {movie.title || movie.original_title}
                  </h2>

                  {/* DESCRIPTION */}
                  <p className="
                    text-[10px] sm:text-xs md:text-lg 
                    text-gray-200 line-clamp-2 md:line-clamp-4 
                    opacity-90
                  ">
                    {movie.overview}
                  </p>

                </div>
              </div>
            )}

          </div>
        ))}
      </Slider>
    </div>
  );
};

export default MovieSlider;