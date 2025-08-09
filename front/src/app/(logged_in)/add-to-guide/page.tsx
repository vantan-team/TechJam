'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Search, Plus, Star, MapPin, Camera, BookOpen, Clock, Image as ImageIcon, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Types
interface Restaurant {
  id: string;
  name: string;
  address: string;
  category: string;
  source: 'hotpepper' | 'history' | 'manual';
  photo_url?: string;
  budget?: string;
  hotpepper_id?: string;
  lat?: number | null;
  lng?: number | null;
}

interface Guidebook {
  id: number;
  title: string;
  description: string;
  restaurant_count: number;
  image_url?: string;
  created_at?: string;
}

export default function AddToGuidePage() {
  // URL params and navigation
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselectedGuidebookId = searchParams.get('guidebook');
  const preselectedStarParam = searchParams.get('star');

  // Main state
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guidebook selection
  const [guidebooks, setGuidebooks] = useState<Guidebook[]>([]);
  const [selectedGuidebook, setSelectedGuidebook] = useState<Guidebook | null>(null);
  const [newGuidebookTitle, setNewGuidebookTitle] = useState('');
  const [newGuidebookImage, setNewGuidebookImage] = useState<File | null>(null);
  const [newGuidebookImagePreview, setNewGuidebookImagePreview] = useState<string>('');
  const [newGuidebookGeo, setNewGuidebookGeo] = useState<string>('');
  const [newGuidebookGenre, setNewGuidebookGenre] = useState<string>('');
  const [showCreateGuidebook, setShowCreateGuidebook] = useState(false);

  // Restaurant search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  // ページング
  const [hpMeta, setHpMeta] = useState<{ total: number; start: number; count: number; next_start?: number; has_more: boolean } | null>(null);
  // 最新レスポンスのみ反映するためのトークン
  const lastTokenRef = useRef<string | null>(null);
  
  // Manual input
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualRestaurantName, setManualRestaurantName] = useState('');
  const [manualRestaurantImage, setManualRestaurantImage] = useState<File | null>(null);
  const [manualRestaurantComment, setManualRestaurantComment] = useState('');

  // Details
  const [rating, setRating] = useState(3);
  const presetStar = preselectedStarParam ? Math.max(1, Math.min(3, parseInt(preselectedStarParam))) : null;
  const [memo, setMemo] = useState('');
  const [visitedAt, setVisitedAt] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<string>('');

  // 星評価の表示定義（サブタイトルは使わず、説明のみ）
  const starCards = [
    {
      stars: 3,
      title: '三つ星',
      description: '特別な旅をしてでも訪れる価値がある、例外的で卓越した料理',
    },
    {
      stars: 2,
      title: '二つ星',
      description: '遠回りしてでも訪れる価値がある、素晴らしい料理',
    },
    {
      stars: 1,
      title: '一つ星',
      description: 'その分野で美味しく、質の高い料理を提供',
    },
  ] as const;

  // オプション（任意）
  const GEO_OPTIONS = ['東京', '大阪', '京都', '神奈川', '愛知', '北海道', '福岡', '沖縄', '海外', 'その他'];
  const GENRE_OPTIONS = ['和食', 'フレンチ', 'イタリアン', '中華', '韓国料理', 'エスニック', 'カフェ', 'バー', 'ラーメン', '寿司', '焼肉', '居酒屋', 'ファストフード', 'スイーツ', 'その他'];

  // Load guidebooks
  useEffect(() => {
    loadGuidebooks();
  }, []);

  // Auto-select guidebook and star if provided in URL
  useEffect(() => {
    if (preselectedGuidebookId && guidebooks.length > 0) {
      const guidebook = guidebooks.find(g => g.id.toString() === preselectedGuidebookId);
      if (guidebook) {
        setSelectedGuidebook(guidebook);
        if (preselectedStarParam) {
          setRating(parseInt(preselectedStarParam));
        }
        setShowForm(true);
      }
    }
  }, [preselectedGuidebookId, guidebooks, preselectedStarParam]);

  // URLの star 指定があれば評価をロック
  useEffect(() => {
    if (presetStar) setRating(presetStar);
  }, [presetStar]);

  // 画像プレビューURLのクリーンアップ
  useEffect(() => {
    return () => {
      if (selectedPhotoPreview) URL.revokeObjectURL(selectedPhotoPreview);
    };
  }, [selectedPhotoPreview]);

  // Auto-search restaurants when query changes
  useEffect(() => {
    if (searchQuery.length > 1) {
      const timeoutId = setTimeout(() => {
        searchRestaurants(searchQuery, { reset: true });
      }, 400);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
      setHpMeta(null);
    }
  }, [searchQuery]);

  const loadGuidebooks = async () => {
    try {
      // 1) 認証ユーザー取得
      const statusRes = await fetch(`${process.env.NEXT_PUBLIC_API_ROOT}/api/auth/status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Accept': 'application/json'
        }
      });
      if (!statusRes.ok) throw new Error('認証状態の取得に失敗しました');
      const statusData = await statusRes.json();
      const userId = statusData?.user?.id;
      if (!userId) throw new Error('ユーザー情報が取得できませんでした');

      // 2) 統合APIからユーザーのガイドブック一覧を取得
      const gbRes = await fetch(`${process.env.NEXT_PUBLIC_API_ROOT}/api/user/${userId}/guide_books`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      if (!gbRes.ok) throw new Error('ガイドブック取得に失敗しました');
      const gbData = await gbRes.json();
      const books = (gbData?.books ?? []).map((b: any) => ({
        id: Number(b.id ?? 0),
        title: b.title,
        description: '',
        restaurant_count: b.restaurant_count ?? b.contents_count ?? 0,
        image_url: b.image_url ?? b.cover_image ?? undefined,
      }));
      setGuidebooks(books);
    } catch (error) {
      console.error('Failed to load guidebooks:', error);
      setError('ガイドブックの読み込みに失敗しました');
    }
  };

  const searchRestaurants = async (query: string, opts?: { reset?: boolean }) => {
    setIsSearching(true);
    const token = `${Date.now()}-${Math.random()}`;
    lastTokenRef.current = token;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_ROOT}/api/restaurants/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          keyword: query,
          include_history: true,
          start: opts?.reset ? 1 : (hpMeta?.next_start ?? 1),
          count: 20
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Search API Response:', data); // デバッグログ
        const shops: Restaurant[] = data.data?.shops || [];
        const meta = data.data?.pagination?.hotpepper;
        console.log('Parsed shops:', shops); // デバッグログ
        console.log('Pagination meta:', meta); // デバッグログ
        if (lastTokenRef.current !== token) return; // 古いレスポンスは無視
        setHpMeta(meta ?? null);
        setSearchResults((prev) => (opts?.reset ? shops : [...prev, ...shops]));
      } else {
        const errorData = await response.json();
        console.error('Search API Error:', response.status, errorData);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const createGuidebook = async () => {
    if (!newGuidebookTitle.trim()) return;

    try {
      const form = new FormData();
      form.append('title', newGuidebookTitle.trim());
      if (newGuidebookImage) form.append('image', newGuidebookImage);
      if (newGuidebookGeo) form.append('geo', newGuidebookGeo);
      if (newGuidebookGenre) form.append('genre', newGuidebookGenre);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_ROOT}/api/guidebooks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Accept': 'application/json'
        },
        body: form
      });

      if (response.ok) {
        const data = await response.json();
        // サーバ仕様（プロフィール一覧と同一）に合わせて作成後に一覧を再取得
        await loadGuidebooks();
        // 作成後にすぐレストラン選択へ進まない仕様に変更
        setShowCreateGuidebook(false);
        setNewGuidebookTitle('');
        setNewGuidebookImage(null);
        setNewGuidebookImagePreview('');
        setNewGuidebookGeo('');
        setNewGuidebookGenre('');
      }
    } catch (error) {
      console.error('Failed to create guidebook:', error);
      setError('ガイドブック作成に失敗しました');
    }
  };

  // ホットペッパーIDからDBのshop_idを取得（必要時）
  const ensureShopIdFromHotpepper = async (hotpepperId?: string): Promise<number | null> => {
    if (!hotpepperId) return null;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ROOT}/api/restaurants/${hotpepperId}/detail`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Accept': 'application/json'
        }
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data?.data?.shop?.id ?? null;
    } catch {
      return null;
    }
  };

  const submitRestaurant = async () => {
    if (!selectedRestaurant) return;
    if (!selectedGuidebook) {
      setError('ガイドブックを選択してください');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // ガイドへの掲載のみ
      if (selectedRestaurant.source === 'manual') {
        // 手動入力は /restaurants/add-to-guide でshop生成＆同時掲載
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_ROOT}/api/restaurants/add-to-guide`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            guide_book_id: selectedGuidebook!.id,
            hotpepper_id: null,
            shop_name: selectedRestaurant.name,
            shop_address: selectedRestaurant.address,
            rating: rating,
            memo: memo,
            visited_year: new Date(visitedAt).getFullYear(),
            visited_month: new Date(visitedAt).getMonth() + 1
          })
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'レストランの追加に失敗しました');
        }
      } else {
        let shopId: number | null = null;
        if (selectedRestaurant.source === 'history') {
          shopId = Number(selectedRestaurant.id);
        } else {
          shopId = await ensureShopIdFromHotpepper(selectedRestaurant.hotpepper_id);
        }
        if (!shopId) throw new Error('店舗情報の取得に失敗しました');

        const formData = new FormData();
        formData.append('shop_id', shopId.toString());
        formData.append('star', rating.toString());
        formData.append('comment', memo);
        if (selectedPhoto) {
          formData.append('image', selectedPhoto);
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_ROOT}/api/guidebooks/${selectedGuidebook!.id}/contents`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Accept': 'application/json'
          },
          body: formData
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'ガイドブックへの追加に失敗しました');
        }
      }

      await new Promise(resolve => setTimeout(resolve, 300));
      // 追加完了後は対象ガイドブック詳細へ遷移する方が自然
      router.push(`/guidebook/${selectedGuidebook!.id}`);
    } catch (error) {
      console.error('Failed to add restaurant:', error);
      const message = error instanceof Error ? error.message : 'レストランの追加に失敗しました';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      const url = URL.createObjectURL(file);
      setSelectedPhotoPreview(url);
    }
  };

  const createManualRestaurant = () => {
    if (!manualRestaurantName.trim()) return;
    
    const manualRestaurant: Restaurant = {
      id: `manual-${Date.now()}`,
      name: manualRestaurantName.trim(),
      address: '手動入力',
      category: '手動入力',
      source: 'manual',
      hotpepper_id: undefined
    };
    
    setSelectedRestaurant(manualRestaurant);
    // 手動入力の場合、画像とコメントも設定
    if (manualRestaurantImage) {
      setSelectedPhoto(manualRestaurantImage);
      const url = URL.createObjectURL(manualRestaurantImage);
      setSelectedPhotoPreview(url);
    }
    if (manualRestaurantComment.trim()) {
      setMemo(manualRestaurantComment.trim());
    }
    
    setShowManualInput(false);
    setManualRestaurantName('');
    setManualRestaurantImage(null);
    setManualRestaurantComment('');
  };

  const goBack = () => {
    if (showForm) {
      setShowForm(false);
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f7] relative">
      
      {/* 上部ヘッダーは非表示（画面内に戻るを配置） */}

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-8 pt-8 sm:pt-12 pb-28 sm:pb-32">
        <AnimatePresence mode="wait">
          {!showForm ? (
            <motion.div
              key="guidebook"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-transparent"
            >
              <div className="p-4 sm:p-6">
                {/* ガイドブック作成画面はナビから遷移するため戻るは不要 */}
                <div className="text-center mb-16">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#A90017] rounded-full flex items-center justify-center mx-auto mb-8">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#2c1810] mb-4" style={{fontFamily: '"Playfair Display", serif'}}>
                    ガイドブックを選択
                  </h2>
                  <div className="w-12 h-0.5 bg-[#A90017] mx-auto mb-6" />
                  <p className="text-[#5a4a3a] text-base sm:text-lg max-w-md mx-auto leading-relaxed">
                    レストランを追加するガイドブックを選んでください
                  </p>
                </div>

                <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-12">
                  {guidebooks.map((guidebook) => (
                    <button
                      key={guidebook.id}
                      onClick={() => {
                        setSelectedGuidebook(guidebook);
                        setShowForm(true);
                      }}
                      className="w-full p-4 sm:p-8 rounded-xl border border-gray-200 bg-white hover:border-[#A90017] transition-all duration-200 text-left hover:shadow-md"
                    >
                      <div className="flex items-center gap-4">
                        {guidebook.image_url ? (
                          <img src={guidebook.image_url} alt={guidebook.title} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border" />
                        ) : (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#A90017]/5 rounded-lg flex items-center justify-center border border-[#A90017]/20">
                            <BookOpen className="w-7 h-7 text-[#A90017]" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-[#2c1810] mb-1 text-base sm:text-lg truncate" style={{fontFamily: '"Playfair Display", serif'}}>
                            {guidebook.title}
                          </h3>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-[#8b7355] font-medium">
                          <span>{guidebook.restaurant_count}軒のレストラン</span>
                          {guidebook.created_at && (
                            <span className="text-gray-400">・{guidebook.created_at}</span>
                          )}
                        </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {guidebooks.length > 0 && (
                  <div className="relative my-6 sm:my-10">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#A90017]/60"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-6 bg-[#faf9f7] text-gray-400">または</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setShowCreateGuidebook(true)}
                  className="w-full p-6 sm:p-8 border border-dashed border-[#A90017]/40 rounded-xl hover:border-[#A90017] hover:bg-white transition-colors group"
                >
                  <div className="flex items-center justify-center gap-3 text-gray-600 group-hover:text-gray-800">
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">新しいガイドブックを作成</span>
                  </div>
                </button>

                <Dialog open={showCreateGuidebook} onOpenChange={(o) => {
                  setShowCreateGuidebook(o);
                  if (!o) { setNewGuidebookImage(null); setNewGuidebookImagePreview(''); }
                }}>
                  <DialogContent showCloseButton={false} className="w-[calc(100%-2rem)] max-w-md mx-auto h-auto max-h-[90vh] p-0 gap-0 overflow-hidden bg-white border border-gray-100 rounded-lg flex flex-col">
                    <DialogHeader className="p-4 pb-3 bg-white border-b border-gray-100 flex-shrink-0">
                      <DialogTitle className="text-lg font-bold text-[#2c1810] text-center" style={{fontFamily: '"Playfair Display", serif'}}>新しいガイドブックを作成</DialogTitle>
                      <div className="w-12 h-0.5 bg-[#A90017] mt-2 mx-auto" />
                    </DialogHeader>
                    <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                      {/* 1. タイトル（最重要・必須） */}
                      <div>
                        <label className="block text-sm font-semibold text-[#2c1810] mb-2">ガイドブックのタイトル <span className="text-[#A90017]">*</span></label>
                        <input 
                          type="text" 
                          value={newGuidebookTitle} 
                          onChange={(e) => setNewGuidebookTitle(e.target.value)} 
                          placeholder="例: 私のお気に入りレストラン" 
                          className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:border-[#A90017] focus:ring-0 focus:outline-none text-base placeholder:text-sm transition-colors" 
                          autoFocus
                        />
                      </div>

                      {/* 2. カバー画像（視覚的要素） */}
                      <div>
                        <label className="block text-sm font-semibold text-[#5a4a3a] mb-2">カバー画像 <span className="text-gray-400 font-normal">（任意）</span></label>
                        {newGuidebookImagePreview && (
                          <div className="w-full aspect-square max-h-[120px] bg-white rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center relative mb-2">
                            <img src={newGuidebookImagePreview} alt="preview" className="block w-full h-full object-cover" />
                            <button type="button" onClick={() => { setNewGuidebookImage(null); setNewGuidebookImagePreview(''); }} className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1.5" aria-label="画像を削除">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        <label className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 border border-[#A90017]/30 rounded-lg cursor-pointer text-sm text-[#5a4a3a] hover:bg-gray-50 transition-colors">
                          <ImageIcon className="w-4 h-4 text-[#A90017]"/>
                          {newGuidebookImage ? '画像を変更' : '画像を選択'}
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setNewGuidebookImage(file);
                            if (file) { setNewGuidebookImagePreview(URL.createObjectURL(file)); } else { setNewGuidebookImagePreview(''); }
                          }} />
                        </label>
                      </div>

                      {/* 3. エリア（分類情報） */}
                      <div>
                        <label className="block text-sm font-semibold text-[#5a4a3a] mb-2">
                          エリア <span className="text-gray-400 font-normal">（任意）</span>
                        </label>
                        <div className="grid grid-cols-4 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setNewGuidebookGeo('')}
                            className={`px-2 py-1.5 rounded text-xs border transition-colors ${
                              newGuidebookGeo === '' ? 'bg-[#A90017] text-white border-[#A90017]' : 'bg-white text-[#5a4a3a] border-gray-300 hover:border-[#A90017]'
                            }`}
                          >未指定</button>
                          {GEO_OPTIONS.slice(0, 11).map((g) => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => setNewGuidebookGeo(g)}
                              className={`px-2 py-1.5 rounded text-xs border transition-colors ${
                                newGuidebookGeo === g ? 'bg-[#A90017] text-white border-[#A90017]' : 'bg-white text-[#5a4a3a] border-gray-300 hover:border-[#A90017]'
                              }`}
                            >{g}</button>
                          ))}
                        </div>
                      </div>

                      {/* 4. ジャンル（分類情報） */}
                      <div>
                        <label className="block text-sm font-semibold text-[#5a4a3a] mb-2">
                          ジャンル <span className="text-gray-400 font-normal">（任意）</span>
                        </label>
                        <div className="grid grid-cols-4 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setNewGuidebookGenre('')}
                            className={`px-2 py-1.5 rounded text-xs border transition-colors ${
                              newGuidebookGenre === '' ? 'bg-[#A90017] text-white border-[#A90017]' : 'bg-white text-[#5a4a3a] border-gray-300 hover:border-[#A90017]'
                            }`}
                          >未指定</button>
                          {GENRE_OPTIONS.map((g) => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => setNewGuidebookGenre(g)}
                              className={`px-2 py-1.5 rounded text-xs border transition-colors ${
                                newGuidebookGenre === g ? 'bg-[#A90017] text-white border-[#A90017]' : 'bg-white text-[#5a4a3a] border-gray-300 hover:border-[#A90017]'
                              }`}
                            >{g}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="p-4 pt-3 bg-white border-t border-gray-100 flex-shrink-0">
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowCreateGuidebook(false)}
                          className="flex-1 py-2.5 px-4 border border-gray-300 bg-white text-[#5a4a3a] rounded-lg hover:bg-gray-50 font-medium transition-colors text-sm"
                        >
                          キャンセル
                        </button>
                        <button 
                          onClick={async () => { await createGuidebook(); setShowCreateGuidebook(false); }} 
                          disabled={!newGuidebookTitle.trim()} 
                          className="flex-1 py-2.5 px-4 bg-[#A90017] text-white rounded-lg hover:bg-[#940014] disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors text-sm"
                        >
                          作成
                        </button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-transparent"
            >
              <div className="p-4 sm:p-6">
                {/* 戻るボタン（レストラン追加時はヘッダーを出さないため） */}
                <div className="mb-6 sm:mb-8">
                  <button
                    onClick={goBack}
                    className="p-3 text-[#5a4a3a] hover:text-[#2c1810] hover:bg-[#A90017]/10 rounded-full transition-all duration-200"
                    aria-label="戻る"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                </div>
                <div className="text-center mb-12 sm:mb-16">
                  <h2 className="text-[22px] sm:text-3xl font-bold text-[#2c1810] mb-3" style={{fontFamily: '"Playfair Display", serif'}}>
                    {presetStar ? `${presetStar === 3 ? '三つ星' : presetStar === 2 ? '二つ星' : '一つ星'}レストランを追加` : 'レストランを追加'}
                  </h2>
                  <div className="w-10 h-0.5 bg-[#A90017] mx-auto mb-4" />
                  <p className="text-[#5a4a3a] text-sm sm:text-lg max-w-md mx-auto leading-relaxed">
                    <span className="font-semibold" style={{fontFamily: '"Playfair Display", serif'}}>{selectedGuidebook?.title}</span>
                    に掲載するレストランを入力してください
                  </p>
                  {presetStar && (
                    <div className="mt-3 flex justify-center">
                      <span className="px-2.5 py-1 bg-[#A90017]/10 text-[#A90017] rounded-full text-xs font-semibold">
                        {presetStar === 3 ? '三つ星' : presetStar === 2 ? '二つ星' : '一つ星'}
                      </span>
                    </div>
                  )}
                </div>

                {/* 星選択（プリセットされていない場合のみ） */}
                {!presetStar && (
                  <div className="mb-16">
                    <div className="text-center mb-6 sm:mb-10">
                      <h3 className="text-2xl font-bold text-[#2c1810] mb-3 sm:mb-4" style={{fontFamily: '"Playfair Display", serif'}}>
                        ミシュラン評価を選択
                      </h3>
                      <div className="w-12 h-0.5 bg-[#A90017] mx-auto" />
                    </div>
                    {/* 星と文章のバランスを整えたカード（3枚表示） */}
                    <div className="mt-4 space-y-4 sm:space-y-6">
                      {starCards.map((starData) => (
                        <button
                          key={starData.stars}
                          onClick={() => setRating(starData.stars)}
                          className={`group relative w-full p-6 sm:p-8 rounded-2xl border-2 transition-all duration-200 text-left ${
                            rating === starData.stars
                              ? 'border-[#A90017] bg-white shadow-md'
                              : 'border-gray-200 bg-white hover:border-[#A90017] hover:shadow-sm'
                          }`}
                          aria-pressed={rating === starData.stars}
                        >
                          <div className="flex flex-col">
                            <div className="flex items-center gap-3 sm:gap-4">
                              <div className="flex items-center gap-1 shrink-0">
                                {[...Array(starData.stars)].map((_, i) => (
                                  <Star key={i} className="w-6 h-6 sm:w-7 sm:h-7 fill-current text-yellow-500" />
                                ))}
                              </div>
                              <h3 className="text-xl sm:text-2xl font-bold text-[#2c1810]" style={{fontFamily: '\"Playfair Display\", serif'}}>
                                {starData.title}
                              </h3>
                            </div>
                            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-[#5a4a3a] leading-relaxed font-medium">
                              {starData.description}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* レストラン検索 */}
                <div className="mb-16">
                  <label className="block text-xl font-bold text-[#2c1810] mb-8" style={{fontFamily: '"Playfair Display", serif'}}>
                    レストラン検索
                  </label>
                  <div className="relative mb-8">
                    <Search className="absolute left-4 top-4 h-5 w-5 text-[#8b7355]" />
                    <input
                      type="text"
                      placeholder="レストラン名で検索..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-xl focus:border-[#A90017] focus:ring-2 focus:ring-[#A90017]/20 transition-colors text-[#2c1810] font-medium"
                    />
                    {isSearching && (
                      <div className="absolute right-3 top-3">
                        <div className="w-5 h-5 border-2 border-[#A90017] border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* 検索結果 */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {searchResults.map((restaurant) => (
                      <button
                        key={`${restaurant.source}-${restaurant.id}`}
                        onClick={() => setSelectedRestaurant(restaurant)}
                        className={`w-full p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                          selectedRestaurant?.id === restaurant.id
                            ? 'border-[#A90017] bg-white shadow-md'
                            : 'border-gray-200 bg-white hover:border-[#A90017] hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {restaurant.photo_url ? (
                            <img
                              src={restaurant.photo_url}
                              alt={restaurant.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-14 h-14 bg-[#A90017]/5 rounded-xl flex items-center justify-center border border-[#A90017]/20">
                              <span className="text-xl">🍽️</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-[#2c1810] truncate" style={{fontFamily: '"Playfair Display", serif'}}>
                              {restaurant.name}
                            </h3>
                            <div className="flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <p className="text-sm text-[#8b7355] truncate font-medium">
                                {restaurant.address}
                              </p>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}

                    {searchQuery.length > 2 && searchResults.length === 0 && !isSearching && (
                      <div className="text-center py-8 text-gray-500">
                        <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p>「{searchQuery}」に関するレストランが見つかりませんでした</p>
                      </div>
                    )}
                  </div>

                  {/* 手動入力オプション */}
                  <div className="mt-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#A90017]/25"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-4 bg-white text-gray-400">または</span>
                      </div>
                    </div>

                    {!showManualInput ? (
                      <button
                        onClick={() => setShowManualInput(true)}
                        className="w-full mt-4 p-4 border border-dashed border-[#A90017]/40 rounded-lg hover:border-[#A90017] transition-colors group"
                      >
                        <div className="flex items-center justify-center gap-3 text-gray-600 group-hover:text-gray-800">
                          <Plus className="w-4 h-4" />
                          <span className="text-sm font-medium">手動で店名を入力</span>
                        </div>
                      </button>
                    ) : (
                      <div className="mt-4 p-4 border-2 border-[#A90017]/30 bg-white rounded-lg space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            店名 <span className="text-[#A90017]">*</span>
                          </label>
                          <input
                            type="text"
                            value={manualRestaurantName}
                            onChange={(e) => setManualRestaurantName(e.target.value)}
                            placeholder="レストラン名を入力"
                            className="w-full p-3 bg-white border border-[#A90017]/30 rounded-lg focus:ring-2 focus:ring-[#A90017]/30 focus:border-[#A90017] transition-colors"
                            autoFocus
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setShowManualInput(false);
                              setManualRestaurantName('');
                              setManualRestaurantImage(null);
                              setManualRestaurantComment('');
                            }}
                            className="flex-1 py-2 px-4 border border-[#A90017]/30 rounded-lg text-gray-600 hover:bg-white transition-colors"
                          >
                            キャンセル
                          </button>
                          <button
                            onClick={createManualRestaurant}
                            disabled={!manualRestaurantName.trim()}
                            className="flex-1 py-2 px-4 bg-[#A90017] text-white rounded-lg hover:bg-[#940014] disabled:bg-gray-300 transition-colors"
                          >
                            追加
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 選択されたレストラン表示 */}
                {selectedRestaurant && (
                  <div className="mb-12 p-6 bg-white rounded-2xl border-2 border-[#A90017] shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#A90017] rounded-xl flex items-center justify-center">
                        <span className="text-white text-xl">🍽️</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[#2c1810] truncate text-lg mb-1" style={{fontFamily: '"Playfair Display", serif'}}>
                          {selectedRestaurant.name}
                        </h3>
                        <p className="text-sm text-[#8b7355] truncate font-medium">
                          {selectedRestaurant.address}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 訪問月 */}
                <div className="mb-8">
                  <label className="block text-xl font-bold text-[#2c1810] mb-3" style={{fontFamily: '"Playfair Display", serif'}}>
                    訪問月 <span className="text-[#A90017]">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-4 h-5 w-5 text-[#8b7355]" />
                    <input
                      type="month"
                      value={visitedAt}
                      onChange={(e) => setVisitedAt(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:border-[#A90017] focus:ring-2 focus:ring-[#A90017]/20 transition-colors text-[#2c1810] font-medium"
                    />
                  </div>
                </div>

                {/* メモ */}
                <div className="mb-10">
                  <label className="block text-xl font-bold text-[#2c1810] mb-3" style={{fontFamily: '"Playfair Display", serif'}}>
                    メモ・感想
                  </label>
                  <textarea
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    rows={3}
                    className="w-full py-3 px-3 bg-white border border-gray-300 rounded-xl focus:border-[#A90017] focus:ring-2 focus:ring-[#A90017]/20 resize-none transition-colors text-[#2c1810] font-medium leading-relaxed"
                    placeholder="美味しかった！また行きたい。特におすすめは..."
                  />
                </div>

                {/* 写真アップロード */}
                <div className="mb-10">
                  <label className="block text-xl font-bold text-[#2c1810] mb-3" style={{fontFamily: '"Playfair Display", serif'}}>
                    写真（任意）
                  </label>
                  {/* プレビュー or アップローダー（選択済みでUIを切替） */}
                  {selectedPhotoPreview ? (
                    <>
                      <div className="flex justify-center mb-3">
                        <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-lg border border-gray-200 overflow-hidden relative">
                          <img
                            src={selectedPhotoPreview}
                            alt="preview"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => { setSelectedPhoto(null); setSelectedPhotoPreview(''); }}
                            className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1"
                            aria-label="画像を削除"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <label className="inline-flex items-center gap-2 px-3 py-2 border border-[#A90017]/30 rounded-lg cursor-pointer text-sm text-[#5a4a3a] hover:bg-gray-50">
                          <Camera className="w-4 h-4 text-[#A90017]" />
                          写真を変更
                          <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                        </label>
                      </div>
                    </>
                  ) : (
                    <label className="block w-full p-6 sm:p-8 border-2 border-dashed border-[#A90017]/40 rounded-xl hover:border-[#A90017] hover:bg-gray-50 transition-colors cursor-pointer group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <div className="text-center">
                        <div className="w-12 h-12 bg-[#A90017]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Camera className="w-6 h-6 text-[#A90017]" />
                        </div>
                        <p className="text-sm text-[#5a4a3a] font-medium">写真を選択</p>
                      </div>
                    </label>
                  )}
                </div>

                {error && (
                  <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                )}

                {/* 送信ボタン */}
                <button
                  onClick={submitRestaurant}
                  disabled={isLoading || !selectedRestaurant || !selectedGuidebook}
                  className="w-full py-4 bg-[#A90017] text-white rounded-2xl font-bold text-xl hover:bg-[#940014] disabled:bg-gray-300 transition-colors flex items-center justify-center gap-3"
                  style={{
                    fontFamily: '"Playfair Display", serif'
                  }}
                >
                  {isLoading ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      送信中...
                    </>
                  ) : (
                    <>
                      <Plus className="w-6 h-6" />
                      ガイドブックに掲載する
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}