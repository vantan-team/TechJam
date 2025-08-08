"use client";

import React from 'react'
import { useAtom } from 'jotai';
import { userAtom } from '@/atoms/user';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from 'next/link';

export const UserIcon = () => {
  const [ user,] = useAtom(userAtom);
  return (
    // <img src={user?.profilePhotoUrl} alt="ユーザーのプロフィール写真" />
    <Link href={`/user/${user?.id}`} className="flex items-center justify-center">
      <Avatar>
        <AvatarImage src={user?.profilePhotoUrl} />
        <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
      </Avatar>
    </Link>
  )
}
