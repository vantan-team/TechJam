"use client";
import * as fetch from "@/utils/fetch";
import type { AuthStatus, Activity, UserProfile } from "@/types/user";

export interface User {
    id: number;
    name: string;
    email: string;
    profile_photo_url: string | null;
    friend_status?: 'none' | 'pending' | 'accepted';
    joined_at?: string;
}

export interface FriendsResponse {
    success: boolean;
    friends: User[];
    message: string[];
}

export interface SearchUsersResponse {
    success: boolean;
    users: User[];
    total: number;
    query: string;
    message: string[];
}

export async function getUserAuthStatus(): Promise<AuthStatus | null> {
    const token = window.localStorage.getItem("access_token") || "";
    return await fetch.post<null, AuthStatus | null>(`/api/auth/status`, null, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

// feature/profile-req の関数
export async function getUserActivities(userId: string): Promise<Activity[]> {
    const token = window.localStorage.getItem("access_token") || "";
    return await fetch.get<Activity[]>(`/api/user/${userId}/activities`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

// develop の関数
export async function getFriends(): Promise<FriendsResponse | null> {
    const token = window.localStorage.getItem("access_token") || "";
    return await fetch.get<FriendsResponse | null>(`/api/friends`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

// feature/profile-req の関数
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    const token = window.localStorage.getItem("access_token") || "";
    return await fetch.get<UserProfile>(`/api/user/${userId}/profile`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

// develop の関数
export async function searchUsers(query: string): Promise<SearchUsersResponse | null> {
    const token = window.localStorage.getItem("access_token") || "";
    return await fetch.post<{ query: string }, SearchUsersResponse | null>(
        `/api/friends/search`,
        { query },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }
    );
}

// develop の関数
export async function sendFriendRequest(userId: number): Promise<any> {
    const token = window.localStorage.getItem("access_token") || "";
    return await fetch.post<{ request_user_id: number }, any>(
        `/api/friends/request`,
        { request_user_id: userId },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }
    );
}

