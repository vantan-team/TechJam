"use client";

import React from "react";
import { useAtom } from "jotai";
import { userAtom } from "@/atoms/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

export const UserIcon = ({
  icon,
}: {
  icon?: string;
  children?: React.ReactNode;
}) => {
  const [user] = useAtom(userAtom);

  return (
    <Link
      href={user?.id ? `/user/${user.id}` : "/"}
      className="flex items-center justify-center"
    >
      <Avatar>
        <AvatarImage src={icon || user?.profilePhotoUrl} />
        <AvatarFallback>
          {user?.name?.charAt(0) || "U"}
        </AvatarFallback>
      </Avatar>
    </Link>
  );
};
