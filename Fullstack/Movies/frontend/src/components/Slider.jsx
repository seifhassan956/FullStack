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
          <div key={movie.id} className="relative w-full h-[80vh]">
            {/* BACKGROUND IMAGE */}
            <img
              src={movie.backdrop_path ? `${BACKDROP_BASE_URL}${movie.backdrop_path}` : null}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            
            {/* HERO CONTENT (Title & Description) */}
            {isHero && (
              <div className="absolute inset-0 flex flex-col justify-center px-12 bg-black/30">
                <div className="max-w-2xl space-y-4">
                  <h2 className="text-5xl md:text-7xl font-black text-white drop-shadow-2xl uppercase tracking-tighter">
                    {movie.title || movie.original_title}
                  </h2>
                  <p className="text-lg text-gray-200 line-clamp-3 drop-shadow-md font-medium">
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