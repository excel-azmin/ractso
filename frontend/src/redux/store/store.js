// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '../../services/authApi';
import { paymentApi } from '../../services/paymentApi';
import authReducer from '../features/authSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,

    [paymentApi.reducerPath]: paymentApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, paymentApi.middleware),
});

export default store;
