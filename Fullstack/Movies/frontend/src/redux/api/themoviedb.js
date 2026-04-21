import { apiSlice } from "./apiSlice";
import { API_KEY } from "../constants";

export const tmdbApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ---------------- MOVIES ----------------
    getTopMovies: builder.query({
      query: () => ({
        url: `/trending/movie/day`,
        params: { api_key: API_KEY },
        useTmdb: true, // 🔥 Added flag for dynamic switcher
      }),
      transformResponse: (res) => res.results,
    }),

    getNewMovies: builder.query({
      query: () => ({
        url: `/trending/movie/week`,
        params: { api_key: API_KEY },
        useTmdb: true, 
      }),
      transformResponse: (res) => res.results,
    }),

    getRandomMovies: builder.query({
      query: ({ page = 1, type = "movie" }) => ({
        url: `/${type}/popular`,
        params: {
          api_key: API_KEY,
          page,
        },
        useTmdb: true,
      }),
      transformResponse: (res) => res.results,
    }),

    getMovieDetails: builder.query({
      query: (id) => ({
        url: `/movie/${id}`,
        params: {
          api_key: API_KEY,
          append_to_response: "videos,credits",
        },
        useTmdb: true,
      }),
    }),

    // ---------------- SERIES ----------------
    getTopSeries: builder.query({
      query: () => ({
        url: `/trending/tv/day`,
        params: { api_key: API_KEY },
        useTmdb: true,
      }),
      transformResponse: (res) => res.results,
    }),

    getNewSeries: builder.query({
      query: () => ({
        url: `/tv/airing_today`,
        params: { api_key: API_KEY },
        useTmdb: true,
      }),
      transformResponse: (res) => res.results,
    }),

    getPopularSeries: builder.query({
      query: (page = 1) => ({
        url: `/tv/popular`,
        params: {
          api_key: API_KEY,
          page,
        },
        useTmdb: true,
      }),
      transformResponse: (res) => res.results,
    }),

    getSeriesDetails: builder.query({
      query: (id) => ({
        url: `/tv/${id}`,
        params: {
          api_key: API_KEY,
          append_to_response: "videos,credits,images",
          include_image_language: "en,null",
        },
        useTmdb: true,
      }),
    }),

    // ---------------- SEARCH ----------------
    getSearchMovies: builder.query({
      query: ({ query, page = 1 }) => ({
        url: `/search/movie`,
        params: {
          api_key: API_KEY,
          query,
          page,
          include_adult: false,
        },
        useTmdb: true,
      }),
      transformResponse: (res) => res.results,
    }),

    getSearchSeries: builder.query({
      query: ({ query, page = 1 }) => ({
        url: `/search/tv`,
        params: {
          api_key: API_KEY,
          query,
          page,
          include_adult: false,
        },
        useTmdb: true,
      }),
      transformResponse: (res) => res.results,
    }),
  }),
});

export const {
  useGetTopMoviesQuery,
  useGetNewMoviesQuery,
  useGetRandomMoviesQuery,
  useGetMovieDetailsQuery,
  useGetTopSeriesQuery,
  useGetPopularSeriesQuery,
  useGetNewSeriesQuery,
  useGetSeriesDetailsQuery,
  useGetSearchMoviesQuery,
  useGetSearchSeriesQuery,
} = tmdbApi;