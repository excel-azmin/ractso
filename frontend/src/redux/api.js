// src/app/api.js
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Mutex } from 'async-mutex';
import { logout, setCredentials } from './features/authSlice';

const baseUrl = import.meta.env.VITE_API_URL;
const mutex = new Mutex();

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.access_token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseQueryWithReauth = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        console.log('Attempting to refresh token with:', refreshToken);
        if (refreshToken) {
          const refreshResult = await rawBaseQuery(
            {
              url: '/auth/refresh-token',
              method: 'POST',
              body: { refreshToken: refreshToken },
            },
            api,
            extraOptions,
          );
          console.log('Refresh token result:', refreshResult);
          if (refreshResult?.data) {
            const { access_token, refresh_token } =
              refreshResult.data.response.data;

            api.dispatch(
              setCredentials({
                access_token,
                refresh_token,
                user: api.getState().auth.user,
              }),
            );

            result = await rawBaseQuery(args, api, extraOptions);
          } else {
            api.dispatch(logout());
          }
        } else {
          api.dispatch(logout());
        }
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      result = await rawBaseQuery(args, api, extraOptions);
    }
  }

  return result;
};
