"use client";

import React from "react";
import { UserAvater } from "@/components/UserAvater";
import ListHeader from "@/components/ListHeader";
import { SearchModal } from "@/components/SearchModal";

const friendList = () => {
  return (
    <>
      <ListHeader title="フレンドリスト" />
      <SearchModal />
      <UserAvater />
    </>
  );
};

export default friendList;
