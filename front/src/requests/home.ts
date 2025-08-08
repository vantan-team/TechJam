"use client";

import * as fetch from "@/utils/fetch";

/**
 * Backend HomeController (/api/home) から返る構造:
 * {
 *   guidebooks: [
 *     {
 *       id: number;
 *       title: string;
 *       author: string;
 *       followers: number;
 *       image: string;
 *       description: string;
 *       restaurants: [
 *         {
 *           id: number;
 *           position: [number, number];
 *           title: string;
 *           popup: string;
 *           description: string;
 *           image: string;
 *           rating: number;
 *           priceRange: string;
 *         }
 *       ]
 *     }
 *   ]
 * }
 */

export interface Restaurant {
  id: number;
  position: [number, number];
  title: string;
  popup: string;
  description: string;
  image: string;
  rating: number;
  priceRange: string;
  distance?: number; // クライアント側で計算する場合用
}

export interface Guidebook {
  id: number;
  title: string;
  author: string;
  followers: number;
  image: string;
  description: string;
  restaurants: Restaurant[];
  averageDistance?: number;
  nearbyCount?: number;
}

export interface HomeResponse {
  guidebooks: Guidebook[];
}

/**
 * ホーム画面ガイドブック一覧を取得
 * 認証不要エンドポイント（現状 /api/home は public）
 */
export async function getHomeGuidebooks(): Promise<HomeResponse> {
  return await fetch.get<HomeResponse>(`/api/home`);
}

/* ========= 位置計算系ユーティリティ（必要なら利用） ========= */

/**
 * 2点間距離 (Haversine) km
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 100) / 100;
}

export function getLocationAccuracy(accuracy: number): "high" | "medium" | "low" {
  if (accuracy <= 10) return "high";
  if (accuracy <= 100) return "medium";
  return "low";
}

export class LocationError extends Error {
  constructor(
    message: string,
    public code:
      | "PERMISSION_DENIED"
      | "POSITION_UNAVAILABLE"
      | "TIMEOUT"
      | "UNKNOWN"
  ) {
    super(message);
    this.name = "LocationError";
  }
}
