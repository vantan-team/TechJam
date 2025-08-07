'use client';

import { UserPlus, ChevronRight, ArrowLeft, Star } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

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
        <div className="w-16 h-16 border-4 border-gray-200 rounded-full animate-spin border-t-black mx-auto mb-4"></div>
        <p className="text-gray-800 font-medium">地図を読み込んでいます...</p>
      </div>
    </div>
  )
});

export default function FullScreenMapPage() {
  const [isClient, setIsClient] = useState(false);
  const [selectedMarkers, setSelectedMarkers] = useState<any[]>([]);
  const [selectedGuidebookId, setSelectedGuidebookId] = useState<number | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // ガイドブックデータ
  const guidebooks = [
    {
      id: 1,
      title: "名古屋で感動した中華まとめ",
      author: "ドンキー",
      followers: 30,
      image: "https://shirodashi.co.jp/wp-content/uploads/2020/11/3288bf4a573065863272d7792bdaece4.jpg",
      description: "名古屋で絶対に行くべき中華料理店を厳選しました。本格的な四川料理から地元で愛される老舗まで、必見のお店ばかりです。",
      restaurants: [
        {
          id: 1,
          position: [35.1815, 136.9066] as [number, number], // 名古屋駅周辺
          title: "陳麻婆豆腐 名古屋店",
          popup: "🥢 陳麻婆豆腐 名古屋店<br />本格四川料理の老舗",
          description: "本格的な四川料理が味わえる老舗中華料理店。特に麻婆豆腐は絶品で、本場の味を楽しめます。",
          image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400",
          rating: 4.5,
          priceRange: "¥¥¥"
        },
        {
          id: 2,
          position: [35.1669, 136.9001] as [number, number], // 栄周辺
          title: "龍の家",
          popup: "🐉 龍の家<br />地元で愛される中華料理店",
          description: "地元の人に愛され続ける中華料理店。リーズナブルな価格で本格的な中華が楽しめます。",
          image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400",
          rating: 4.2,
          priceRange: "¥¥"
        },
        {
          id: 3,
          position: [35.1712, 136.8815] as [number, number], // 金山周辺
          title: "味仙 今池本店",
          popup: "🌶️ 味仙 今池本店<br />名古屋名物台湾ラーメン発祥の店",
          description: "名古屋名物台湾ラーメン発祥の店として有名。辛くて美味しい台湾ラーメンは一度食べたらやみつきに。",
          image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400",
          rating: 4.3,
          priceRange: "¥¥"
        },
        {
          id: 4,
          position: [35.1858, 136.8992] as [number, number], // 大須周辺
          title: "中華料理 上海",
          popup: "🏮 中華料理 上海<br />老舗の中華料理店",
          description: "昭和から続く老舗の中華料理店。懐かしい味わいの中華料理が楽しめる隠れた名店です。",
          image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400",
          rating: 4.0,
          priceRange: "¥¥"
        }
      ]
    },
    {
      id: 2,
      title: "名古屋グルメ完全攻略",
      author: "フードハンター",
      followers: 45,
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Hitsumabushi_by_Naotake_Murayama.jpg/1280px-Hitsumabushi_by_Naotake_Murayama.jpg",
      description: "名古屋を代表するグルメを完全攻略！みそかつ、ひつまぶし、手羽先など、名古屋に来たら絶対に食べるべき名物料理の名店をご紹介。",
      restaurants: [
        {
          id: 5,
          position: [35.1709, 136.8811] as [number, number],
          title: "矢場とん 本店",
          popup: "🐷 矢場とん 本店<br />名古屋名物みそかつの名店",
          description: "名古屋名物みそかつの代表格。秘伝の八丁味噌だれが絶品で、観光客にも地元の人にも愛され続けています。",
          image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400",
          rating: 4.4,
          priceRange: "¥¥"
        },
        {
          id: 6,
          position: [35.1681, 136.9012] as [number, number],
          title: "ひつまぶし あつた蓬莱軒",
          popup: "🍱 ひつまぶし あつた蓬莱軒<br />ひつまぶし発祥の老舗",
          description: "ひつまぶし発祥の老舗として有名。3つの食べ方で楽しむ伝統の味は、名古屋グルメの王道です。",
          image: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=400",
          rating: 4.6,
          priceRange: "¥¥¥"
        },
        {
          id: 7,
          position: [35.1634, 136.9052] as [number, number],
          title: "世界の山ちゃん 本店",
          popup: "🍗 世界の山ちゃん 本店<br />手羽先で有名な居酒屋チェーン",
          description: "名古屋名物手羽先の代表格。スパイシーで病みつきになる味は、ビールとの相性も抜群です。",
          image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400",
          rating: 4.2,
          priceRange: "¥¥"
        },
        {
          id: 8,
          position: [35.1668, 136.9002] as [number, number],
          title: "風来坊 栄本店",
          popup: "🍗 風来坊 栄本店<br />手羽先唐揚げ発祥の店",
          description: "手羽先唐揚げ発祥の店として知られる老舗。シンプルながら奥深い味わいの手羽先が自慢です。",
          image: "https://images.unsplash.com/photo-1594221708779-94832f4320d1?w=400",
          rating: 4.3,
          priceRange: "¥¥"
        },
        {
          id: 9,
          position: [35.1702, 136.9101] as [number, number],
          title: "山本屋総本家",
          popup: "🍲 山本屋総本家<br />名古屋名物味噌煮込みうどん",
          description: "名古屋名物味噌煮込みうどんの老舗中の老舗。濃厚な八丁味噌のスープと固めの麺が絶妙なバランス。",
          image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400",
          rating: 4.1,
          priceRange: "¥¥"
        }
      ]
    },
    {
      id: 3,
      title: "名古屋の隠れ家カフェ特集",
      author: "カフェマニア",
      followers: 62,
      image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      description: "名古屋の知る人ぞ知る隠れ家カフェから有名店まで。コーヒー好きなら絶対に訪れたいカフェを厳選してご紹介します。",
      restaurants: [
        {
          id: 10,
          position: [35.1647, 136.9001] as [number, number],
          title: "コメダ珈琲店 本店",
          popup: "☕ コメダ珈琲店 本店<br />名古屋発祥の喫茶店チェーン",
          description: "名古屋発祥の喫茶店チェーンの本店。名物シロノワールは甘党にはたまらない一品です。",
          image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400",
          rating: 4.0,
          priceRange: "¥¥"
        },
        {
          id: 11,
          position: [35.1675, 136.9085] as [number, number],
          title: "珈琲所 コメダ珈琲店",
          popup: "☕ 珈琲所 コメダ珈琲店<br />シロノワールで有名",
          description: "落ち着いた雰囲気でゆっくりとコーヒーを楽しめる店舗。モーニングサービスも充実しています。",
          image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400",
          rating: 4.1,
          priceRange: "¥¥"
        },
        {
          id: 12,
          position: [35.1598, 136.8889] as [number, number],
          title: "喫茶マウンテン",
          popup: "🗻 喫茶マウンテン<br />奇想天外なメニューで有名",
          description: "奇想天外なメニューで有名なB級グルメの聖地。甘いスパゲティなど、他では味わえない体験ができます。",
          image: "https://images.unsplash.com/photo-1571167433940-4b5100e1d67c?w=400",
          rating: 3.8,
          priceRange: "¥"
        },
        {
          id: 13,
          position: [35.1723, 136.9234] as [number, number],
          title: "ブルーシール カフェ",
          popup: "🍦 ブルーシール カフェ<br />沖縄発のアイスクリーム店",
          description: "沖縄発の人気アイスクリーム店。トロピカルな味わいのアイスクリームが楽しめます。",
          image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400",
          rating: 4.2,
          priceRange: "¥¥"
        }
      ]
    }
  ];

  // デフォルトマーカー（全ガイドブックの店舗）
  const defaultMarkers = guidebooks.flatMap(guidebook => guidebook.restaurants);

  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null);

  // 初期状態では全マーカーを表示
  useEffect(() => {
    if (selectedMarkers.length === 0) {
      setSelectedMarkers(defaultMarkers);
    }
  }, [defaultMarkers, selectedMarkers.length]);

  // ガイドブッククリック処理
  const handleGuidebookClick = (guidebook: any) => {
    setSelectedMarkers(guidebook.restaurants);
    setSelectedGuidebookId(guidebook.id);
  };

  // 全て表示ボタンクリック処理
  const handleShowAll = () => {
    setSelectedMarkers(defaultMarkers);
    setSelectedGuidebookId(null);
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

  // クライアントサイドでのみレンダリング
  if (!isClient) {
    return (
      <div className="h-screen w-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full animate-spin border-t-black mx-auto mb-4"></div>
          <p className="text-gray-800 font-medium">地図を読み込んでいます...</p>
        </div>
      </div>
    );
  }

  return (
    <>
        <div className='fixed from-blue-50 z-50 bottom-[64px] left-0 h-[40%] w-full bg-white/80 backdrop-blur-sm rounded-t-lg flex flex-col overflow-hidden'>
            {/* ガイドブックリスト画面 */}
            <div className={`w-full h-full flex flex-col transform transition-transform duration-300 ease-in-out ${
              isGuideOpen ? '-translate-x-full' : 'translate-x-0'
            }`}>
              <div className='flex items-center justify-between p-4'>
                <h1 className='font-bold'>周辺の人気なガイドブック</h1>        
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
                  {guidebooks.map((guidebook) => (
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
                      <p className='text-sm text-gray-600'>by {selectedGuide.author}</p>
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
            />
        </div>
    </>
  );
}
