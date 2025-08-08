'use client';

import { useState } from 'react';
import { Book, Lock, Globe, Camera } from 'lucide-react';

interface CreateGuidebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (guidebookData: {
    title: string;
    description: string;
    is_private: boolean;
    image_url?: string;
  }) => void;
}

export default function CreateGuidebookModal({ isOpen, onClose, onSubmit }: CreateGuidebookModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        is_private: isPrivate,
        image_url: imageUrl.trim() || undefined
      });
      
      // リセット
      setTitle('');
      setDescription('');
      setIsPrivate(false);
      setImageUrl('');
      onClose();
    } catch (error) {
      console.error('Error creating guidebook:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-xl border border-gray-100">
        {/* ヘッダー */}
        <div className="bg-[#A90017] text-white p-10">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Book className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4" style={{fontFamily: '"Playfair Display", serif'}}>
              新しいガイドブック
            </h2>
            <p className="text-white/90 text-lg leading-relaxed max-w-sm mx-auto">
              あなたのお気に入りレストランをまとめましょう
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-10">
          {/* タイトル */}
          <div>
            <label className="block text-xl font-bold text-[#2c1810] mb-6" style={{fontFamily: '"Playfair Display", serif'}}>
              ガイドブックのタイトル <span className="text-[#A90017]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: 名古屋で見つけた隠れた名店"
              className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl focus:border-[#A90017] focus:ring-2 focus:ring-[#A90017]/20 text-base font-medium text-[#2c1810] transition-colors"
              maxLength={100}
              required
            />
            <div className="text-right text-sm text-[#8b7355] mt-2 font-medium">
              {title.length}/100文字
            </div>
          </div>

          {/* 説明 */}
          <div>
            <label className="block text-xl font-bold text-[#2c1810] mb-6" style={{fontFamily: '"Playfair Display", serif'}}>
              説明
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="このガイドブックについて簡単に説明してください..."
              rows={4}
              className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl focus:border-[#A90017] focus:ring-2 focus:ring-[#A90017]/20 resize-none text-base font-medium text-[#2c1810] transition-colors leading-relaxed"
              maxLength={500}
            />
            <div className="text-right text-sm text-[#8b7355] mt-2 font-medium">
              {description.length}/500文字
            </div>
          </div>

          {/* カバー画像 */}
          <div>
            <label className="block text-xl font-bold text-[#2c1810] mb-6" style={{fontFamily: '"Playfair Display", serif'}}>
              カバー画像URL（任意）
            </label>
            <div className="relative">
              <Camera className="absolute left-4 top-4 h-5 w-5 text-[#8b7355]" />
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-xl focus:border-[#A90017] focus:ring-2 focus:ring-[#A90017]/20 text-base font-medium text-[#2c1810] transition-colors"
              />
            </div>
            {imageUrl && (
              <div className="mt-6">
                <img
                  src={imageUrl}
                  alt="プレビュー"
                  className="w-full h-40 object-cover rounded-xl border border-gray-200"
                  onError={() => setImageUrl('')}
                />
              </div>
            )}
          </div>

          {/* プライバシー設定 */}
          <div>
            <label className="block text-lg font-bold text-[#2c1810] mb-5" style={{fontFamily: '"Playfair Display", serif'}}>
              公開設定
            </label>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setIsPrivate(false)}
                className={`w-full p-6 rounded-xl border-2 transition-colors ${
                  !isPrivate
                    ? 'border-[#A90017] bg-white text-[#A90017]'
                    : 'border-gray-200 bg-white hover:border-[#A90017] text-[#5a4a3a]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-bold text-lg" style={{fontFamily: '"Playfair Display", serif'}}>公開</div>
                    <div className="text-sm text-[#5a4a3a] mt-1 font-medium">誰でも閲覧できます</div>
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`w-full p-6 rounded-xl border-2 transition-colors ${
                  isPrivate
                    ? 'border-[#A90017] bg-white text-[#A90017]'
                    : 'border-gray-200 bg-white hover:border-[#A90017] text-[#5a4a3a]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-bold text-lg" style={{fontFamily: '"Playfair Display", serif'}}>プライベート</div>
                    <div className="text-sm text-[#5a4a3a] mt-1 font-medium">自分だけが閲覧できます</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex gap-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-4 px-6 border border-gray-300 bg-white rounded-xl font-bold text-[#5a4a3a] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{
                fontFamily: '"Playfair Display", serif'
              }}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isSubmitting}
              className="flex-1 py-4 px-6 bg-[#A90017] text-white rounded-xl font-bold hover:bg-[#940014] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              style={{
                fontFamily: '"Playfair Display", serif'
              }}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  作成中...
                </div>
              ) : (
                '作成する'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}