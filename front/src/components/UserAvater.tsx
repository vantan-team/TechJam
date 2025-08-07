"use client";
import React, { useEffect, useState } from "react";
import FollowButton from "./FollowButton";
import { UserIcon } from "./UserIcon";
import { initData } from "@/lib/seeds";

type User = {
  name: string;
  icon: string;
};

type Props = {
  slug?: string;
};

export const UserAvater = ({ slug }: Props) => {
  //   const [users, setUsers] = useState<User[]>([]);
  //   useEffect(() => {
  //     const fetchUsers = async () => {
  //       try {
  //         const res = await fetch("/api/users"); // 相対パス or 絶対URL
  //         if (!res.ok) throw new Error("データの取得に失敗しました");
  //         const data: User[] = await res.json();
  //         setUsers(data);
  //       } catch (error) {
  //         console.error("Fetch error:", error);
  //       } finally {
  //         console.log("success");
  //       }
  //       fetchUsers();
  //     };
  //   }, []);

  return (
    <>
      <ul className="space-y-2 max-h-[450px] overflow-y-auto rounded-md p-2 mt-16 border w-[80%] mx-auto">
        {initData.map((data) => {
          return (
            <li
              className="flex items-center px-4 py-2 border-b h-[55px] w-[80%] mx-auto border-gray-400 gap-4"
              key={data.name}
            >
              <div className="flex-1">
                <UserIcon icon={data.icon} />
              </div>

              <h2 className="flex-1">{data.name}</h2>
              {slug ? (
                <div>
                  <FollowButton />
                </div>
              ) : (
                ""
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
};
