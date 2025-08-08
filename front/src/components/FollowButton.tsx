import React from "react";
import { useState } from "react";

const FollowButton = () => {
  const [isFollowed, setIsFollowed] = useState(false);
  return (
    <button
      className="w-20 h-6 rounded-full text-sm bg-black text-white hover:opacity-80 shrink-0"
      onClick={() => setIsFollowed((prev) => !prev)}
    >
      {isFollowed ? "フォロー中" : "フォロー"}
    </button>
  );
};

export default FollowButton;
