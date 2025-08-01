// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '../../services/authApi';
import authReducer from '../features/authSlice';

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware),
});

store.subscribe(() => {
  console.log('State after dispatch:', store.getState().auth);
});

export default store;
