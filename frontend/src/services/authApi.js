// src/services/authApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl = 'http://localhost:3001/api/v1';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.access_token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
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
      invalidatesTags: ['Auth'],
    }),
    refreshToken: builder.mutation({
      query: (refreshToken) => ({
        url: '/auth/refresh',
        method: 'POST',
        body: { refreshToken: refreshToken },
      }),
      invalidatesTags: ['Auth'],
    }),
    getMe: builder.query({
      query: () => '/auth/me',
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
