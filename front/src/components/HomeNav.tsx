"use client";
import React, { useEffect } from 'react';
import { House, Users, Plus, Bell } from 'lucide-react';
import { UserIcon } from './UserIcon';
import { getUserAuthStatus } from '@/requests/user';
import { useAtom } from 'jotai';
import { userAtom } from '@/atoms/user';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export const HomeNav = () => {
    const [user, setUser] = useAtom(userAtom);
    const router = useRouter();
    const pathname = usePathname();
    
    useEffect(() => {
    async function checkAuth() {
       const user =  await getUserAuthStatus();
       if (user?.isLoggedIn){
          setUser(user.user);
          router.push('/home');
       }else {
        if (window.location.pathname !== '/') {
            router.push('/');
        }
       }
    }
    checkAuth();
   }, [router, setUser]);
   
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white z-50">
      <div className="flex justify-around items-center h-16">
        <Link href="/home" className="flex items-center justify-center">
          <House className={`w-6 h-6 ${pathname === '/home' ? 'text-[#A90017]' : 'text-gray-600'}`} />
        </Link>
        <Link href="/friends" className="flex items-center justify-center">
          <Users className={`w-6 h-6 ${pathname === '/friends' ? 'text-[#A90017]' : 'text-gray-600'}`} />
        </Link>
        <Plus className={`w-6 h-6 ${pathname === '/create' ? 'text-[#A90017]' : 'text-gray-600'}`} />
        <Link href="/notifications" className="flex items-center justify-center">
          <Bell className={`w-6 h-6 ${pathname === '/notifications' ? 'text-[#A90017]' : 'text-gray-600'}`} />
        </Link>
        <UserIcon />
      </div>
    </nav>
  );
};
