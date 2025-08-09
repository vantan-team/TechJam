'use client';

import type { Restaurant } from '@/types/restaurant';

const getToken = () =>
  typeof window !== "undefined" ? window.localStorage.getItem("access_token") || "" : "";

const authHeader = (): HeadersInit | undefined => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

export const searchRestaurants = async (keyword: string): Promise<any> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_ROOT}/api/restaurants/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        keyword: keyword,
        include_history: true,
        start: 1,
        count: 20
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.data;
    } else {
      const errorData = await response.json();
      console.error('Search API Error:', response.status, errorData);
      return { shops: [], pagination: {} };
    }
  } catch (error) {
    console.error('Search failed:', error);
    return { shops: [], pagination: {} };
  }
};
