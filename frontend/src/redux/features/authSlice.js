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

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      state.user = user;
      state.access_token = access_token;
      state.refresh_token = refresh_token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');

      state.user = null;
      state.access_token = null;
      state.refresh_token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, logout, setLoading, setError, clearError } =
  authSlice.actions;

export default authSlice.reducer;
