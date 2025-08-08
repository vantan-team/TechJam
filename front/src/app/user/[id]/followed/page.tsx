"use client";

import React from "react";
import { UserAvater } from "@/components/UserAvater";
import ListHeader from "@/components/ListHeader";

const friendList = () => {
  return (
    <>
      <ListHeader title="フォロー中" />
      <UserAvater slug="true" />
    </>
  );
};

export default friendList;
