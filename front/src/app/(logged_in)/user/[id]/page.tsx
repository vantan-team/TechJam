'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAtom } from 'jotai';
import { userAtom } from '@/atoms/user';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus, Edit, Users, Star, MapPin, Calendar } from 'lucide-react';
import type { User } from '@/types/user';

interface UserProfile extends User {
  bio?: string;
  followersCount?: number;
  followingCount?: number;
  guidebooksCount?: number;
  isFollowing?: boolean;
  isFriend?: boolean;
}

interface Activity {
  id: string;
  type: 'guidebook' | 'favorite' | 'follow';
  title: string;
  description: string;
  date: Date;
  icon: 'guidebook' | 'star' | 'users';
}

export default function UserPage() {
  const params = useParams();
  const [currentUser] = useAtom(userAtom);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'guidebooks' | 'activities'>('guidebooks');
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const userId = params.id as string;
  const isOwnProfile = false;

  // 月ごとにグループ化
  const groupActivitiesByMonth = (activities: Activity[]) => {
    const grouped: { [key: string]: Activity[] } = {};
    
    activities.forEach(activity => {
      const monthKey = activity.date.toLocaleDateString('ja-JP', { 
        year: 'numeric', 
        month: 'long' 
      });
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(activity);
    });
    
    return grouped;
  };

  const groupedActivities = groupActivitiesByMonth(activities);

  // スワイプ処理
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && activeTab === 'guidebooks') {
      setActiveTab('activities');
    } else if (isRightSwipe && activeTab === 'activities') {
      setActiveTab('guidebooks');
    }

    setTouchStartX(null);
    setTouchEndX(null);
  };

  // ダミーデータ（実際の実装では、APIからユーザー情報を取得）
  useEffect(() => {
    setLoading(false);
    const fetchUserProfile = async () => {
      try {
        const userProfile = await getUserProfile(userId);
        const activities = await getUserActivities(userId);

        setUserProfile(userProfile);
        setActivities(activities);
      } catch (error) {
        console.error('ユーザー情報の取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchUserProfile();
    }
    fetchUserProfile();
  }, [userId, currentUser, isOwnProfile]);

  const handleFollowToggle = async () => {
    if (!userProfile) return;
    
    try {
      // 実際の実装では、ここでフォロー/アンフォローのAPIを呼び出し
      setUserProfile({
        ...userProfile,
        isFollowing: !userProfile.isFollowing,
        followersCount: userProfile.isFollowing 
          ? (userProfile.followersCount || 0) - 1 
          : (userProfile.followersCount || 0) + 1
      });
    } catch (error) {
      console.error('フォロー状態の更新に失敗しました:', error);
    }
  };

  const handleFriendRequest = async () => {
    if (!userProfile) return;
    
    try {
      // 実際の実装では、ここでフレンド申請のAPIを呼び出し
      setUserProfile({
        ...userProfile,
        isFriend: true
      });
    } catch (error) {
      console.error('フレンド申請に失敗しました:', error);
    }
  };

  const handleEditProfile = () => {
    // 実際の実装では、プロフィール編集ページに遷移
    console.log('プロフィール編集ページに遷移');
  };

  const getActivityIcon = (iconType: string) => {
    switch (iconType) {
      case 'guidebook':
        return <MapPin size={16} className="text-[#A90017]" />;
      case 'star':
        return <Star size={16} className="text-yellow-500" />;
      case 'users':
        return <Users size={16} className="text-blue-500" />;
      default:
        return <MapPin size={16} className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full animate-spin border-t-[#A90017] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">ユーザー情報を読み込んでいます...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">😅</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">ユーザーが見つかりません</h3>
          <p className="text-gray-600">指定されたユーザーは存在しないか、削除されています。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-6">
          {/* プロフィール画像と基本情報 */}
          <div className="flex items-start space-x-4 mb-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={userProfile.profilePhotoUrl} alt={userProfile.name} />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                {userProfile.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{userProfile.name}</h1>
              
              {/* 統計情報 */}
              <div className="flex items-center space-x-6 mb-3">
                <div className="text-center">
                  <div className="text-xs text-gray-600">ガイドブック</div>
                  <div className="text-lg font-bold text-gray-900">{userProfile.guidebooksCount || 0}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600">フォロワー</div>
                  <div className="text-lg font-bold text-gray-900">{userProfile.followersCount || 0}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600">フォロー中</div>
                  <div className="text-lg font-bold text-gray-900">{userProfile.followingCount || 0}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-left">
            {userProfile.bio && (
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {userProfile.bio}
              </p>
            )}
            
            {/* アクションボタン */}
            <div className="flex space-x-3">
              {isOwnProfile ? (
                <Button 
                  onClick={handleEditProfile}
                  className="flex-1 bg-[#A90017] hover:bg-[#940014] text-white"
                >
                  <Edit size={16} />
                  編集
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={handleFollowToggle}
                    variant={userProfile.isFollowing ? "outline" : "default"}
                    className={`flex-1 ${
                      userProfile.isFollowing 
                        ? "border-[#A90017] text-[#A90017] hover:bg-[#A90017] hover:text-white" 
                        : "bg-[#A90017] hover:bg-[#940014] text-white"
                    }`}
                  >
                    <Users size={16} />
                    {userProfile.isFollowing ? "フォロー中" : "フォロー"}
                  </Button>
                  
                  <Button 
                    onClick={handleFriendRequest}
                    variant="outline"
                    disabled={userProfile.isFriend}
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <UserPlus size={16} />
                    {userProfile.isFriend ? "フレンド" : "フレンド追加"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto">
          <div className="flex">
            <button
              onClick={() => setActiveTab('guidebooks')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'guidebooks'
                  ? 'text-[#A90017] border-b-2 border-[#A90017]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              ガイドブック
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'activities'
                  ? 'text-[#A90017] border-b-2 border-[#A90017]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              最近の活動
            </button>
          </div>
        </div>
      </div>

      {/* コンテンツエリア */}
      <div 
        className="max-w-md mx-auto px-4 py-6 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex transition-transform duration-300 ease-in-out"
          style={{ 
            transform: `translateX(${activeTab === 'guidebooks' ? '0%' : '-50%'})`,
            width: '200%'
          }}
        >
          {/* ガイドブック一覧 */}
          <div className="w-1/2 pr-2">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">ガイドブック</h2>
                <span className="text-sm text-gray-500">{userProfile.guidebooksCount || 0}件</span>
              </div>
              
              {(userProfile.guidebooksCount || 0) > 0 ? (
                <div className="space-y-3">
                  {/* ダミーのガイドブック */}
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <img 
                      src="https://shirodashi.co.jp/wp-content/uploads/2020/11/3288bf4a573065863272d7792bdaece4.jpg" 
                      alt="ガイドブック" 
                      className="w-12 h-12 rounded-lg object-cover mr-3"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm">名古屋グルメ完全攻略</h3>
                      <div className="flex items-center text-xs text-gray-600 mt-1">
                        <MapPin size={12} className="mr-1" />
                        <span>8店舗</span>
                        <Star size={12} className="ml-3 mr-1 text-yellow-400" />
                        <span>4.5</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1511920170033-f8396924c348?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                      alt="ガイドブック" 
                      className="w-12 h-12 rounded-lg object-cover mr-3"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm">隠れ家カフェ特集</h3>
                      <div className="flex items-center text-xs text-gray-600 mt-1">
                        <MapPin size={12} className="mr-1" />
                        <span>5店舗</span>
                        <Star size={12} className="ml-3 mr-1 text-yellow-400" />
                        <span>4.2</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400" 
                      alt="ガイドブック" 
                      className="w-12 h-12 rounded-lg object-cover mr-3"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm">秋の名古屋スイーツ巡り</h3>
                      <div className="flex items-center text-xs text-gray-600 mt-1">
                        <MapPin size={12} className="mr-1" />
                        <span>6店舗</span>
                        <Star size={12} className="ml-3 mr-1 text-yellow-400" />
                        <span>4.3</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MapPin size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {isOwnProfile 
                      ? "まだガイドブックがありません" 
                      : `${userProfile.name}さんはまだガイドブックを作成していません`
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 最近の活動（月ごとのタイムライン） */}
          <div className="w-1/2 pl-2">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">最近の活動</h2>
                <Calendar size={20} className="text-gray-400" />
              </div>
              
              <div className="space-y-6">
                {Object.entries(groupedActivities).map(([month, monthActivities]) => (
                  <div key={month}>
                    {/* 月ヘッダー */}
                    <div className="sticky top-0 bg-white py-2 mb-3">
                      <h3 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-1">
                        {month}
                      </h3>
                    </div>
                    
                    {/* 月の活動リスト */}
                    <div className="space-y-3 ml-2">
                      {monthActivities.map((activity, index) => (
                        <div key={activity.id} className="relative">
                          {/* タイムライン線 */}
                          {index < monthActivities.length - 1 && (
                            <div className="absolute left-2 top-8 w-0.5 h-6 bg-gray-200"></div>
                          )}
                          
                          {/* 活動アイテム */}
                          <div className="flex items-start">
                            <div className="flex-shrink-0 w-4 h-4 mt-1 mr-3 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center mb-1">
                                {getActivityIcon(activity.icon)}
                                <span className="ml-2 text-xs text-gray-500">
                                  {activity.date.toLocaleDateString('ja-JP', { 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed mb-1">
                                {activity.title}
                              </p>
                              {activity.description && (
                                <p className="text-xs text-gray-500">
                                  {activity.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
