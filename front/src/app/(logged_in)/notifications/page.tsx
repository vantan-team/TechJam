"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bell,
  ChevronLeft,
  Check,
  X,
  User,
  UserCheck,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { unreadCountAtom } from "@/atoms/notification";
import {
  getNotifications,
  acceptFriendRequest,
  deleteFriend,
  markNotificationsAsRead,
  type Notification,
} from "@/requests/user";

const NotificationsPage = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [, setUnreadCount] = useAtom(unreadCountAtom);

  useEffect(() => {
    const clearNotifications = async () => {
      try {
        await markNotificationsAsRead();
        setUnreadCount(0);
      } catch (error) {
        console.error("Failed to mark notifications as read:", error);
      }
    };
    
    clearNotifications();
    loadNotifications();
    
    // 通知リストを15秒間隔でポーリング（ローディング非表示）
    const interval = setInterval(() => loadNotifications(false), 15000);
    
    return () => clearInterval(interval);
  }, [setUnreadCount]);

  const loadNotifications = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const response = await getNotifications();
      if (response?.success && response.data?.notifications) {
        setNotifications(response.data.notifications);
      } else {
        console.warn("Invalid notification response:", response);
        setNotifications([]);
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
      setNotifications([]);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const handleAcceptFriend = async (
    notificationId: string,
    friendRequestId: number
  ) => {
    if (processingIds.has(notificationId)) return;

    setProcessingIds((prev) => new Set(prev).add(notificationId));
    try {
      const response = await acceptFriendRequest(friendRequestId);
      if (response?.success) {
        // 通知リストから削除
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        
        // 通知リストを再読み込みして新しい承認通知を表示
        setTimeout(() => {
          loadNotifications(false);
        }, 1000);
      }
    } catch (error) {
      console.error("Failed to accept friend request:", error);
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const handleRejectFriend = async (
    notificationId: string,
    friendRequestId: number
  ) => {
    if (processingIds.has(notificationId)) return;

    setProcessingIds((prev) => new Set(prev).add(notificationId));
    try {
      const response = await deleteFriend(friendRequestId);
      if (response?.success) {
        // 通知リストから削除
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      }
    } catch (error) {
      console.error("Failed to reject friend request:", error);
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins}分前`;
    } else if (diffHours < 24) {
      return `${diffHours}時間前`;
    } else if (diffDays < 7) {
      return `${diffDays}日前`;
    } else {
      return date.toLocaleDateString("ja-JP");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "friend_request":
        return <User className="w-5 h-5 text-blue-600" />;
      case "friend_accepted":
        return <UserCheck className="w-5 h-5 text-green-600" />;
      case "new_follower":
        return <Users className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      {/* Header */}
      <div className="flex items-center mb-6 pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mr-2 text-gray-600 hover:text-[#A90017] hover:bg-[#A90017]/10 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bell className="w-6 h-6 text-[#A90017]" />
          通知
        </h1>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-[#A90017] rounded-full animate-spin"></div>
                  通知を読み込み中...
                </div>
              </div>
            </CardContent>
          </Card>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className="bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-lg hover:shadow-xl transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* User Avatar */}
                  <div className="flex-shrink-0 mt-1">
                    {notification.user?.profile_photo_url ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                        <img 
                          src={notification.user.profile_photo_url} 
                          alt={notification.user.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) {
                              fallback.classList.remove('hidden');
                              fallback.classList.add('flex');
                            }
                          }}
                        />
                        <div className="hidden w-full h-full bg-gradient-to-br from-[#A90017] to-[#940014] items-center justify-center text-white font-semibold text-xs">
                          {notification.user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A90017] to-[#940014] flex items-center justify-center text-white font-semibold text-xs">
                        {notification.user?.name?.charAt(0).toUpperCase() || getNotificationIcon(notification.type)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-grow">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {notification.title}
                    </h3>
                    <p className="text-gray-700 mb-2">
                      {notification.type === "friend_request" && (
                        <>
                          <span className="font-medium text-[#A90017]">{notification.user?.name || "ユーザー"}</span>
                          さんからフレンドリクエストが届きました
                        </>
                      )}
                      {notification.type === "friend_accepted" && (
                        <>
                          <span className="font-medium text-green-600">{notification.user?.name || "ユーザー"}</span>
                          さんがあなたのフレンドリクエストを承認しました！
                        </>
                      )}
                      {notification.type === "new_follower" && (
                        <>
                          <span className="font-medium text-blue-600">{notification.user?.name || "ユーザー"}</span>
                          さんがあなたをフォローしました
                        </>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(notification.created_at)}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 flex-shrink-0">
                    {notification.type === "friend_request" && notification.data.friend_request_id && (
                      <>
                        <Button
                          size="sm"
                          disabled={processingIds.has(notification.id)}
                          onClick={() =>
                            handleAcceptFriend(
                              notification.id,
                              notification.data.friend_request_id!
                            )
                          }
                          className="text-white transition-all duration-200 transform hover:scale-[1.02]"
                          style={{
                            backgroundColor: "#A90017",
                            borderColor: "#A90017"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#940014";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#A90017";
                          }}
                        >
                          {processingIds.has(notification.id) ? (
                            <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
                          ) : (
                            <Check className="w-3 h-3" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={processingIds.has(notification.id)}
                          onClick={() =>
                            handleRejectFriend(
                              notification.id,
                              notification.data.friend_request_id!
                            )
                          }
                          className="border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 transform hover:scale-[1.02]"
                        >
                          {processingIds.has(notification.id) ? (
                            <div className="w-3 h-3 border border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                          ) : (
                            <X className="w-3 h-3" />
                          )}
                        </Button>
                      </>
                    )}
                    {notification.type === "friend_accepted" && (
                      <Button
                        size="sm"
                        className="text-white transition-all duration-200 transform hover:scale-[1.02]"
                        style={{
                          backgroundColor: "#16a34a",
                          borderColor: "#16a34a"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#15803d";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#16a34a";
                        }}
                      >
                        ✓ 承認済み
                      </Button>
                    )}
                    {notification.type === "new_follower" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 transform hover:scale-[1.02]"
                      >
                        フォロー返し
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-lg">
            <CardContent className="p-12">
              <div className="text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium mb-2">通知がありません</p>
                <p className="text-sm">新しい通知が届くとここに表示されます</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
