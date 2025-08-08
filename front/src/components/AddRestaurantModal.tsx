'use client';

import { useState } from 'react';
import { Search, Plus, Star } from 'lucide-react';

interface AddRestaurantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (restaurantData: any) => void;
  guidebookTitle: string;
}

export default function AddRestaurantModal({ isOpen, onClose, onSubmit, guidebookTitle }: AddRestaurantModalProps) {
  const [step, setStep] = useState<'search' | 'details'>('search');
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [rating, setRating] = useState(3);
  const [memo, setMemo] = useState('');
  const [visitedAt, setVisitedAt] = useState(new Date().toISOString().split('T')[0]);

  // モック検索結果
  const searchResults = [
    { id: 1, name: 'スシロー 渋谷店', address: '東京都渋谷区', category: '寿司', source: 'hotpepper' },
    { id: 2, name: 'マクドナルド 新宿店', address: '東京都新宿区', category: 'ファストフード', source: 'history' }
  ];

  const handleSubmit = () => {
    onSubmit({
      restaurant: selectedRestaurant,
      rating,
      memo,
      visitedAt
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto sm:overflow-hidden sm:rounded-3xl sm:max-w-md shadow-none sm:shadow-xl border-0 sm:border border-gray-100">
        {/* ヘッダー */}
        <div className="bg-[#A90017] text-white p-6 sm:p-10">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4" style={{fontFamily: '"Playfair Display", serif'}}>
              {guidebookTitle}にレストランを追加
            </h2>
            <p className="text-white/90 text-base sm:text-lg leading-relaxed mx-auto">
              {step === 'search' ? '追加するレストランを検索してください' : '訪問詳細を入力してください'}
            </p>
          </div>
        </div>

        {step === 'search' ? (
          /* レストラン検索ステップ */
          <div className="p-6 sm:p-10 space-y-6 sm:space-y-10">
            {/* 検索バー */}
            <div className="relative">
              <Search className="absolute left-4 top-4 h-5 w-5 text-[#8b7355]" />
              <input
                type="text"
                placeholder="レストラン名で検索"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-xl focus:border-[#A90017] focus:ring-2 focus:ring-[#A90017]/20 text-base font-medium text-[#2c1810] transition-colors"
              />
            </div>

            {/* 検索結果 */}
            <div className="space-y-4 max-h-[60vh] sm:max-h-64 overflow-y-auto">
              {searchResults.map((restaurant) => (
                <div
                  key={restaurant.id}
                  onClick={() => setSelectedRestaurant(restaurant)}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    selectedRestaurant?.id === restaurant.id
                      ? 'border-[#A90017] bg-[#A90017]/5 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-[#A90017] hover:shadow-md'
                  }`}
                >
                  <h3 className="font-bold text-[#2c1810] text-lg mb-2" style={{fontFamily: '"Playfair Display", serif'}}>
                    {restaurant.name}
                  </h3>
                  <p className="text-sm text-[#8b7355] font-medium mb-3">{restaurant.address}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#5a4a3a] font-medium">{restaurant.category}</span>
                    <span className="text-xs px-3 py-2 rounded-full bg-[#A90017]/10 border border-[#A90017]/30 text-[#A90017] font-semibold">
                      {restaurant.source === 'hotpepper' ? 'ホットペッパー' : '訪問履歴'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* アクションボタン */}
            <div className="flex gap-6">
              <button
                onClick={onClose}
                className="flex-1 py-4 px-6 border border-gray-300 bg-white rounded-xl font-bold text-[#5a4a3a] hover:bg-gray-50 transition-colors"
                style={{
                  fontFamily: '"Playfair Display", serif'
                }}
              >
                キャンセル
              </button>
              <button
                onClick={() => setStep('details')}
                disabled={!selectedRestaurant}
                className="flex-1 py-4 px-6 bg-[#A90017] text-white rounded-xl font-bold hover:bg-[#940014] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                style={{
                  fontFamily: '"Playfair Display", serif'
                }}
              >
                詳細入力へ
              </button>
            </div>
          </div>
        ) : (
          /* 詳細入力ステップ */
          <div className="p-6 sm:p-10 space-y-6 sm:space-y-10">
            {/* 選択されたレストラン */}
            <div className="bg-[#A90017]/5 rounded-xl p-6 border-2 border-[#A90017] shadow-sm">
              <h3 className="font-bold text-[#2c1810] text-lg mb-2" style={{fontFamily: '"Playfair Display", serif'}}>
                {selectedRestaurant?.name}
              </h3>
              <p className="text-sm text-[#8b7355] font-medium">{selectedRestaurant?.address}</p>
            </div>

            {/* 評価 */}
            <div>
              <label className="block text-lg sm:text-xl font-bold text-[#2c1810] mb-6" style={{fontFamily: '"Playfair Display", serif'}}>
                ミシュラン評価（★１: 普通、★２: 良い、★３: 最高）
              </label>
              <div className="flex gap-4">
                {[1, 2, 3].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`flex items-center justify-center w-16 h-16 rounded-xl border-2 transition-all duration-200 ${
                      rating >= star
                        ? 'border-[#A90017] bg-[#A90017]/5 text-[#A90017] shadow-sm'
                        : 'border-gray-300 bg-white text-[#8b7355] hover:border-[#A90017]'
                    }`}
                  >
                    <Star className={`w-7 h-7 ${rating >= star ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* 訪問日 */}
            <div>
              <label className="block text-lg sm:text-xl font-bold text-[#2c1810] mb-6" style={{fontFamily: '"Playfair Display", serif'}}>
                訪問日
              </label>
              <input
                type="date"
                value={visitedAt}
                onChange={(e) => setVisitedAt(e.target.value)}
                className="w-full py-4 px-4 bg-white border border-gray-300 rounded-xl focus:border-[#A90017] focus:ring-2 focus:ring-[#A90017]/20 text-base font-medium text-[#2c1810] transition-colors"
              />
            </div>

            {/* メモ */}
            <div>
              <label className="block text-lg sm:text-xl font-bold text-[#2c1810] mb-6" style={{fontFamily: '"Playfair Display", serif'}}>
                メモ・感想
              </label>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                rows={4}
                className="w-full py-4 px-4 bg-white border border-gray-300 rounded-xl focus:border-[#A90017] focus:ring-2 focus:ring-[#A90017]/20 resize-none text-base font-medium text-[#2c1810] transition-colors leading-relaxed"
                placeholder="美味しかった！また行きたい。特におすすめは..."
              />
            </div>

            {/* アクションボタン */}
            <div className="flex gap-6">
              <button
                onClick={() => setStep('search')}
                className="flex-1 py-4 px-6 border border-gray-300 bg-white rounded-xl font-bold text-[#5a4a3a] hover:bg-gray-50 transition-colors"
                style={{
                  fontFamily: '"Playfair Display", serif'
                }}
              >
                戻る
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-4 px-6 bg-[#A90017] text-white rounded-xl font-bold hover:bg-[#940014] transition-colors"
                style={{
                  fontFamily: '"Playfair Display", serif'
                }}
              >
                追加する
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}