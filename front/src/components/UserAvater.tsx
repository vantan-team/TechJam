"use client";
import React, { useEffect, useState } from "react";
import FollowButton from "./FollowButton";
import { initData } from "@/lib/seeds";

type User = {
  id: number;
  name: string;
  email: string;
  profile_photo_url: string | null;
  friend_status?: 'none' | 'pending' | 'accepted';
  joined_at?: string;
};

type Props = {
  slug?: string;
  friends?: User[];
};

export const UserAvater = ({ slug, friends }: Props) => {
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

  // Use friends prop if provided, otherwise fall back to dummy data
  const displayData = friends || initData.map(data => ({
    id: 0,
    name: data.name,
    email: '',
    profile_photo_url: data.icon,
    friend_status: 'accepted' as const
  }));

  return (
    <div className="p-4">
      <ul className="space-y-3 max-h-[450px] overflow-y-auto">
        {displayData.map((user) => {
          return (
            <li
              className="flex items-center p-4 bg-white/60 hover:bg-white/90 rounded-lg border border-gray-200/50 shadow-sm transition-all duration-200 transform hover:scale-[1.01] hover:shadow-md cursor-pointer"
              key={user.id || user.name}
            >
              <div className="flex-shrink-0 mr-4">
                {user.profile_photo_url ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                    <img 
                      src={user.profile_photo_url} 
                      alt={user.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden w-full h-full bg-gradient-to-br from-[#A90017] to-[#940014] items-center justify-center text-white font-semibold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#A90017] to-[#940014] flex items-center justify-center text-white font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex-grow">
                <h2 className="text-gray-900 font-medium text-sm">{user.name}</h2>
                <p className="text-gray-500 text-xs mt-1">
                  {user.email || ('joined_at' in user && user.joined_at) ? (user.email || `参加日: ${('joined_at' in user) ? user.joined_at : ''}`) : 'オンライン'}
                </p>
              </div>
              
              {slug ? (
                <div className="flex-shrink-0">
                  <FollowButton />
                </div>
              ) : (
                <div className="flex-shrink-0">
                  <button 
                    className="px-3 py-1 text-xs text-white rounded-md transition-all duration-200 hover:shadow-sm"
                    style={{
                      backgroundColor: '#A90017',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#940014';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#A90017';
                    }}
                  >
                    メッセージ
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
