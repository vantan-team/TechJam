const API_BASE_URL = 'http://localhost:8008/api';

export interface Position {
  latitude: number;
  longitude: number;
}

export interface Restaurant {
  id: number;
  position: [number, number];
  title: string;
  popup: string;
  description: string;
  image: string;
  rating: number;
  priceRange: string;
  distance?: number; // 現在地からの距離（km）
}

export interface Guidebook {
  id: number;
  title: string;
  author: string;
  followers: number;
  image: string;
  description: string;
  restaurants: Restaurant[];
  averageDistance?: number; // ガイドブック内の店舗の平均距離
  nearbyCount?: number; // 近くの店舗数
}

export interface HomeData {
  guidebooks: Guidebook[];
  userLocation?: Position;
  totalNearbyRestaurants?: number;
}

export interface FetchHomeDataOptions {
  latitude?: number;
  longitude?: number;
  radius?: number; // 検索範囲（km）
  sortBy?: 'followers' | 'distance' | 'rating';
  limit?: number;
}

/**
 * ホームデータを取得する
 * 位置情報が提供された場合、周辺のガイドブックを優先的に表示
 */
export async function fetchHomeData(options: FetchHomeDataOptions = {}): Promise<HomeData> {
  try {
    const params = new URLSearchParams();
    
    if (options.latitude !== undefined && options.longitude !== undefined) {
      params.append('latitude', options.latitude.toString());
      params.append('longitude', options.longitude.toString());
    }
    
    if (options.radius !== undefined) {
      params.append('radius', options.radius.toString());
    }
    
    if (options.sortBy) {
      params.append('sort_by', options.sortBy);
    }
    
    if (options.limit !== undefined) {
      params.append('limit', options.limit.toString());
    }
    
    const url = `${API_BASE_URL}/home${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: HomeData = await response.json();
    return data;
  } catch (error) {
    console.error('ホームデータの取得に失敗しました:', error);
    throw error;
  }
}

/**
 * 位置情報なしでホームデータを取得する（従来の機能）
 */
export async function fetchHomeDataWithoutLocation(): Promise<HomeData> {
  return fetchHomeData();
}

/**
 * 現在地周辺のガイドブックを取得する
 */
export async function fetchNearbyGuidebooks(
  latitude: number, 
  longitude: number, 
  radius: number = 5
): Promise<HomeData> {
  return fetchHomeData({
    latitude,
    longitude,
    radius,
    sortBy: 'distance',
    limit: 20
  });
}

/**
 * 2つの座標間の距離を計算する（Haversine公式）
 * @param lat1 緯度1
 * @param lon1 経度1
 * @param lat2 緯度2
 * @param lon2 経度2
 * @returns 距離（km）
 */
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // 地球の半径（km）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return Math.round(distance * 100) / 100; // 小数点以下2桁で四捨五入
}

/**
 * 位置情報の精度を判定する
 */
export function getLocationAccuracy(accuracy: number): 'high' | 'medium' | 'low' {
  if (accuracy <= 10) return 'high';
  if (accuracy <= 100) return 'medium';
  return 'low';
}

/**
 * 位置情報のエラーハンドリング
 */
export class LocationError extends Error {
  constructor(
    message: string,
    public code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'UNKNOWN'
  ) {
    super(message);
    this.name = 'LocationError';
  }
} 