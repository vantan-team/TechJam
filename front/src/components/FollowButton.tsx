import React from "react";
import { useState } from "react";
import { Button } from "./ui/button";

const FollowButton = () => {
  const [isFollowed, setIsFollowed] = useState(false);
  return (
    <Button
      size="sm"
      onClick={() => setIsFollowed((prev) => !prev)}
      className={`text-white transition-all duration-200 transform hover:scale-[1.02] ${
        isFollowed ? 'bg-gray-600 hover:bg-gray-700' : ''
      }`}
      style={!isFollowed ? {
        backgroundColor: "#A90017",
        borderColor: "#A90017"
      } : undefined}
      onMouseEnter={(e) => {
        if (!isFollowed) {
          e.currentTarget.style.backgroundColor = "#940014";
        }
      }}
      onMouseLeave={(e) => {
        if (!isFollowed) {
          e.currentTarget.style.backgroundColor = "#A90017";
        }
      }}
    >
      {isFollowed ? "フォロー中" : "フォロー"}
    </Button>
  );
};

export default FollowButton;
