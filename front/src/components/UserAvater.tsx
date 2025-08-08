"use client";
import React, { useState } from "react";
import FollowButton from "./FollowButton";
import { initData } from "@/lib/seeds";
import { Button } from "./ui/button";
import { deleteFriend } from "@/requests/user";
import { Trash2 } from "lucide-react";

type User = {
  id: number;
  friendship_id?: number;
  name: string;
  email: string;
  profile_photo_url: string | null;
  friend_status?: 'none' | 'pending' | 'accepted';
  joined_at?: string;
};

type Props = {
  slug?: string;
  friends?: User[];
  onFriendDeleted?: (friendId: number) => void;
};

export const UserAvater = ({ slug, friends, onFriendDeleted }: Props) => {
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
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

  const handleDeleteFriend = async (user: User) => {
    if (deletingIds.has(user.id)) return;
    
    // friendship_idがない場合はエラー
    if (!user.friendship_id) {
      console.error('friendship_id is missing for user:', user);
      return;
    }
    
    setDeletingIds(prev => new Set(prev).add(user.id));
    try {
      const response = await deleteFriend(user.friendship_id);
      if (response?.success) {
        onFriendDeleted?.(user.id);
      }
    } catch (error) {
      console.error('Failed to delete friend:', error);
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(user.id);
        return newSet;
      });
    }
  };

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
                      src={`${process.env.NEXT_PUBLIC_API_ROOT}${user.profile_photo_url}`}
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
              </div>
              
              {slug ? (
                <div className="flex-shrink-0">
                  <FollowButton />
                </div>
              ) : (
                <div className="flex-shrink-0">
                  {friends && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={deletingIds.has(user.id)}
                      onClick={() => handleDeleteFriend(user)}
                      className="border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 transform hover:scale-[1.02]"
                    >
                      {deletingIds.has(user.id) ? (
                        <div className="w-3 h-3 border border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                    </Button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
