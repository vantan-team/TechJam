"use client";
import * as fetch from "@/utils/fetch";
import type { AuthStatus } from "@/types/user";

export async function getUserAuthStatus(): Promise<AuthStatus | null> {
    const token = window.localStorage.getItem("access_token") || "";
    return await fetch.post<null, AuthStatus | null>(`/api/auth/status`, null, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}