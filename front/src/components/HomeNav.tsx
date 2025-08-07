"use client";
import React, { use, useEffect } from 'react';
import { House, Users, Plus, Bell } from 'lucide-react';
import { UserIcon } from './UserIcon';
import { getUserAuthStatus } from '@/requests/user';
import { useAtom } from 'jotai';
import { userAtom } from '@/atoms/user';
import { useRouter } from 'next/navigation';

export const HomeNav = () => {
    const [user, setUser] = useAtom(userAtom);
    const router = useRouter();
    
    useEffect(() => {
    async function checkAuth() {
       try {
        const userStatus = await getUserAuthStatus();
        if (userStatus?.isLoggedIn){
           setUser(userStatus.user);
        } else {
           // 認証されていない場合、ホーム系ページからログインページにリダイレクト
           if (window.location.pathname.startsWith('/home') || window.location.pathname.startsWith('/user')) {
               router.push('/login');
           }
        }
       } catch (error) {
           console.error('認証チェックエラー:', error);
           router.push('/login');
       }
    }
    checkAuth();
   }, [router, setUser]);
   
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white z-50">
      <div className="flex justify-around items-center h-16">
        <House className="w-6 h-6" />
        <Users className="w-6 h-6" />
        <Plus className="w-6 h-6" />
        <Bell className="w-6 h-6" />
        <UserIcon />
      </div>
    </nav>
  );
};
