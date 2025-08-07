import { createSlice } from '@reduxjs/toolkit';

const getInitialState = () => {
  const user = localStorage.getItem('user');
  const access_token = localStorage.getItem('access_token');
  const refresh_token = localStorage.getItem('refresh_token');

  return {
    user: user ? JSON.parse(user) : null,
    access_token,
    refresh_token,
    isAuthenticated: !!access_token && !!refresh_token && !!user,
    loading: false,
    error: null,
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    setCredentials: (state, action) => {
      const { user, access_token, refresh_token } = action.payload;
      if (!action.payload.access_token || !action.payload.refresh_token) {
        return;
      }

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      state.user = user;
      state.access_token = access_token;
      state.refresh_token = refresh_token;
      state.isAuthenticated = true;
    },
    setRefreshCredentials: (state, action) => {
      const { refresh_token, access_token } = action.payload;
      if (!refresh_token || !access_token || !state.user) {
        return;
      }

      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('access_token', access_token);
      state.refresh_token = refresh_token;
      state.access_token = access_token;
    },
    logout: (state) => {
      state.user = null;
      state.access_token = null;
      state.refresh_token = null;
      state.isAuthenticated = false;

      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    },
  },
});

export const {
  setCredentials,
  setRefreshCredentials,
  logout,
  setLoading,
  setError,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
