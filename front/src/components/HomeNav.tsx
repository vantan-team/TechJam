"use client";

import React, { useEffect, useState } from "react";
import { House, Users, Plus, Bell } from "lucide-react";
import { UserIcon } from "./UserIcon";
import { getUserAuthStatus } from "@/requests/user";
import { useAtom } from "jotai";
import { userAtom } from "@/atoms/user";
import { useRouter, usePathname } from "next/navigation";
import { unreadCountAtom } from "@/atoms/notification";
import Link from "next/link";

export const HomeNav = () => {
  const [user, setUser] = useAtom(userAtom);
  const router = useRouter();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useAtom(unreadCountAtom);

  // ★ 追加：マウント済みフラグ（SSR/初回描画のズレ防止）
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function checkAuth() {
      try {
        const userStatus = await getUserAuthStatus();
        if (userStatus?.isLoggedIn) {
          setUser(userStatus.user);
        } else {
          // window を使わず pathname で判定（SSR安全 & ルータ一貫）
          if (pathname?.startsWith("/home") || pathname?.startsWith("/user")) {
            router.push("/login");
          }
        }
      } catch (error) {
        console.error("認証チェックエラー:", error);
        router.push("/login");
      }
    }
    checkAuth();
  }, [router, setUser, pathname]);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      // localStorage 参照はクライアントのみだが、mounted 後ならより安全
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("access_token")
          : null;
      if (!token) return;
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_ROOT}/api/notifications/unread-count`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.data.unread_count ?? 0);
        }
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    };

    fetchUnreadCount();

    // ポーリングを10秒間隔で実行
    const interval = setInterval(fetchUnreadCount, 10000);

    return () => clearInterval(interval);
  }, [setUnreadCount]);

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white z-50 ">
      <div className="flex justify-around items-center h-16">
        <Link
          href="/home"
          className={`flex flex-col items-center justify-center p-2 rounded-full transition-all duration-200 transform hover:scale-[1.1] hover:bg-[#A90017]/10 ${
            isActive("/home") ? "text-[#A90017]" : "text-gray-600"
          }`}
        >
          <House className="w-6 h-6" />
        </Link>

        <Link
          href="/user/friends"
          className={`flex flex-col items-center justify-center p-2 rounded-full transition-all duration-200 transform hover:scale-[1.1] hover:bg-[#A90017]/10 ${
            isActive("/user/friends") ? "text-[#A90017]" : "text-gray-600"
          }`}
        >
          <Users className="w-6 h-6" />
        </Link>

        <Link
          href="/add-to-guide"
          className={`group flex flex-col items-center justify-center p-2 rounded-full transition-all duration-200 ${
            isActive("/add-to-guide") ? "text-[#A90017]" : "text-gray-600"
          }`}
        >
          <span
            className={`grid place-items-center h-12 w-12 rounded-full shadow-sm ring-1 ring-[#A90017]/20 transition-all duration-200
      ${
        isActive("/add-to-guide")
          ? "bg-[#A90017]/90 text-white shadow-[#A90017]/30"
          : "bg-[#A90017]/90 text-white"
      }
      group-hover:scale-105 group-hover:bg-[#A90017]/10 group-hover:text-[#A90017] group-hover:shadow-md`}
          >
            <Plus className="w-6 h-6" />
          </span>
        </Link>

        <Link
          href="/notifications"
          className={`relative p-2 rounded-full transition-all duration-200 transform hover:scale-[1.1] hover:bg-[#A90017]/10 ${
            isActive("/notifications") ? "text-[#A90017]" : "text-gray-600"
          }`}
        >
          <Bell className="w-6 h-6" />
          {/* ★ 重要：マウント後にだけバッジを出す */}
          {mounted && unreadCount > 0 && (
            <span
              // テキスト差分での警告が出る場合の最終手段（乱用NG）
              suppressHydrationWarning
              className="absolute top-0 right-0 inline-flex items-center justify-center h-4 w-4 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-[#A90017] rounded-full"
            >
              {unreadCount}
            </span>
          )}
        </Link>
        <UserIcon />
      </div>
    </nav>
  );

};
