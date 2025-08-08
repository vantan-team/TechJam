"use client";

import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { initData } from "@/lib/seeds";

const dummyData = [
  "アップル",
  "バナナ",
  "グレープ",
  "オレンジ",
  "スイカ",
  "マンゴー",
  "キウイ",
];

export function SearchModal() {
  const [query, setQuery] = useState("");

  const filtered = initData.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Dialog>
      <div className="w-full max-w-md mx-auto px-4">
        <DialogTrigger asChild className="bg-gray-100">
          <Button variant="outline" className="w-full text-gray-500">
            フレンド検索
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent className="max-w-md">
        <h2 className="text-lg font-semibold mb-2">検索</h2>

        <Input
          placeholder="キーワードを入力"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <ul className="mt-4 space-y-2 max-h-48 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((item, index) => (
              <li
                key={index}
                className="px-3 py-2 bg-muted rounded text-sm hover:bg-accent cursor-pointer"
                onClick={() => {}}
              >
                {item.name}
              </li>
            ))
          ) : (
            <li className="text-gray-500 text-sm">
              該当するデータがありません
            </li>
          )}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
