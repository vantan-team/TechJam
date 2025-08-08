"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { UserAvater } from "@/components/UserAvater";
import { Search, Users, ChevronLeft, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { getFriends, searchUsers, sendFriendRequest, type User } from "@/requests/user";

const friendList = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [friends, setFriends] = useState<User[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    setIsLoading(true);
    try {
      const response = await getFriends();
      if (response?.success) {
        setFriends(response.friends);
      }
    } catch (error) {
      console.error('Failed to load friends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearchLoading(true);
    try {
      const response = await searchUsers(searchQuery.trim());
      if (response?.success) {
        setSearchResults(response.users);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendFriendRequest = async (userId: number) => {
    try {
      const response = await sendFriendRequest(userId);
      if (response?.success) {
        // Update search results to reflect the new friend request status
        setSearchResults(prev => prev.map(user => 
          user.id === userId 
            ? { ...user, friend_status: 'pending' }
            : user
        ));
      }
    } catch (error) {
      console.error('Failed to send friend request:', error);
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
          <Users className="w-6 h-6 text-[#A90017]" />
          フレンドリスト
        </h1>
      </div>

      {/* Search Section */}
      <Card className="mb-6 bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-lg">
        <CardContent className="p-4">
          <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-start text-gray-500 border-gray-300 hover:border-[#A90017] hover:text-[#A90017] transition-all duration-200 transform hover:scale-[1.02] bg-white/80"
              >
                <Search className="w-4 h-4 mr-2" />
                フレンド検索
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white/95 backdrop-blur-sm">
              <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Search className="w-5 h-5 text-[#A90017]" />
                フレンド検索
              </DialogTitle>
              <div className="space-y-4">
                
                <Input
                  placeholder="ユーザー名で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/80 border-gray-300 focus:ring-[#A90017]/20"
                  style={{
                    '--tw-ring-color': 'rgba(169, 0, 23, 0.2)'
                  } as React.CSSProperties}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#A90017';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                />
                
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-700">検索結果</h3>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {searchResults.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-grow">
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                          <Button
                            size="sm"
                            disabled={user.friend_status !== 'none'}
                            onClick={() => handleSendFriendRequest(user.id)}
                            className="text-xs text-white transition-all duration-200"
                            style={{
                              backgroundColor: user.friend_status === 'none' ? '#A90017' : '#9ca3af',
                              borderColor: user.friend_status === 'none' ? '#A90017' : '#9ca3af'
                            }}
                          >
                            {user.friend_status === 'accepted' && '友達'}
                            {user.friend_status === 'pending' && '申請中'}
                            {user.friend_status === 'none' && (
                              <>
                                <UserPlus className="w-3 h-3 mr-1" />
                                追加
                              </>
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchResults([]);
                      setSearchQuery("");
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    キャンセル
                  </Button>
                  <Button
                    onClick={handleSearch}
                    disabled={searchLoading || !searchQuery.trim()}
                    className="flex-1 text-white transition-all duration-200 transform hover:scale-[1.02]"
                    style={{
                      backgroundColor: '#A90017',
                      borderColor: '#A90017'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#940014';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#A90017';
                    }}
                  >
                    {searchLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
                        検索中...
                      </div>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        検索
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Friends List */}
      <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            フレンド一覧 ({friends.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-[#A90017] rounded-full animate-spin"></div>
                フレンドリストを読み込み中...
              </div>
            </div>
          ) : friends.length > 0 ? (
            <UserAvater friends={friends} />
          ) : (
            <div className="text-center text-gray-500 py-12">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium mb-2">フレンドがいません</p>
              <p className="text-sm">上の検索ボタンから新しいフレンドを見つけましょう！</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default friendList;
