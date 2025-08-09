"use client";

import React, { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { userAtom } from "@/atoms/user";
import { Button } from "./ui/button";
import { Users } from "lucide-react";
import {
  followUser,
  getUserFollowStatus,
  type FollowUser,
} from "@/requests/user";
import { useRouter } from "next/navigation";

interface FollowListProps {
  users: FollowUser[];
  isLoading: boolean;
  error: string | null;
  onFollowUpdate: (userId: string, isFollowing: boolean) => void;
}

const FollowList: React.FC<FollowListProps> = ({
  users,
  isLoading,
  error,
  onFollowUpdate,
}) => {
  const [currentUser] = useAtom(userAtom);
  const [followingStatus, setFollowingStatus] = useState<{
    [key: string]: boolean;
  }>({});
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const router = useRouter();

  // 各ユーザーのフォロー状態を取得
  useEffect(() => {
    const loadFollowingStatus = async () => {
      const statusMap: { [key: string]: boolean } = {};

      for (const user of users) {
        if (currentUser?.id?.toString() !== user.id) {
          try {
            const isFollowing = await getUserFollowStatus(user.id);
            statusMap[user.id] = isFollowing;
          } catch (error) {
            console.error(
              `Failed to get follow status for user ${user.id}:`,
              error
            );
            statusMap[user.id] = false;
          }
        }
      }

      setFollowingStatus(statusMap);
    };

    if (users.length > 0) {
      loadFollowingStatus();
    }
  }, [users, currentUser]);

  const handleUserClick = (user: any) => {
    if (user.id) {
      router.push(`/user/${user.id}`);
    }
  };

  const handleFollowToggle = async (user: FollowUser) => {
    if (processingIds.has(user.id) || currentUser?.id?.toString() === user.id)
      return;

    const isCurrentlyFollowing = followingStatus[user.id] || false;
    const nextType = isCurrentlyFollowing ? "unfollow" : "follow";

    setProcessingIds((prev) => new Set(prev).add(user.id));

    try {
      const response = await followUser({
        follow_user_id: Number(user.id),
        type: nextType,
      });

      if (response?.success) {
        const newFollowingState = !isCurrentlyFollowing;
        setFollowingStatus((prev) => ({
          ...prev,
          [user.id]: newFollowingState,
        }));

        onFollowUpdate(user.id, newFollowingState);
      }
    } catch (error) {
      console.error("Failed to update follow status:", error);
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(user.id);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-[#A90017] rounded-full animate-spin"></div>
            読み込み中...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="text-center text-red-500 py-12">
          <Users className="w-12 h-12 mx-auto mb-3 text-red-300" />
          <p className="text-lg font-medium mb-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      {users.length > 0 ? (
        <div className="space-y-3 max-h-[calc(100vh-120px)] overflow-y-auto">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center p-4 bg-white/60 hover:bg-white/90 rounded-lg border border-gray-200/50 shadow-sm transition-all duration-200 transform hover:scale-[1.01] hover:shadow-md"
              onClick={() => handleUserClick(user)}
            >
              {/* アバター */}
              <div className="flex-shrink-0 mr-4">
                {user.profilePhotoUrl ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_ROOT}${user.profilePhotoUrl}`}
                      alt={user.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        (
                          e.currentTarget.nextElementSibling as HTMLElement
                        )?.classList.remove("hidden");
                        (
                          e.currentTarget.nextElementSibling as HTMLElement
                        )?.classList.add("flex");
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

              {/* ユーザー情報 */}
              <div className="flex-grow">
                <h2 className="text-gray-900 font-medium text-sm">
                  {user.name}
                </h2>
                {user.introduction && (
                  <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                    {user.introduction}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-gray-500">
                    フォロワー {user.follower}
                  </span>
                  <span className="text-xs text-gray-500">
                    フォロー中 {user.follow}
                  </span>
                  {user.is_friend && (
                    <span className="text-xs text-green-600 font-medium">
                      友達
                    </span>
                  )}
                </div>
              </div>

              {/* フォローボタン */}
              <div className="flex-shrink-0">
                {currentUser?.id?.toString() !== user.id && (
                  <Button
                    size="sm"
                    disabled={processingIds.has(user.id)}
                    onClick={() => handleFollowToggle(user)}
                    variant={followingStatus[user.id] ? "outline" : "default"}
                    className={`transition-all duration-200 transform hover:scale-[1.02] ${
                      followingStatus[user.id]
                        ? "border-[#A90017] text-[#A90017] hover:bg-[#A90017] hover:text-white"
                        : "bg-[#A90017] hover:bg-[#940014] text-white"
                    }`}
                  >
                    {processingIds.has(user.id) ? (
                      <div className="w-3 h-3 border border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                    ) : followingStatus[user.id] ? (
                      "フォロー中"
                    ) : (
                      "フォロー"
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-12">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium mb-2">ユーザーが見つかりません</p>
          <p className="text-sm">まだフォロー関係がありません</p>
        </div>
      )}
    </div>
  );
};

export default FollowList;
