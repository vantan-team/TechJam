"use client";

import React from "react";
import { UserAvater } from "@/components/UserAvater";
import ListHeader from "@/components/ListHeader";

const followered = () => {
  return (
    <>
      <ListHeader title="フォロワー" />
      <UserAvater slug="true" />
    </>
  );
};

export default followered;
