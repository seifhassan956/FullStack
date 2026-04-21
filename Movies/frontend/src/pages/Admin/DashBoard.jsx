import React, { useMemo, useState } from 'react';
import { useGetAllUsersQuery } from '../../redux/api/users';
import {
  Users,
  Film,
  Star,
  Zap
} from 'lucide-react';
import "../../styling/Dashboard.css";
import DashboardMovieCardWithApi from '../../components/MovieCardWithApi';

const DashBoard = () => {
  const { data: users, isLoading, isError } = useGetAllUsersQuery();

  const [showAllMovies, setShowAllMovies] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const stats = useMemo(() => {
    if (!users?.length) {
      return {
        totalUsers: 0,
        totalMovies: 0,
        totalReviews: 0,
        adminCount: 0,
        listTypeBreakdown: { watchLater: 0, favourite: 0, watched: 0 },
        mediaTypeBreakdown: { movie: 0, series: 0 },
        topGenres: [],
        recentActivity: [],
        userEngagement: [],
        allMovies: [],
        allReviews: []
      };
    }

    let totalMovies = 0;
    let totalReviews = 0;

    const listTypeBreakdown = { watchLater: 0, favourite: 0, watched: 0 };
    const mediaTypeBreakdown = { movie: 0, series: 0 };
    const genreDistribution = {};
    const recentActivity = [];

    const allMovies = [];

    // ⭐ GROUP REVIEWS BY MOVIE
    const reviewsByMovie = {};

    users.forEach(user => {
      totalMovies += user.movies?.length || 0;
      totalReviews += user.reviews?.length || 0;

      // MOVIES
      user.movies?.forEach(movie => {
        listTypeBreakdown[movie.ListType] = (listTypeBreakdown[movie.ListType] || 0) + 1;
        mediaTypeBreakdown[movie.mediaType] = (mediaTypeBreakdown[movie.mediaType] || 0) + 1;
        genreDistribution[movie.genre] = (genreDistribution[movie.genre] || 0) + 1;

        allMovies.push({
          ...movie,
          username: user.username,
          userImage: user.image
        });

        recentActivity.push({
          user: user.username,
          action: movie.ListType,
          title: movie.title,
          timestamp: new Date(movie.createdAt)
        });
      });

      // REVIEWS GROUPED BY MOVIE
      user.reviews?.forEach(review => {
        const movieId = review.MovieID;

        if (!reviewsByMovie[movieId]) {
          reviewsByMovie[movieId] = {
            MovieID: movieId,
            comments: []
          };
        }

        reviewsByMovie[movieId].comments.push({
          username: user.username,
          userImage: user.image,
          comment: review.comment,
          createdAt: review.createdAt
        });

        recentActivity.push({
          user: user.username,
          action: 'review',
          comment: review.comment?.slice(0, 50),
          timestamp: new Date(review.createdAt)
        });
      });
    });

    const topGenres = Object.entries(genreDistribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([genre, count]) => ({ genre, count }));

    return {
      totalUsers: users.length,
      totalMovies,
      totalReviews,
      adminCount: users.filter(u => u.isAdmin).length,
      listTypeBreakdown,
      mediaTypeBreakdown,
      topGenres,
      recentActivity: recentActivity
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 8),

      allMovies: allMovies.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      ),

      // ⭐ IMPORTANT: grouped reviews
      allReviews: Object.values(reviewsByMovie)
    };
  }, [users]);

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (isError) {
    return <div className="dashboard-error">Error loading dashboard</div>;
  }

  return (
    <div className="dashboard-container">

      {/* HEADER */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">Movie platform overview</p>
      </div>

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card users">
          <Users />
          <h2>{stats.totalUsers}</h2>
          <p>Users</p>
        </div>

        <div className="stat-card movies">
          <Film />
          <h2>{stats.totalMovies}</h2>
          <p>Movies</p>
        </div>

        <div className="stat-card reviews">
          <Star />
          <h2>{stats.totalReviews}</h2>
          <p>Reviews</p>
        </div>

        <div className="stat-card admins">
          <Zap />
          <h2>{stats.adminCount}</h2>
          <p>Admins</p>
        </div>
      </div>

      {/* MOVIES */}
      <div className="movies-section">
        <h2 className="section-title">Movies</h2>

        <div className="movies-grid">
          {(showAllMovies
            ? stats.allMovies
            : stats.allMovies.slice(0, 6)
          ).map((movie) => (
            <DashboardMovieCardWithApi
              key={movie.MovieID}
              movieID={movie.MovieID}
              type={movie.mediaType === "series" ? "tv" : "movie"}
            />
          ))}
        </div>

        {stats.allMovies.length > 6 && (
          <button
            className="show-more-btn"
            onClick={() => setShowAllMovies(!showAllMovies)}
          >
            {showAllMovies ? "Show Less" : "Show More"}
          </button>
        )}
      </div>

      {/* REVIEWS GROUPED BY MOVIE */}
      <div className="reviews-section">
        <h2 className="section-title">Reviews (Grouped by Movie)</h2>

        <div className="reviews-grid">
          {(showAllReviews
            ? stats.allReviews
            : stats.allReviews.slice(0, 6)
          ).map((movieGroup) => (
            <div key={movieGroup.MovieID} className="review-card">

              {/* MOVIE ID */}
              <div className="review-footer">
                <strong>Movie ID:</strong> {movieGroup.MovieID}
              </div>

              {/* MOVIE IMAGE */}
              <div style={{ margin: "10px 0" }}>
                <DashboardMovieCardWithApi
                  movieID={movieGroup.MovieID}
                  type="movie"
                />
              </div>

              {/* COMMENTS */}
              <div>
                {movieGroup.comments.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      marginBottom: "10px",
                      padding: "8px",
                      borderRadius: "8px",
                      background: "rgba(255,255,255,0.05)"
                    }}
                  >
                    <div style={{ fontSize: "12px", opacity: 0.7 }}>
                      @{c.username}
                    </div>
                    <div>{c.comment}</div>
                    <div style={{ fontSize: "10px", opacity: 0.5 }}>
                      {new Date(c.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>

        {stats.allReviews.length > 6 && (
          <button
            className="show-more-btn"
            onClick={() => setShowAllReviews(!showAllReviews)}
          >
            {showAllReviews ? "Show Less" : "Show More"}
          </button>
        )}
      </div>

    </div>
  );
};

export default DashBoard;