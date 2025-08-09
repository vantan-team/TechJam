"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ListHeader from "@/components/ListHeader";
import { getFollowed, type FollowUser } from "@/requests/user";
import FollowList from "@/components/FollowList";

const Followed = () => {
  const params = useParams();
  const userId = params.id as string;
  const [followedUsers, setFollowedUsers] = useState<FollowUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFollowed = async () => {
      try {
        setIsLoading(true);
        const response = await getFollowed(userId);
        if (response?.success) {
          setFollowedUsers(response.followed);
        } else {
          const errorMessage:any = response?.message || "フォロー中リストの取得に失敗しました";
          setError(errorMessage);
        }
      } catch (error) {
        console.error("Failed to load followed users:", error);
        setError("フォロー中リストの取得に失敗しました");
      } finally {
        setIsLoading(false);
      }
    };

    loadFollowed();
  }, [userId]);

  const handleFollowUpdate = (userId: string, isFollowing: boolean) => {
    // フォロー状態が更新された時の処理
    setFollowedUsers(prev => 
      prev.map(user => 
        user.id === userId 
          ? { ...user, follower: isFollowing ? user.follower + 1 : user.follower - 1 }
          : user
      )
    );
  };

  return (
    <>
      <ListHeader title="フォロー中" />
      <FollowList 
        users={followedUsers}
        isLoading={isLoading}
        error={error}
        onFollowUpdate={handleFollowUpdate}
      />
    </>
  );
};

export default Followed;
