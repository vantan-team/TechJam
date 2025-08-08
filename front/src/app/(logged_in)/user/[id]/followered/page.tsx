"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ListHeader from "@/components/ListHeader";
import { getFollowers, type FollowUser } from "@/requests/user";
import FollowList from "@/components/FollowList";

const Followered = () => {
  const params = useParams();
  const userId = params.id as string;
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFollowers = async () => {
      try {
        setIsLoading(true);
        const response = await getFollowers(userId);
        if (response?.success) {
          setFollowers(response.followers);
        } else {
          const errorMessage = response?.message || "フォロワーリストの取得に失敗しました";
          setError(errorMessage);
        }
      } catch (error) {
        console.error("Failed to load followers:", error);
        setError("フォロワーリストの取得に失敗しました");
      } finally {
        setIsLoading(false);
      }
    };

    loadFollowers();
  }, [userId]);

  const handleFollowUpdate = (userId: string, isFollowing: boolean) => {
    // フォロー状態が更新された時の処理（必要に応じて）
    console.log(`User ${userId} follow status: ${isFollowing}`);
  };

  return (
    <>
      <ListHeader title="フォロワー" />
      <FollowList 
        users={followers}
        isLoading={isLoading}
        error={error}
        onFollowUpdate={handleFollowUpdate}
      />
    </>
  );
};

export default Followered;
