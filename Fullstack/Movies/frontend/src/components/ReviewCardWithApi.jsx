import React from 'react';
import { useGetMovieDetailsQuery, useGetSeriesDetailsQuery } from '../redux/api/themoviedb';

const ReviewCardWithApi = ({ review }) => {
  const isTv = review.mediaType === "series";

  const { data, isLoading } = isTv
    ? useGetSeriesDetailsQuery(review.MovieID)
    : useGetMovieDetailsQuery(review.MovieID);

  if (isLoading) {
    return <div className="review-card skeleton" />;
  }

  if (!data) return null;

  const imageUrl = `https://image.tmdb.org/t/p/w500${data.poster_path}`;

  return (
    <div className="review-card">
      <img src={imageUrl} alt={data.title || data.name} />

      <div className="review-content">
        <h3>{data.title || data.name}</h3>

        <p className="review-text">{review.comment}</p>

        <span className="review-user">— {review.username}</span>

        <span className="movie-id">ID: {review.MovieID}</span>
      </div>
    </div>
  );
};

export default ReviewCardWithApi;