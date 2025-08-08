"use client";
import * as fetch from "@/utils/fetch";
import type { AuthStatus, Activity, UserProfile } from "@/types/user";

export async function getUserAuthStatus(): Promise<AuthStatus | null> {
    const token = window.localStorage.getItem("access_token") || "";
    return await fetch.post<null, AuthStatus | null>(`/api/auth/status`, null, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

export async function getUserActivities(userId: string): Promise<Activity[]> {
    const token = window.localStorage.getItem("access_token") || "";
    return await fetch.get<Activity[]>(`/api/user/${userId}/activities`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    const token = window.localStorage.getItem("access_token") || "";
    return await fetch.get<UserProfile>(`/api/user/${userId}/profile`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}
