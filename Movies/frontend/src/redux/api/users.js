import { apiSlice } from "./apiSlice";
import { USER_URL } from "../constants";
import { logout } from "../features/auth/authSlice";

export const usersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (data) => ({
                url: `${USER_URL}/login`,
                method: 'POST',
                body: data,
            }),
        }),

        register: builder.mutation({
            query: (data) => ({
                url: `${USER_URL}`,
                method: 'POST',
                body: data,
            }),
        }),

        logout: builder.mutation({
            query: () => ({
                url: `${USER_URL}/logout`,
                method: 'POST',
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(logout());
                } catch (error) {
                    console.error(error);
                }
            },
        }),

        getProfile: builder.query({
            query: () => ({
                url: `${USER_URL}/profile`,
                method: 'GET',
            }),
            providesTags: ['UserProfile'],
        }),

        updateProfile: builder.mutation({
            query: (formData) => ({
                url: `${USER_URL}/profile`,
                method: 'PUT',
                body: formData,
            }),
        }),

        addReview: builder.mutation({
            query: (data) => ({
                url: `${USER_URL}/review`,
                method: 'POST',
                body: data,
            }),
        }),

        updateReview: builder.mutation({
            query: ({ reviewId, data }) => ({
                url: `${USER_URL}/review/${reviewId}`,
                method: 'PUT',
                body: data,
            }),
        }),

        deleteReview: builder.mutation({
            query: (reviewId) => ({
                url: `${USER_URL}/review/${reviewId}`,
                method: "DELETE",
            }),
        }),

        getAllReviews: builder.query({
            query: (movieId) => ({
                url: `${USER_URL}/reviews/${movieId}`,
                method: 'GET',
            }),
        }),

        addMovieToList: builder.mutation({
            query: (data) => ({
                url: `${USER_URL}/movielist`,
                method: 'POST',
                body: data,
            }),
        }),

        removeMovieFromList: builder.mutation({
            query: ({ MovieID, ListType, mediaType }) => ({
                url: `${USER_URL}/movielist/${MovieID}/${ListType}/${mediaType}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['UserProfile'],
        }),

        getAllUsers: builder.query({
            query: () => ({
                url: `${USER_URL}/users`,
                method: 'GET',
            }),
        }),
    })
});

export const { 
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation, 
    useUpdateProfileMutation, 
    useAddReviewMutation, 
    useUpdateReviewMutation, 
    useDeleteReviewMutation, 
    useGetAllReviewsQuery, 
    useAddMovieToListMutation, 
    useRemoveMovieFromListMutation, 
    useGetProfileQuery,
    useGetAllUsersQuery
} = usersApiSlice;