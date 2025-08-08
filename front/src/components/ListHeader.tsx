import { ChevronLeft } from "lucide-react";

import React from "react";

const ListHeader = ({ title }: { title: string }) => {
  return (
    <header className="flex pt-10 mb-5 text-2xl">
      <span className="ml-3 mr-4 mt-1">
        <ChevronLeft />
      </span>
      <h1>{title}</h1>
    </header>
  );
};

export default ListHeader;
