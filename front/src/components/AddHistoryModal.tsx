'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { searchRestaurants } from '@/requests/restaurant';
import { addVisitedHistory } from '@/requests/user';
import type { Restaurant } from '@/types/restaurant';

interface AddHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHistoryAdded: () => void;
}

export default function AddHistoryModal({ isOpen, onClose, onHistoryAdded }: AddHistoryModalProps) {
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<Restaurant[]>([]);
  const [selectedShop, setSelectedShop] = useState<Restaurant | null>(null);
  const [visitedAt, setVisitedAt] = useState<Date | undefined>(new Date());
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (keyword.length > 1) {
      const handler = setTimeout(() => {
        searchRestaurants(keyword).then(data => {
          setSearchResults(data.shops);
        });
      }, 500);
      return () => clearTimeout(handler);
    } else {
      setSearchResults([]);
    }
  }, [keyword]);

  const handleSubmit = async () => {
    if (!selectedShop || !visitedAt) {
      alert('店舗と訪問日を選択してください。');
      return;
    }
    setLoading(true);
    try {
      await addVisitedHistory({
        hotpepper_id: selectedShop.hotpepper_id as string,
        visited_at: visitedAt.toISOString().split('T')[0],
        memo,
      });
      onHistoryAdded();
      onClose();
    } catch (error) {
      console.error('来店履歴の追加に失敗しました:', error);
      alert('来店履歴の追加に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
  <DialogContent className="max-h-[80vh] overflow-y-auto overflow-x-hidden min-w-0">
        <DialogHeader>
          <DialogTitle>来店履歴を追加</DialogTitle>
        </DialogHeader>
        
        {!selectedShop ? (
          <div className="space-y-4 min-w-0 w-full max-w-full">
            <div className="min-w-0 w-full max-w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">店舗検索</label>
              <Input
                placeholder="店舗名で検索..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full min-w-0 max-w-full"
              />
            </div>
            <div className="max-h-48 overflow-y-auto overflow-x-auto rounded-md border border-gray-200 bg-gray-50 divide-y min-w-0 w-full max-w-full">
              {searchResults.length === 0 && keyword.length > 1 ? (
                <div className="p-4 text-center text-gray-400 text-sm">該当する店舗がありません</div>
              ) : (
                searchResults.map(shop => (
                  <div
                    key={shop.id}
                    onClick={() => setSelectedShop(shop)}
                    className="p-3 hover:bg-[#F3E8EA] cursor-pointer transition-colors flex items-center flex-nowrap min-w-0"
                  >
                    <span className="font-medium text-gray-800 truncate min-w-0 max-w-[60%]">{shop.name}</span>
                    {shop.address && (
                      <span className="ml-2 text-xs text-gray-500 truncate min-w-0">{shop.address}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="relative bg-gray-50 rounded-lg border border-gray-200 p-4 mb-4 min-w-0 w-full max-w-full">
            <button
              className="absolute top-2 right-2 text-xs text-[#A90017] underline hover:text-[#940014]"
              onClick={() => setSelectedShop(null)}
              type="button"
            >
              店舗を再選択
            </button>
            <div className="mb-3 min-w-0 w-full max-w-full">
              <label className="block text-xs text-gray-500 mb-1">選択中の店舗</label>
              <div className="font-semibold text-gray-900 text-base truncate min-w-0 w-full max-w-full">{selectedShop.name}</div>
              {selectedShop.address && (
                <div className="text-xs text-gray-500 mt-1 truncate min-w-0 w-full max-w-full">{selectedShop.address}</div>
              )}
            </div>
            <div className="mb-3 min-w-0 w-full max-w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">訪問日</label>
              <DatePicker date={visitedAt} setDate={setVisitedAt} />
            </div>
            <div className="min-w-0 w-full max-w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">メモ (任意)</label>
              <Textarea
                placeholder="例: 友人とランチで利用、美味しかった！"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="w-full min-w-0 max-w-full"
              />
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-row gap-2 mt-2 min-w-0 w-full max-w-full">
          <Button variant="outline" onClick={onClose} className="flex-1 min-w-0 w-full max-w-full">キャンセル</Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedShop || !visitedAt || loading}
            className="flex-1 bg-[#A90017] hover:bg-[#940014] text-white min-w-0 w-full max-w-full"
          >
            {loading ? '追加中...' : '追加'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
