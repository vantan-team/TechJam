"use client";

import React from 'react'
import { useAtom } from 'jotai';
import { userAtom } from '@/atoms/user';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export const UserIcon = () => {
  const [ user,] = useAtom(userAtom);
  return (
    // <img src={user?.profilePhotoUrl} alt="ユーザーのプロフィール写真" />
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" />
      <AvatarFallback>US</AvatarFallback>
    </Avatar>
  )
}
