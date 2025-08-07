"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const UserIcon = ({
  icon,
}: {
  icon: string;
  childeren?: React.ReactNode;
}) => {
  return (
    // <img src={user?.profilePhotoUrl} alt="ユーザーのプロフィール写真" />
    <Avatar>
      <AvatarImage src={icon} />
      <AvatarFallback>US</AvatarFallback>
    </Avatar>
  );
};
