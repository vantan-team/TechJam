'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import { userAtom } from '@/atoms/user';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus, Edit, Users, Star, MapPin, Calendar, Clock, UserCheck } from 'lucide-react';
import type { UserProfile, VisitedHistory, GuideBook } from '@/types/user';
import { getUserProfile, getVisitedHistory, getGuideBooks, followUser, getUserFollowStatus, getFriendStatus, sendFriendRequest } from '@/requests/user';
import EditProfileModal from '@/components/EditProfileModal';
import Link from 'next/link';


export default function UserPage() {
  const params = useParams();
  const router = useRouter();
  const [currentUser, setUser] = useAtom(userAtom);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [friendStatus, setFriendStatus] = useState<"none" | "pending" | "accepted">("none");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'guidebooks' | 'activities'>('guidebooks');
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [visitedHistory, setVisitedHistory] = useState<VisitedHistory[]>([]);
  const [guideBooks, setGuideBooks] = useState<GuideBook[]>([]);
  const userId = params.id as string;
  const isOwnProfile = currentUser?.id?.toString() === userId;

  // 月ごとにグループ化（来店履歴）
  const groupVisitedByMonth = (history: VisitedHistory[]) => {
    const grouped: { [key: string]: VisitedHistory[] } = {};
    history.forEach(item => {
      const dateObj = item.visited_at ? new Date(item.visited_at) : null;
      const monthKey = dateObj
        ? dateObj.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })
        : '日付不明';
      if (!grouped[monthKey]) grouped[monthKey] = [];
      grouped[monthKey].push(item);
    });
    return grouped;
  };

  const groupedVisited = groupVisitedByMonth(visitedHistory);

  // スワイプ処理
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    
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

  useEffect(() => {
    const fetchUserProfileAndHistory = async () => {
      try {
        const profile = await getUserProfile(userId);
        const visited = await getVisitedHistory(userId);
        const books = await getGuideBooks(userId);
        let isFollowing: boolean | undefined = undefined;
        if (profile) {
          isFollowing = await getUserFollowStatus(userId);
        }
        setUserProfile(profile ? { ...profile, isFollowing, guidebooksCount: books.length } : null);
        setVisitedHistory(
          visited
            .filter(v => v.name)
            .sort((a, b) => {
              const da = a.visited_at ? new Date(a.visited_at).getTime() : 0;
              const db = b.visited_at ? new Date(b.visited_at).getTime() : 0;
              return db - da;
            })
        );
        setGuideBooks(books);

        // フレンド状態取得
        if (!isOwnProfile) {
          const status = await getFriendStatus(userId);
          setFriendStatus(status);
        }
      } catch (error) {
        console.error('ユーザー情報または来店履歴・ガイドブックの取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfileAndHistory();
  }, [userId, currentUser, isOwnProfile]);

  const handleFollowToggle = async () => {
    if (!userProfile) return;

    const nextType = userProfile.isFollowing ? "unfollow" : "follow";
    try {
      const res = await followUser({
        follow_user_id: Number(userProfile.id),
        type: nextType,
      });
      if (res.success) {
        setUserProfile({
          ...userProfile,
          isFollowing: !userProfile.isFollowing,
          followersCount: userProfile.isFollowing
            ? (userProfile.followersCount || 0) - 1
            : (userProfile.followersCount || 0) + 1,
        });
      }
    } catch (error) {
      console.error('フォロー状態の更新に失敗しました:', error);
    }
  };

  const handleFriendRequest = async () => {
    if (!userProfile) return;
    try {
      const res = await sendFriendRequest(Number(userId));
      if (res?.success) {
        setFriendStatus("pending");
      }
    } catch (error) {
      console.error('フレンド申請に失敗しました:', error);
    }
  };

  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleEditProfile = () => {
    setEditModalOpen(true);
  };

  const formatVisitedDate = (visited_at: string) => {
    if (!visited_at) return '';
    const d = new Date(visited_at);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
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
    <>
      <div className="min-h-screen bg-gray-50 pb-20">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-6">
          {/* プロフィール画像と基本情報 */}
          <div className="flex items-start space-x-4 mb-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={`${process.env.NEXT_PUBLIC_API_ROOT}${userProfile?.profilePhotoUrl}`} alt={userProfile.name} className=' object-cover' />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                {userProfile?.name}
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
                  <Link href={`./${userProfile.id}/followered`}>
                    <div className="text-lg font-bold text-gray-900">{userProfile.followersCount || 0}</div>
                  </Link>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600">フォロー中</div>
                  <Link href={`./${userProfile.id}/followed`}>
                    <div className="text-lg font-bold text-gray-900">{userProfile.followingCount || 0}</div>
                  </Link>
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
                    disabled={friendStatus === "pending" || friendStatus === "accepted"}
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {friendStatus === "accepted" ? (
                      <UserCheck size={16} />
                    ) : friendStatus === "pending" ? (
                      <Clock size={16} />
                    ) : (
                      <UserPlus size={16} />
                    )}
                    {friendStatus === "accepted"
                      ? "フレンド"
                      : friendStatus === "pending"
                        ? "申請中"
                        : "フレンド追加"}
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
              来店履歴
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
                
                {guideBooks.length > 0 ? (
                  <div className="space-y-3">
                    {guideBooks.map((book, index) => (
                      <div 
                        key={index} 
                        className="group flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 bg-white hover:shadow-sm border border-neutral-200"
                        style={{ borderLeft: '3px solid #A90017' }}
                        onClick={() => router.push(`/guidebook/${book.id}`)}
                      >
                        <img
                          src={book.cover_image || "/icon-256x256.png"}
                          alt={book.title}
                          className="w-12 h-12 rounded-lg object-cover mr-3"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 text-sm group-hover:text-[#A90017] transition-colors">
                            {book.title}
                          </h3>
                          <div className="flex items-center text-xs text-gray-600 mt-1">
                            <MapPin size={12} className="mr-1" />
                            <span>{book.geo}</span>
                            {book.genre && (
                              <>
                                <span className="mx-2">|</span>
                                <span>{book.genre}</span>
                              </>
                            )}
                          </div>
                          {book.memo && (
                            <div className="text-xs text-gray-500 mt-1">{book.memo}</div>
                          )}
                        </div>
                        <div className="text-[#A90017] opacity-60 group-hover:opacity-100 transition-opacity">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    ))}
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

          {/* 来店履歴（月ごとのタイムライン） */}
          <div className="w-1/2 pl-2">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">来店履歴</h2>
                <Calendar size={20} className="text-gray-400" />
              </div>
              
              {userProfile.isPrivate && !isOwnProfile ? (
                <div className="text-center py-10 text-gray-500 text-sm">
                  <MapPin size={32} className="mx-auto mb-2 opacity-50" />
                  このユーザーの来店履歴は非公開です
                </div>
              ) : visitedHistory.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-sm">
                  <MapPin size={32} className="mx-auto mb-2 opacity-50" />
                  {isOwnProfile
                    ? 'まだ来店履歴がありません'
                    : `${userProfile.name}さんの来店履歴はまだありません`}
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedVisited).map(([month, monthHistory]) => (
                    <div key={month}>
                      {/* 月ヘッダー */}
                      <div className="sticky top-0 bg-white py-2 mb-3">
                        <h3 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-1">
                          {month}
                        </h3>
                      </div>
                      
                      {/* 月の活動リスト */}
                      <div className="space-y-3 ml-2">
                        {monthHistory.map((item, index) => {
                          const dateLabel = formatVisitedDate(item.visited_at);
                          return (
                            <div key={`${item.hotpepper_id}-${index}`} className="relative">
                              {/* タイムライン線 */}
                              {index < monthHistory.length - 1 && (
                                <div className="absolute left-2 top-8 w-0.5 h-6 bg-gray-200"></div>
                              )}
                              
                              {/* 履歴アイテム */}
                              <div className="flex items-start">
                                <div className="flex-shrink-0 w-4 h-4 mt-1 mr-3 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#A90017]"></div>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center mb-1">
                                    <MapPin size={16} className="text-[#A90017]" />
                                    {dateLabel && (
                                      <span className="ml-2 text-xs text-gray-500">
                                        {dateLabel}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-700 leading-relaxed mb-1">
                                    {item.name}
                                  </p>
                                  {item.memo && (
                                    <p className="text-xs text-gray-500">
                                      {item.memo}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
      <EditProfileModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={async ({ name, bio, profilePhotoUrl }) => {
          const { updateUserProfile } = await import('@/requests/user');
          const res = await updateUserProfile({ name, bio, profilePhotoUrl });
          if (res.success) {
            const updated = await getUserProfile(userId);
            if (updated) setUserProfile({ ...updated, isFollowing: userProfile.isFollowing, guidebooksCount: userProfile.guidebooksCount });
            // グローバルユーザー情報も更新
            const { getUserAuthStatus } = await import('@/requests/user');
            const userStatus = await getUserAuthStatus();
            if (userStatus?.isLoggedIn && setUser) {
              setUser(userStatus.user);
            }
            setEditModalOpen(false);
          } else {
            alert(res.message?.[0] || 'プロフィール更新に失敗しました');
          }
        }}
        initialName={userProfile.name}
        initialBio={userProfile.bio || ''}
        initialProfilePhotoUrl={userProfile.profilePhotoUrl || ''}
      />
    </>
  );
}
