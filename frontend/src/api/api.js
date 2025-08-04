const baseQueryWithReauth = async (args, api, extraOptions) => {
  const baseQuery = api.baseQuery;
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Handle token refresh logic here
  }

  return result;
};

export const API = createAp({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth({ baseUrl: '/api' }),
  endpoints: () => ({}),
});
