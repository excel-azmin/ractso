// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '../../services/authApi';
import authReducer from '../features/authSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware),
});
export default store;
