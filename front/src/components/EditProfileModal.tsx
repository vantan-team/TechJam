'use client';

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { X, UploadCloud } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (profile: {
    name: string;
    bio: string;
    profilePhotoUrl: string;
  }) => Promise<void>;
  initialName: string;
  initialBio: string;
  initialProfilePhotoUrl: string;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  onSubmit,
  initialName,
  initialBio,
  initialProfilePhotoUrl,
}: EditProfileModalProps) {
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(initialProfilePhotoUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(initialProfilePhotoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(initialName);
    setBio(initialBio);
    setProfilePhotoUrl(initialProfilePhotoUrl);
    setSelectedFile(null);
    setPreviewUrl(initialProfilePhotoUrl);
  }, [isOpen, initialName, initialBio, initialProfilePhotoUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    let finalPhotoUrl = profilePhotoUrl;
    try {
      if (selectedFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append('image', selectedFile);
        const token = typeof window !== "undefined" ? window.localStorage.getItem("access_token") || "" : "";
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_ROOT}/api/user/upload-profile-image`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
        const data = await res.json();
        if (data.success && data.url) {
          finalPhotoUrl = data.url;
          setProfilePhotoUrl(data.url);
        } else {
          alert(data.message?.[0] || '画像アップロードに失敗しました');
          setUploading(false);
          setIsSubmitting(false);
          return;
        }
        setUploading(false);
      }
      await onSubmit({
        name: name.trim(),
        bio: bio.trim(),
        profilePhotoUrl: finalPhotoUrl.trim(),
      });
      onClose();
    } catch (error) {
      // エラー処理は親で
    } finally {
      setIsSubmitting(false);
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreviewUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-2">
      <div className="bg-white rounded-2xl max-w-xs w-full max-h-[90vh] overflow-y-auto shadow-xl border border-gray-100 relative">
        {/* 閉じるボタン */}
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors z-10"
          onClick={onClose}
          aria-label="閉じる"
        >
          <X size={24} />
        </button>

        {/* ヘッダー */}
        <div className="px-6 pt-8 pb-4 bg-white rounded-t-2xl">
          <div className="flex flex-col items-center">
            <Avatar className="w-20 h-20 mb-2 border-4 border-[#A90017]/20 shadow">
              <AvatarImage
                src={
                  previewUrl
                    ? /^https?:\/\//.test(previewUrl) || previewUrl.startsWith('data:')
                      ? previewUrl
                      : `${process.env.NEXT_PUBLIC_API_ROOT}${previewUrl}`
                    : undefined
                }
                alt={name}
                className="object-cover"
              />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                {name}
              </AvatarFallback>
            </Avatar>
            <div className="flex gap-2 mt-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading || isSubmitting}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="px-2 py-1 text-xs border-gray-300"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || isSubmitting}
              >
                <UploadCloud size={16} className="mr-1" />
                {uploading ? "アップロード中..." : "画像を選択"}
              </Button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-6">
          {/* 名前 */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              ユーザー名 <span className="text-[#A90017]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ユーザー名"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl focus:border-[#A90017] focus:ring-2 focus:ring-[#A90017]/20 text-base font-bold text-gray-900 transition-colors"
              maxLength={50}
              required
              disabled={isSubmitting}
            />
            <div className="text-right text-xs text-gray-400 mt-1">
              {name.length}/50文字
            </div>
          </div>

          {/* 自己紹介 */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              自己紹介
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="自己紹介や趣味などを入力してください"
              rows={3}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl focus:border-[#A90017] focus:ring-2 focus:ring-[#A90017]/20 resize-none text-sm text-gray-700 transition-colors leading-relaxed"
              maxLength={300}
              disabled={isSubmitting}
            />
            <div className="text-right text-xs text-gray-400 mt-1">
              {bio.length}/300文字
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex gap-4 pt-1">
            <Button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || isSubmitting || uploading}
              className="flex-1 bg-[#A90017] text-white hover:bg-[#940014] disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  保存中...
                </div>
              ) : (
                '保存する'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
