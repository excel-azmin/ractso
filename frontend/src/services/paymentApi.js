import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../redux/api';

export const paymentApi = createApi({
  reducerPath: 'paymentApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Payment'],
  endpoints: (builder) => ({
    initPayment: builder.mutation({
      query: (initPaymentDto) => ({
        url: '/payments/init',
        method: 'POST',
      }),
    }),
    getMyPayments: builder.query({
      query: () => ({
        url: `/payments/my-payments`,
        method: 'GET',
      }),
    }),
  }),
});

export const { useInitPaymentMutation, useGetMyPaymentsQuery } = paymentApi;
