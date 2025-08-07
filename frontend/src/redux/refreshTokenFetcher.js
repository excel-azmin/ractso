// src/app/refreshTokenFetcher.js
const refreshTokenFetcher = async (refreshToken) => {
  const baseUrl = import.meta.env.VITE_API_URL;

  try {
    const response = await fetch(`${baseUrl}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Refresh token fetch failed:', error);
    throw error;
  }
};

export default refreshTokenFetcher;
