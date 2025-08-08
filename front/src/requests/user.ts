"use client";
import * as fetch from "@/utils/fetch";
import type { AuthStatus, UserProfile, VisitedHistory, GuideBook } from "@/types/user";

// ====== 共通型 ======
export interface User {
  id: number;
  friendship_id?: number;
  name: string;
  email: string;
  profile_photo_url: string | null;
  friend_status?: "none" | "pending" | "accepted";
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

// feature/notification の型
export interface Notification {
  id: string;
  type: "friend_request" | "friend_accepted" | "new_follower";
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

// ====== ローカルヘルパ ======
const getToken = () =>
  typeof window !== "undefined" ? window.localStorage.getItem("access_token") || "" : "";

const authHeader = (): HeadersInit | undefined => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

// ====== 認証・ユーザ ======
export async function getUserAuthStatus(): Promise<AuthStatus | null> {
  return await fetch.post<null, AuthStatus | null>(`/api/auth/status`, null, {
    headers: authHeader(),
  });
}

interface VisitedHistoryResponse {
  success: boolean;
  message: string[];
  visited_history: VisitedHistory[];
}

export async function getVisitedHistory(userId: string): Promise<VisitedHistory[]> {
  const res = await fetch.post<null, VisitedHistoryResponse, null>(`/api/user/${userId}/visited_history`, null, {
    headers: authHeader(),
  });
  return res?.visited_history ?? [];
}

// 統合版 getUserProfile
interface GetUserProfileApiResponse {
  success: boolean;
  message: string[];
  is_private: boolean;
  user?: {
    id: string;
    name: string;
    introduction?: string;
    profilePhotoUrl?: string;
    follow?: number;
    follower?: number;
    is_friend?: boolean;
  };
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const res = await fetch.post<null, GetUserProfileApiResponse, null>(`/api/user/${userId}`, null, {
    headers: authHeader(),
  });

  if (!res || !res.success || !res.user) return null;

  const u = res.user;
  const mapped: UserProfile = {
    id: u.id,
    name: u.name,
    profilePhotoUrl: u.profilePhotoUrl,
    bio: u.introduction,
    followersCount: u.follower,
    followingCount: u.follow,
    isFriend: u.is_friend,
    isPrivate: res.is_private,
  };

  return mapped;
}

interface GuideBooksResponse {
  success: boolean;
  message: string[];
  books: GuideBook[];
}

export async function getGuideBooks(userId: string): Promise<GuideBook[]> {
  const res = await fetch.post<null, GuideBooksResponse, null>(`/api/user/${userId}/guide_books`, null, {
    headers: authHeader(),
  });
  return res?.books ?? [];
}

// ====== フレンド ======
export async function getFriends(): Promise<FriendsResponse | null> {
  return await fetch.get<FriendsResponse | null>(`/api/friends`, {
    headers: authHeader(),
  });
}

export async function searchUsers(query: string): Promise<SearchUsersResponse | null> {
  return await fetch.post<{ query: string }, SearchUsersResponse | null>(
    `/api/friends/search`,
    { query },
    {
      headers: {
        ...(authHeader() ?? {}),
        "Content-Type": "application/json",
      },
    }
  );
}

export async function sendFriendRequest(userId: number): Promise<any> {
  return await fetch.post<{ request_user_id: number }, any>(
    `/api/friends/request`,
    { request_user_id: userId },
    {
      headers: {
        ...authHeader(),
        "Content-Type": "application/json",
      },
    }
  );
}

export async function acceptFriendRequest(requestId: number): Promise<any> {
  return await fetch.post<{}, any>(`/api/friends/${requestId}/accept`, {}, {
    headers: {
      ...authHeader(),
      "Content-Type": "application/json",
    },
  });
}

export async function deleteFriend(friendId: number): Promise<any> {
  return await fetch.destroy(`/api/friends/${friendId}`, {
    headers: authHeader(),
  });
}

/**
 * ユーザーフォロー/アンフォローAPI
 */
export interface FollowUserRequest {
  follow_user_id: number;
  type: "follow" | "unfollow";
}
export interface FollowUserResponse {
  success: boolean;
  message: string[];
}
export async function followUser(params: FollowUserRequest): Promise<FollowUserResponse> {
  return await fetch.post<FollowUserRequest, FollowUserResponse>(
    "/api/user/follow",
    params,
    {
      headers: {
        ...(authHeader() ?? {}),
        "Content-Type": "application/json",
      },
    }
  );
}

// ====== 通知 ======
export async function getNotifications(): Promise<NotificationsResponse | null> {
  return await fetch.get<NotificationsResponse | null>(`/api/notifications`, {
    headers: authHeader(),
  });
}

export interface UserFollowStatusResponse {
  success: boolean;
  is_following: boolean;
}

export async function getUserFollowStatus(userId: string | number): Promise<boolean> {
  const res = await fetch.post<null, UserFollowStatusResponse, null>(
    `/api/user/${userId}/followed/status`,
    null,
    { headers: authHeader() }
  );
  return !!res?.is_following;
}

export async function getUnreadCount(): Promise<UnreadCountResponse | null> {
  return await fetch.get<UnreadCountResponse | null>(`/api/notifications/unread-count`, {
    headers: authHeader(),
  });
}

export async function markNotificationsAsRead(): Promise<any> {
  return await fetch.post<{}, any>(`/api/notifications/mark-as-read`, {}, {
    headers: {
      ...(authHeader() ?? {}),
      "Content-Type": "application/json",
    },
  });
}

// ====== フォロー関連 ======
export interface FollowUser {
  id: string;
  name: string;
  introduction: string;
  profilePhotoUrl: string;
  follow: number;
  follower: number;
  is_friend: boolean;
}

export interface FollowersResponse {
  success: boolean;
  message: string | string[];
  followers: FollowUser[];
}

export interface FollowedResponse {
  success: boolean;
  message: string | string[];
  followed: FollowUser[];
}

export async function getFollowers(userId: string): Promise<FollowersResponse | null> {
  return await fetch.post<null, FollowersResponse | null>(
    `/api/user/${userId}/followers`,
    null,
    {
      headers: {
        ...(authHeader() ?? {}),
        "Content-Type": "application/json",
      },
    }
  );
}

export async function getFollowed(userId: string): Promise<FollowedResponse | null> {
  return await fetch.post<null, FollowedResponse | null>(
    `/api/user/${userId}/followed`,
    null,
    {
      headers: {
        ...(authHeader() ?? {}),
        "Content-Type": "application/json",
      },
    }
  );
}

// ====== プロフィール更新 ======
export interface UpdateUserProfileRequest {
  name: string;
  bio: string;
  profilePhotoUrl: string;
}
export interface UpdateUserProfileResponse {
  success: boolean;
  message: string[];
}
export async function updateUserProfile(params: UpdateUserProfileRequest): Promise<UpdateUserProfileResponse> {
  return await fetch.post<UpdateUserProfileRequest, UpdateUserProfileResponse>(
    "/api/user/update",
    params,
    {
      headers: {
        ...(authHeader() ?? {}),
        "Content-Type": "application/json",
      },
    }
  );
}
