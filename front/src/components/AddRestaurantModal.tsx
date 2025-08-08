'use client';

import { useState } from 'react';
import { Search, Plus, Star, Camera, Trash2 } from 'lucide-react';

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
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<string>('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualRestaurantName, setManualRestaurantName] = useState('');

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
      visitedAt,
      photo: selectedPhoto
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
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
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
            <div className="space-y-4 max-h-[40vh] overflow-y-auto">
              {searchResults.map((restaurant) => (
                <div
                  key={restaurant.id}
                  onClick={() => setSelectedRestaurant(restaurant)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    selectedRestaurant?.id === restaurant.id
                      ? 'border-[#A90017] bg-[#A90017]/5 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-[#A90017] hover:shadow-md'
                  }`}
                >
                  <h3 className="font-bold text-[#2c1810] text-base mb-1" style={{fontFamily: '"Playfair Display", serif'}}>
                    {restaurant.name}
                  </h3>
                  <p className="text-sm text-[#8b7355] font-medium mb-2">{restaurant.address}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#5a4a3a] font-medium">{restaurant.category}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-[#A90017]/10 border border-[#A90017]/30 text-[#A90017] font-semibold">
                      {restaurant.source === 'hotpepper' ? 'ホットペッパー' : '訪問履歴'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* または区切り線 */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">または</span>
              </div>
            </div>

            {/* 手動入力 */}
            {!showManualInput ? (
              <button
                onClick={() => setShowManualInput(true)}
                className="w-full p-3 border border-dashed border-[#A90017]/40 rounded-xl hover:border-[#A90017] transition-colors group"
              >
                <div className="flex items-center justify-center gap-2 text-gray-600 group-hover:text-gray-800">
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-medium">手動で店名を入力</span>
                </div>
              </button>
            ) : (
              <div className="p-4 border-2 border-[#A90017]/30 bg-white rounded-xl space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    店名 <span className="text-[#A90017]">*</span>
                  </label>
                  <input
                    type="text"
                    value={manualRestaurantName}
                    onChange={(e) => setManualRestaurantName(e.target.value)}
                    placeholder="レストラン名を入力"
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A90017]/20 focus:border-[#A90017] transition-colors text-sm"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowManualInput(false);
                      setManualRestaurantName('');
                    }}
                    className="flex-1 py-2 px-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={() => {
                      if (manualRestaurantName.trim()) {
                        setSelectedRestaurant({
                          id: 'manual-' + Date.now(),
                          name: manualRestaurantName.trim(),
                          address: '手動入力',
                          category: '手動入力',
                          source: 'manual'
                        });
                        setShowManualInput(false);
                      }
                    }}
                    disabled={!manualRestaurantName.trim()}
                    className="flex-1 py-2 px-3 bg-[#A90017] text-white rounded-lg hover:bg-[#940014] disabled:bg-gray-300 transition-colors text-sm"
                  >
                    追加
                  </button>
                </div>
              </div>
            )}

            {/* アクションボタン */}
            <div className="flex gap-3 sm:gap-4">
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 sm:py-4 sm:px-6 border border-gray-300 bg-white rounded-xl font-bold text-[#5a4a3a] hover:bg-gray-50 transition-colors text-sm sm:text-base"
                style={{
                  fontFamily: '"Playfair Display", serif'
                }}
              >
                キャンセル
              </button>
              <button
                onClick={() => setStep('details')}
                disabled={!selectedRestaurant}
                className="flex-1 py-3 px-4 sm:py-4 sm:px-6 bg-[#A90017] text-white rounded-xl font-bold hover:bg-[#940014] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
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
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* 選択されたレストラン */}
            <div className="bg-[#A90017]/5 rounded-xl p-6 border-2 border-[#A90017] shadow-sm">
              <h3 className="font-bold text-[#2c1810] text-lg mb-2" style={{fontFamily: '"Playfair Display", serif'}}>
                {selectedRestaurant?.name}
              </h3>
              <p className="text-sm text-[#8b7355] font-medium">{selectedRestaurant?.address}</p>
            </div>

            {/* 評価 */}
            <div>
              <label className="block text-base sm:text-lg font-bold text-[#2c1810] mb-4" style={{fontFamily: '"Playfair Display", serif'}}>
                ミシュラン評価（★１: 普通、★２: 良い、★３: 最高）
              </label>
              <div className="flex gap-3 sm:gap-4">
                {[1, 2, 3].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 transition-all duration-200 ${
                      rating >= star
                        ? 'border-[#A90017] bg-[#A90017]/5 text-[#A90017] shadow-sm'
                        : 'border-gray-300 bg-white text-[#8b7355] hover:border-[#A90017]'
                    }`}
                  >
                    <Star className={`w-6 h-6 sm:w-7 sm:h-7 ${rating >= star ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* 訪問日 */}
            <div>
              <label className="block text-base sm:text-lg font-bold text-[#2c1810] mb-3" style={{fontFamily: '"Playfair Display", serif'}}>
                訪問日
              </label>
              <input
                type="date"
                value={visitedAt}
                onChange={(e) => setVisitedAt(e.target.value)}
                className="w-full py-3 px-3 sm:py-4 sm:px-4 bg-white border border-gray-300 rounded-xl focus:border-[#A90017] focus:ring-2 focus:ring-[#A90017]/20 text-sm sm:text-base font-medium text-[#2c1810] transition-colors"
              />
            </div>

            {/* 写真アップロード */}
            <div>
              <label className="block text-base sm:text-lg font-bold text-[#2c1810] mb-3" style={{fontFamily: '"Playfair Display", serif'}}>
                写真（任意）
              </label>
              {selectedPhotoPreview && (
                <div className="flex justify-center mb-4">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-lg border border-gray-200 overflow-hidden relative">
                    <img 
                      src={selectedPhotoPreview} 
                      alt="preview" 
                      className="absolute inset-0 w-full h-full object-cover" 
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPhoto(null);
                        setSelectedPhotoPreview('');
                        if (selectedPhotoPreview) {
                          URL.revokeObjectURL(selectedPhotoPreview);
                        }
                      }}
                      className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1"
                      aria-label="画像を削除"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
              <label className="block w-full p-6 sm:p-8 border-2 border-dashed border-[#A90017]/40 rounded-xl hover:border-[#A90017] hover:bg-gray-50 transition-colors cursor-pointer group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedPhoto(file);
                      const url = URL.createObjectURL(file);
                      setSelectedPhotoPreview(url);
                    }
                  }}
                  className="hidden"
                />
                <div className="text-center">
                  <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-[#A90017] mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600 group-hover:text-gray-800">
                    {selectedPhoto ? '写真を変更' : '写真を選択'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">JPEG/PNG/WEBP、最大10MB</p>
                </div>
              </label>
            </div>

            {/* メモ */}
            <div>
              <label className="block text-base sm:text-lg font-bold text-[#2c1810] mb-3" style={{fontFamily: '"Playfair Display", serif'}}>
                メモ・感想
              </label>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                rows={3}
                className="w-full py-3 px-3 sm:py-4 sm:px-4 bg-white border border-gray-300 rounded-xl focus:border-[#A90017] focus:ring-2 focus:ring-[#A90017]/20 resize-none text-sm sm:text-base font-medium text-[#2c1810] transition-colors leading-relaxed"
                placeholder="美味しかった！また行きたい。特におすすめは..."
              />
            </div>

            {/* アクションボタン */}
            <div className="flex gap-3 sm:gap-4">
              <button
                onClick={() => setStep('search')}
                className="flex-1 py-3 px-4 sm:py-4 sm:px-6 border border-gray-300 bg-white rounded-xl font-bold text-[#5a4a3a] hover:bg-gray-50 transition-colors text-sm sm:text-base"
                style={{
                  fontFamily: '"Playfair Display", serif'
                }}
              >
                戻る
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 px-4 sm:py-4 sm:px-6 bg-[#A90017] text-white rounded-xl font-bold hover:bg-[#940014] transition-colors text-sm sm:text-base"
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