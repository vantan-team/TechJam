'use client';

import { UserPlus, ChevronRight, ArrowLeft, Star } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { getHomeGuidebooks, type Guidebook, getRestaurantDetail } from '@/requests/home';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

// シンプルなマップ表示
const SimpleMap = dynamic(() => import('./GoogleMapComponent').catch(() => ({
  default: () => (
    <div className="h-screen w-full bg-gray-50 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-xl shadow-lg">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">地図の読み込みに失敗しました</h3>
        <p className="text-gray-600 mb-4">ページを再読み込みしてください</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          再読み込み
        </button>
      </div>
    </div>
  )
})), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-full bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-gray-200 rounded-full animate-spin border-t-[#A90017] mx-auto mb-4"></div>
        <p className="text-gray-800 font-medium">地図を読み込んでいます...</p>
      </div>
    </div>
  )
});

export default function FullScreenMapPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [selectedMarkers, setSelectedMarkers] = useState<any[]>([]);
  const [selectedGuidebookId, setSelectedGuidebookId] = useState<number | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // APIからガイドブックデータを取得
  const [guidebooks, setGuidebooks] = useState<Guidebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGuidebooks = async () => {
      try {
        const data = await getHomeGuidebooks();
        setGuidebooks(data.guidebooks);
      } catch (err) {
        setError('ガイドブックの読み込みに失敗しました');
        console.error('Failed to fetch guidebooks:', err);
      } finally {
        setLoading(false);
      }
    };

    loadGuidebooks();
  }, []);


  // 現在使用するガイドブック（API取得データまたはフォールバック）
  // 本番環境ではフォールバックデータを使用しない
  const currentGuidebooks = guidebooks;

  // デフォルトマーカー（全ガイドブックの店舗）
  const defaultMarkers = currentGuidebooks.flatMap(guidebook => guidebook.restaurants);

  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null);

  // 初回読み込み時に全マーカーを設定、またはURLパラメータの処理
  useEffect(() => {
    if (currentGuidebooks.length > 0) {
      // URLパラメータからガイドブック情報を取得
      const guidebookId = searchParams.get('guidebook_id');
      const guidebookTitle = searchParams.get('guidebook_title');
      const guidebookGeo = searchParams.get('guidebook_geo');
      const fromGuidebook = searchParams.get('from_guidebook');

      if (guidebookId && guidebookTitle && fromGuidebook) {
        // 特定のガイドブックでフィルタリング
        const targetGuidebook = currentGuidebooks.find(book => 
          book.id.toString() === guidebookId || 
          book.title.includes(guidebookTitle)
        );
        
        if (targetGuidebook) {
          setSelectedMarkers(targetGuidebook.restaurants);
          setSelectedGuidebookId(targetGuidebook.id);
          setSelectedGuide(targetGuidebook);
          setIsGuideOpen(true);
        } else {
          // 該当するガイドブックが見つからない場合は、地域名やタイトルでフィルタリング
          const filteredGuidebooks = currentGuidebooks.filter(book => 
            (guidebookGeo && (book.title.includes(guidebookGeo) || book.description?.includes(guidebookGeo))) ||
            book.title.includes(guidebookTitle)
          );
          
          if (filteredGuidebooks.length > 0) {
            const combinedMarkers = filteredGuidebooks.flatMap(book => book.restaurants);
            setSelectedMarkers(combinedMarkers);
          } else {
            setSelectedMarkers(defaultMarkers);
          }
        }
      } else if (selectedMarkers.length === 0) {
        setSelectedMarkers(defaultMarkers);
      }
    }
  }, [currentGuidebooks.length, searchParams]);

  // ガイドブッククリック処理
  const handleGuidebookClick = (guidebook: any) => {
    setSelectedMarkers(guidebook.restaurants);
    setSelectedGuidebookId(guidebook.id);
  };

  // 全て表示ボタンクリック処理
  const handleShowAll = () => {
    setSelectedMarkers(defaultMarkers);
    setSelectedGuidebookId(null);
    // URLパラメータもクリア
    router.replace('/home');
  };

  // ガイド詳細を開く処理
  const handleOpenGuide = (guidebook: any, e: React.MouseEvent) => {
    e.stopPropagation(); // 親のクリックイベントを停止
    setSelectedGuide(guidebook);
    setIsGuideOpen(true);
    // ガイドを開いたときにそのガイドブックの店舗を地図に表示
    setSelectedMarkers(guidebook.restaurants);
    setSelectedGuidebookId(guidebook.id);
  };

  // ガイド詳細を閉じる処理
  const handleCloseGuide = () => {
    setIsGuideOpen(false);
    setSelectedGuide(null);
    setSelectedRestaurantId(null);
  };

  // 店舗クリック処理（選択された店舗のツールチップを表示）
  const handleRestaurantClick = (restaurant: any) => {
    // 常に一度nullにしてから設定することで、再クリック時も同じ動作にする
    setSelectedRestaurantId(null);
    setTimeout(() => {
      setSelectedRestaurantId(restaurant.id);
    }, 50);
  };

  // 店舗詳細オーバーレイ用の状態
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // マーカーの「ページの詳細を確認」ボタン押下時
  const handleDetailClick = async (marker: any) => {
    if (!marker.id) return;
    setLoadingDetail(true);
    setDetailOpen(true);
    try {
      const hotpepperId = marker.hotpepper_id.toString();
      const shop = await getRestaurantDetail(hotpepperId);
      setDetailData(shop);
    } catch (e) {
      setDetailData({ error: "詳細情報の取得に失敗しました。" });
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setDetailData(null);
  };

  // ローディング状態とエラー状態の表示
  if (!isClient || loading) {
    return (
      <div className="h-screen w-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full animate-spin border-t-[#A90017] mx-auto mb-4"></div>
          <p className="text-gray-800 font-medium">地図を読み込んでいます...</p>
        </div>
      </div>
    );
  }

  if (error && guidebooks.length === 0) {
    return (
      <div className="h-screen w-full bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">データの読み込みに失敗しました</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">フォールバックデータを表示しています</p>
        </div>
      </div>
    );
  }

  // URLパラメータに基づいた表示タイトル
  const getDisplayTitle = () => {
    const guidebookTitle = searchParams.get('guidebook_title');
    const guidebookGeo = searchParams.get('guidebook_geo');
    const fromGuidebook = searchParams.get('from_guidebook');
    
    if (fromGuidebook && guidebookTitle) {
      return `「${guidebookTitle}」のお店`;
    }
    if (guidebookTitle && guidebookGeo) {
      return `${guidebookGeo}のガイドブック`;
    }
    return '周辺の人気なガイドブック';
  };

  return (
    <>
        <div className='fixed from-blue-50 z-40 bottom-[64px] left-0 h-[40%] w-full bg-white/80 backdrop-blur-sm rounded-t-lg flex flex-col overflow-hidden'>
            {/* ガイドブックリスト画面 */}
            <div className={`w-full h-full flex flex-col transform transition-transform duration-300 ease-in-out ${
              isGuideOpen ? '-translate-x-full' : 'translate-x-0'
            }`}>
              <div className='flex items-center justify-between p-4'>
                <h1 className='font-bold'>{getDisplayTitle()}</h1>        
                {selectedGuidebookId !== null && (
                  <button 
                    onClick={handleShowAll}
                    className='text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors'
                  >
                    全て表示
                  </button>
                )}
              </div>
              <div className='overflow-y-auto flex-1'>
                  {currentGuidebooks.map((guidebook) => (
                    <div 
                      key={guidebook.id}
                      className='flex items-center px-4 pb-1 pt-1 transition-colors duration-200 rounded-lg cursor-pointer hover:bg-gray-100'
                      onClick={() => handleGuidebookClick(guidebook)}
                    >
                        <img 
                          src={guidebook.image} 
                          alt="guidebook" 
                          className="w-15 h-15 aspect-square rounded-lg object-cover shadow-sm hover:shadow-md transition-shadow duration-200" 
                        />
                        <div className='ml-2 flex-1'>
                          <h2 className={`text-lg font-semibold transition-colors duration-200 ${
                            selectedGuidebookId === guidebook.id 
                              ? 'text-[#A90017] hover:text-[#940014]' 
                              : 'text-gray-900 hover:text-gray-700'
                          }`}>
                            {guidebook.title}
                          </h2>
                          <div className="text-sm text-gray-600 flex items-center">
                            <span>by {guidebook.author}</span> 
                            <span className="text-gray-400 flex items-center ml-2">
                              <UserPlus size={13} />{guidebook.followers}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleOpenGuide(guidebook, e)}
                          className="p-2 text-gray-400 hover:text-[#A90017] transition-colors"
                        >
                          <ChevronRight size={20} />
                        </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* 店舗リスト画面 */}
            <div className={`absolute top-0 left-0 w-full h-full flex flex-col transform transition-transform duration-300 ease-in-out ${
              isGuideOpen ? 'translate-x-0' : 'translate-x-full'
            }`}>
              {selectedGuide && (
                <>
                  <div className='flex items-center p-4 border-b border-gray-200'>
                    <button
                      onClick={handleCloseGuide}
                      className="p-2 text-gray-600 hover:text-gray-900"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <div className='ml-2 flex-1'>
                      <h1 className='font-bold text-gray-900'>{selectedGuide.title}</h1>
                      <div className='text-sm text-gray-600'>by <Link href={`/user/${selectedGuide.user_id}`} className=' underline'>{selectedGuide.author}</Link></div>
                    </div>
                  </div>
                  <div className='overflow-y-auto flex-1 p-4'>
                    <p className='text-gray-700 mb-4 text-sm leading-relaxed'>{selectedGuide.description}</p>
                    <h3 className="font-semibold text-gray-900 mb-3">掲載店舗（{selectedGuide.restaurants.length}店舗）</h3>
                    {selectedGuide.restaurants.map((restaurant: any) => (
                      <div 
                        key={restaurant.id} 
                        className="mb-3 p-3 bg-white/80 rounded-lg border border-gray-100 cursor-pointer hover:bg-white hover:shadow-sm transition-all duration-200"
                        onClick={() => handleRestaurantClick(restaurant)}
                      >
                        <div className="flex items-start">
                          <img
                            src={restaurant.image}
                            alt={restaurant.title}
                            className="w-16 h-16 object-cover rounded-lg mr-3"
                          />
                          <div className="flex-1">
                            <h4 className={`font-semibold mb-1 text-sm transition-colors duration-200 ${
                              selectedRestaurantId === restaurant.id 
                                ? 'text-[#A90017]' 
                                : 'text-gray-900'
                            }`}>
                              {restaurant.title}
                            </h4>
                            <div className="flex items-center mb-1">
                              <div className="flex items-center mr-3">
                                <Star size={14} className="text-yellow-400 mr-1" />
                                <span className="text-xs text-gray-600">{restaurant.rating}</span>
                              </div>
                              <span className="text-xs text-gray-600">{restaurant.priceRange}</span>
                            </div>
                            <p className="text-xs text-gray-700 leading-relaxed">{restaurant.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
        </div>

        <div className="fixed inset-0 z-1">
            <SimpleMap 
              markers={selectedMarkers} 
              selectedMarkerId={selectedRestaurantId}
              showOnlySelected={false}
              onDetailClick={handleDetailClick}
            />
        </div>
        {/* 店舗詳細オーバーレイ */}
          <div
              className={`fixed top-0 right-0 w-full max-w-[420px] h-full bg-white shadow-2xl transition-transform duration-300 ease-in-out z-99 ${
                detailOpen ? 'translate-x-0' : 'translate-x-full'
              }`}
              style={{
                transform: detailOpen ? 'translateX(0)' : 'translateX(100%)',
                boxShadow: '-2px 0 8px rgba(0,0,0,0.15)',
                overflowY: 'auto',
              }}
            >
              <button
                style={{
                  position: "absolute",
                  top: 16,
                  left: 16,
                  background: "#eee",
                  border: "none",
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  fontSize: 20,
                  cursor: "pointer",
                  zIndex: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                onClick={handleCloseDetail}
                aria-label="戻る"
              >
                <ArrowLeft size={20} />
              </button>
              {/* カバー画像 */}
              {detailData && !detailData.error && detailData.image_url && (
                <div style={{
                  width: "100%",
                  aspectRatio: "16/9",
                  position: "relative",
                  overflow: "hidden",
                  marginBottom: 0,
                }}>
                  <img
                    src={detailData.image_url}
                    alt={detailData.name || ""}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </div>
              )}
              <div style={{ padding: "32px 24px 24px 24px" }}>
                {loadingDetail ? (
                  <div>読み込み中...</div>
                ) : detailData && !detailData.error ? (
                  <div>
                    {detailData.name && (
                      <h2 className='mb-[4px] font-bold text-lg'>{detailData.name}</h2>
                    )}
                    {/* サブ画像（HotPepper画像） */}
                    {detailData.photo && detailData.photo.pc && detailData.photo.pc.l && (
                      <img
                        src={detailData.photo.pc.l}
                        alt={detailData.name}
                        style={{ width: "100%", borderRadius: 8, marginBottom: 16 }}
                      />
                    )}
                    {detailData.address && (
                      <div style={{ marginBottom: 8 }}>
                        <strong>住所:</strong> {detailData.address}
                      </div>
                    )}
                    {detailData.genre?.name && (
                      <div style={{ marginBottom: 8 }}>
                        <strong>ジャンル:</strong> {detailData.genre.name}
                      </div>
                    )}
                    {detailData.open && (
                      <div style={{ marginBottom: 8 }}>
                        <strong>営業時間:</strong> {detailData.open}
                      </div>
                    )}
                    {detailData.close && (
                      <div style={{ marginBottom: 8 }}>
                        <strong>定休日:</strong> {detailData.close}
                      </div>
                    )}
                    {detailData.access && (
                      <div style={{ marginBottom: 8 }}>
                        <strong>アクセス:</strong> {detailData.access}
                      </div>
                    )}
                    {detailData.tel && (
                      <div style={{ marginBottom: 8 }}>
                        <strong>電話番号:</strong> {detailData.tel}
                      </div>
                    )}
                    {detailData.hotpepper_id && (
                      <a
                        href={`https://www.hotpepper.jp/str${detailData.hotpepper_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-block",
                          marginTop: 16,
                          padding: "8px 16px",
                          background: "#ff9800",
                          color: "#fff",
                          borderRadius: 4,
                          textDecoration: "none",
                        }}
                      >
                        ホットペッパーでさらに詳しく見る
                      </a>
                    )}
                  </div>
                ) : (
                  <div>{detailData?.error || "詳細情報がありません。"}</div>
                )}
              </div>
        </div>
    </>
  );
}
