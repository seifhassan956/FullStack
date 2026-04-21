import React from 'react';
import { useGetMovieDetailsQuery, useGetSeriesDetailsQuery } from '../redux/api/themoviedb.js';

const DashboardMovieCardWithApi = ({ movieID, type }) => {
  const isTv = type === "series";

  const { data, isLoading } = isTv
    ? useGetSeriesDetailsQuery(movieID)
    : useGetMovieDetailsQuery(movieID);

  if (isLoading) {
    return <div className="movie-card skeleton" />;
  }

  if (!data) return null;

  const imageUrl = `https://image.tmdb.org/t/p/w500${data.poster_path}`;

  return (
    <div className="movie-card">
      <img src={imageUrl} alt={data.title || data.name} />
      <h3>{data.title || data.name}</h3>
      <span>{data.vote_average?.toFixed(1)} ⭐</span>
    </div>
  );
};

export default DashboardMovieCardWithApi;