<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Models\Friend;
use App\Models\Follower;
use Carbon\Carbon;

class NotificationController extends Controller
{
    /**
     * ユーザーの通知一覧を取得
     */
    public function index(): JsonResponse
    {
        $user = Auth::user();
        $notifications = collect();

        // 1. フレンドリクエスト通知（受信したpending状態）
        $friendRequests = Friend::where('friend_user_id', $user->id)
            ->where('status', 'pending')
            ->with('user:id,name,profile_photo_url')
            ->orderBy('requested_at', 'desc')
            ->get()
            ->map(function ($friendRequest) {
                return [
                    'id' => 'friend_request_' . $friendRequest->id,
                    'type' => 'friend_request',
                    'title' => 'フレンドリクエスト',
                    'message' => $friendRequest->user->name . 'さんからフレンドリクエストが届きました',
                    'user' => [
                        'id' => $friendRequest->user->id,
                        'name' => $friendRequest->user->name,
                        'profile_photo_url' => $friendRequest->user->profile_photo_url
                    ],
                    'data' => [
                        'friend_request_id' => $friendRequest->id,
                        'user_id' => $friendRequest->user->id
                    ],
                    'created_at' => $friendRequest->requested_at,
                    'is_read' => false
                ];
            });

        // 2. フレンド承認通知（自分が送ったリクエストが承認された）
        $acceptedFriends = Friend::where('user_id', $user->id)
            ->where('status', 'accepted')
            ->where('accepted_at', '>=', Carbon::now()->subDays(7)) // 1週間以内
            ->with('friend:id,name,profile_photo_url')
            ->orderBy('accepted_at', 'desc')
            ->get()
            ->map(function ($friendship) {
                return [
                    'id' => 'friend_accepted_' . $friendship->id,
                    'type' => 'friend_accepted',
                    'title' => 'フレンドリクエスト承認',
                    'message' => $friendship->friend->name . 'さんがフレンドリクエストを承認しました',
                    'user' => [
                        'id' => $friendship->friend->id,
                        'name' => $friendship->friend->name,
                        'profile_photo_url' => $friendship->friend->profile_photo_url
                    ],
                    'data' => [
                        'user_id' => $friendship->friend->id
                    ],
                    'created_at' => $friendship->accepted_at,
                    'is_read' => false
                ];
            });

        // 3. 新しいフォロワー通知
        $newFollowers = Follower::where('followed_user_id', $user->id)
            ->where('created_at', '>=', Carbon::now()->subDays(7)) // 1週間以内
            ->with('follower:id,name,profile_photo_url')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($follow) {
                return [
                    'id' => 'new_follower_' . $follow->id,
                    'type' => 'new_follower',
                    'title' => '新しいフォロワー',
                    'message' => $follow->follower->name . 'さんがあなたをフォローしました',
                    'user' => [
                        'id' => $follow->follower->id,
                        'name' => $follow->follower->name,
                        'profile_photo_url' => $follow->follower->profile_photo_url
                    ],
                    'data' => [
                        'user_id' => $follow->follower->id
                    ],
                    'created_at' => $follow->created_at,
                    'is_read' => false
                ];
            });

        // 全ての通知をマージして時系列順にソート
        $notifications = $friendRequests
            ->merge($acceptedFriends)
            ->merge($newFollowers)
            ->sortByDesc('created_at')
            ->values();

        // 未読数をカウント（フレンドリクエストは常に未読扱い）
        $unreadCount = $friendRequests->count() + 
                      $acceptedFriends->count() + 
                      $newFollowers->count();

        return response()->json([
            'success' => true,
            'data' => [
                'notifications' => $notifications,
                'unread_count' => $unreadCount
            ]
        ]);
    }

    /**
     * 通知の未読数のみを取得
     */
    public function unreadCount(): JsonResponse
    {
        $user = Auth::user();

        // フレンドリクエスト数
        $friendRequestCount = Friend::where('friend_user_id', $user->id)
            ->where('status', 'pending')
            ->count();

        // 最近承認されたフレンド数（1週間以内）
        $recentAcceptedCount = Friend::where('user_id', $user->id)
            ->where('status', 'accepted')
            ->where('accepted_at', '>=', Carbon::now()->subDays(7))
            ->count();

        // 新しいフォロワー数（1週間以内）
        $newFollowerCount = Follower::where('followed_user_id', $user->id)
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->count();

        $totalUnread = $friendRequestCount + $recentAcceptedCount + $newFollowerCount;

        return response()->json([
            'success' => true,
            'data' => [
                'unread_count' => $totalUnread,
                'friend_requests' => $friendRequestCount,
                'friend_accepted' => $recentAcceptedCount,
                'new_followers' => $newFollowerCount
            ]
        ]);
    }
}