// src/app/api.js
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Mutex } from 'async-mutex';
import { logout, setRefreshCredentials } from './features/authSlice';
import refreshTokenFetcher from './refreshTokenFetcher';

const baseUrl = import.meta.env.VITE_API_URL;
const mutex = new Mutex();

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.access_token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
      headers.set('Accept', 'application/json');
      headers.set('Content-Type', 'application/json');
    }
    return headers;
  },
});

export const baseQueryWithReauth = async (args, api, extraOptions) => {
  // Wait for any pending mutex lock (if another request is already refreshing)
  await mutex.waitForUnlock();

  // First attempt the original request
  let result = await rawBaseQuery(args, api, extraOptions);

  // If 401 Unauthorized, try to refresh the token
  if (result?.error?.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();

      try {
        const refreshToken = localStorage.getItem('refresh_token');

        if (!refreshToken) {
          api.dispatch(logout());
          return result;
        }

        console.log('Attempting to refresh token...');

        // Make refresh token request
        const refreshResult = await refreshTokenFetcher(refreshToken);

        console.log('Refresh token response:', refreshResult.response.data);

        if (refreshResult.response?.data) {
          // Save the new tokens
          const { access_token, refresh_token } = refreshResult.response.data;
          api.dispatch(setRefreshCredentials({ access_token, refresh_token }));

          // Retry the original request with new access token
          result = await rawBaseQuery(args, api, extraOptions);
        } else {
          // Refresh failed - logout the user
          console.error('Refresh token failed:', refreshResult.error);
          api.dispatch(logout());
        }
      } catch (error) {
        console.error('Error during token refresh:', error);
        api.dispatch(logout());
      } finally {
        release();
      }
    } else {
      // Wait for the mutex to unlock if another request is refreshing
      await mutex.waitForUnlock();
      // Retry the original request
      result = await rawBaseQuery(args, api, extraOptions);
    }
  }

  return result;
};
