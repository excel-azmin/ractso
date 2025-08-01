// src/features/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Load initial state safely
const loadInitialState = () => {
  try {
    return {
      access_token: localStorage.getItem('access_token'),
      refresh_token: localStorage.getItem('refresh_token'),
      user: JSON.parse(localStorage.getItem('user')),
    };
  } catch (error) {
    console.error('Error loading initial state:', error);
    return {
      access_token: null,
      refresh_token: null,
      user: null,
    };
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState: loadInitialState(),
  reducers: {
    setCredentials: (state, action) => {
      console.log('Action payload:', action.payload);
      try {
        const { user, access_token, refresh_token } = action.payload;

        // Update state
        state.user = user;
        state.access_token = access_token;
        state.refresh_token = refresh_token;

        // Update localStorage
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);

        console.log('New state after setCredentials:', {
          user: state.user,
          access_token: state.access_token,
          refresh_token: state.refresh_token,
        });
      } catch (error) {
        console.error('Error in setCredentials:', error);
      }
    },
    logout: (state) => {
      state.user = null;
      state.access_token = null;
      state.refresh_token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.access_token;
