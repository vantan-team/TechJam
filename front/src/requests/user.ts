"use client";
import * as fetch from "@/utils/fetch";
import type { AuthStatus } from "@/types/user";

export interface User {
    id: number;
    friendship_id?: number;
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

export async function getFriends(): Promise<FriendsResponse | null> {
    const token = window.localStorage.getItem("access_token") || "";
    return await fetch.get<FriendsResponse | null>(`/api/friends`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

export async function searchUsers(query: string): Promise<SearchUsersResponse | null> {
    const token = window.localStorage.getItem("access_token") || "";
    return await fetch.post<{ query: string }, SearchUsersResponse | null>(`/api/friends/search`, { query }, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
}

export interface Notification {
    id: string;
    type: 'friend_request' | 'friend_accepted' | 'new_follower';
    title: string;
    message: string;
    user: {
        id: number;
        name: string;
        profile_photo_url: string | null;
    };
    data: {
        friend_request_id?: number;
        user_id: number;
    };
    created_at: string;
    is_read: boolean;
}

export interface NotificationsResponse {
    success: boolean;
    data: {
        notifications: Notification[];
        unread_count: number;
    };
}

export interface UnreadCountResponse {
    success: boolean;
    data: {
        unread_count: number;
        friend_requests: number;
        friend_accepted: number;
        new_followers: number;
    };
}

export async function sendFriendRequest(userId: number): Promise<any> {
    const token = window.localStorage.getItem("access_token") || "";
    return await fetch.post<{ request_user_id: number }, any>(`/api/friends/request`, 
        { request_user_id: userId }, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
}

export async function acceptFriendRequest(requestId: number): Promise<any> {
    const token = window.localStorage.getItem("access_token") || "";
    return await fetch.post<{}, any>(`/api/friends/${requestId}/accept`, {}, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
}

export async function deleteFriend(friendId: number): Promise<any> {
    const token = window.localStorage.getItem("access_token") || "";
    return await fetch.destroy(`/api/friends/${friendId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

export async function getNotifications(): Promise<NotificationsResponse | null> {
    const token = window.localStorage.getItem("access_token") || "";
    return await fetch.get<NotificationsResponse | null>(`/api/notifications`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

export async function getUnreadCount(): Promise<UnreadCountResponse | null> {
    const token = window.localStorage.getItem("access_token") || "";
    return await fetch.get<UnreadCountResponse | null>(`/api/notifications/unread-count`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

export async function markNotificationsAsRead(): Promise<any> {
    const token = window.localStorage.getItem("access_token") || "";
    return await fetch.post<{}, any>(`/api/notifications/mark-as-read`, {}, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
}