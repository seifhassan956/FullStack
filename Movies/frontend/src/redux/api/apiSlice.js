import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { BASE_URL , API_URL} from "../constants";

const baseQuery = fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: "include",
});

const tmdbBaseQuery = fetchBaseQuery({
    baseUrl: API_URL,
  });

const dynamicBaseQuery = async (args, api, extraOptions) => {
    if (args.useTmdb) {
      return tmdbBaseQuery(args, api, extraOptions);
    }
    return baseQuery(args, api, extraOptions);
  };
  
export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: dynamicBaseQuery,
    // tagTypes: ["User", "Movie", "Series"],
    endpoints: () => ({}),
  });
