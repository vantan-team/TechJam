import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { Button } from "./ui/button";

const ListHeader = ({ title }: { title: string }) => {
  const router = useRouter();

  return (
    <header className="flex items-center pt-10  bg-gradient-to-br from-gray-50 to-gray-100">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="mr-2 text-gray-600 hover:text-[#A90017] hover:bg-[#A90017]/10 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        {title}
      </h1>
    </header>
  );
};

export default ListHeader;
