// src/services/authApi.js
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../redux/api';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Auth'],
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response) => response.response.data,
      invalidatesTags: ['Auth'],
    }),
    refreshToken: builder.mutation({
      query: (refreshToken) => ({
        url: '/auth/refresh-token',
        method: 'POST',
        body: { refreshToken },
      }),
      transformResponse: (response) => response.response.data,
      invalidatesTags: ['Auth'],
    }),
    getMe: builder.query({
      query: () => ({
        url: '/auth/me',
        method: 'GET',
      }),
      providesTags: ['Auth'],
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useRefreshTokenMutation,
  useGetMeQuery,
  useLogoutMutation,
} = authApi;
