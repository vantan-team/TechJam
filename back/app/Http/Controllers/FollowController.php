<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\FollowRequest;
use App\Models\Follower;
use App\Models\User;
use App\Models\Friend;

class FollowController extends Controller
{
    /**
     * ログインユーザーが指定ユーザーをフォローしているか判定
     */
    public function followStatus($id): JsonResponse
    {
        $currentUser = Auth::user();
        $targetUser = User::find($id);
        if (!$currentUser || !$targetUser) {
            return response()->json([
                'success' => false,
                'message' => 'ユーザーが見つかりません',
                'is_following' => false
            ], 404);
        }
        $isFollowing = $currentUser->isFollowingCheck($targetUser);
        return response()->json([
            'success' => true,
            'is_following' => $isFollowing
        ]);
    }
    /**
     * フォロー/アンフォロー処理
     */
    public function follow(FollowRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $followUserId = $validated['follow_user_id'];
        $type = $validated['type'];
        $currentUserId = Auth::id();

        // 自分自身をフォローしようとした場合
        if ($currentUserId === $followUserId) {
            return response()->json([
                'success' => false,
                'message' => '自分自身をフォローすることはできません'
            ], 400);
        }

        // フォローしようとするユーザーが存在するかチェック
        $targetUser = User::find($followUserId);
        if (!$targetUser) {
            return response()->json([
                'success' => false,
                'message' => 'The session did not exist in this universe.',
                'user' => (object)[]
            ], 404);
        }

        if ($type === 'follow') {
            // 既にフォローしているかチェック
            $existingFollow = Follower::where('follower_user_id', $currentUserId)
                ->where('followed_user_id', $followUserId)
                ->first();

            if ($existingFollow) {
                return response()->json([
                    'success' => false,
                    'message' => "You're already following or unfollowing"
                ], 400);
            }

            // フォロー関係を作成
            Follower::create([
                'follower_user_id' => $currentUserId,
                'followed_user_id' => $followUserId
            ]);

            return response()->json([
                'success' => true,
                'message' => 'followed'
            ]);

        } else { // unfollow
            // フォロー関係を削除
            $deleted = Follower::where('follower_user_id', $currentUserId)
                ->where('followed_user_id', $followUserId)
                ->delete();

            if ($deleted === 0) {
                return response()->json([
                    'success' => false,
                    'message' => "You're already following or unfollowing"
                ], 400);
            }

            return response()->json([
                'success' => true,
                'message' => 'unfollowed'
            ]);
        }
    }

    /**
     * 指定ユーザーのフォローリスト取得
     */
    public function getFollowed($id): JsonResponse
    {
        $currentUserId = Auth::id();

        // 指定されたユーザーが存在するかチェック
        $targetUser = User::find($id);
        if (!$targetUser) {
            return response()->json([
                'success' => false,
                'message' => 'The session did not exist in this universe.'
            ], 404);
        }

        // プライバシーチェック: 非公開ユーザーで関係性がない場合
        $currentUser = Auth::user();
        if ($targetUser->private && (!$currentUser || !$this->areConnected($currentUser, $targetUser))) {
            return response()->json([
                'success' => false,
                'message' => 'このユーザーのプロフィールは非公開です'
            ], 403);
        }

        try {
            $followedUsers = User::whereIn('id', function($query) use ($id) {
                $query->select('followed_user_id')
                      ->from('followers')
                      ->where('follower_user_id', $id);
            })
            ->get()
            ->map(function($user) use ($currentUserId) {
                return [
                    'id' => (string) $user->id,
                    'name' => $user->name,
                    'introduction' => $user->introduction ?? '',
                    'profilePhotoUrl' => $user->profile_photo_url ?? '',
                    'follow' => $user->following()->count(),
                    'follower' => $user->followers()->count(),
                    'is_friend' => $this->checkIfFriend($currentUserId, $user->id)
                ];
            });

            return response()->json([
                'success' => true,
                'message' => '',
                'followed' => $followedUsers
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'The session did not exist in this universe.'
            ], 500);
        }
    }

    /**
     * ユーザー間の関係性をチェック（フレンドまたはフォロー関係）
     */
    private function areConnected(User $currentUser, User $targetUser): bool
    {
        // フレンド関係をチェック
        $isFriend = Friend::where(function ($query) use ($currentUser, $targetUser) {
            $query->where('user_id', $currentUser->id)
                  ->where('friend_user_id', $targetUser->id);
        })->orWhere(function ($query) use ($currentUser, $targetUser) {
            $query->where('user_id', $targetUser->id)
                  ->where('friend_user_id', $currentUser->id);
        })->where('status', 'accepted')->exists();

        // フォロー関係もチェック
        $isFollowing = Follower::where(function ($query) use ($currentUser, $targetUser) {
            $query->where('follower_user_id', $currentUser->id)
                  ->where('followed_user_id', $targetUser->id);
        })->orWhere(function ($query) use ($currentUser, $targetUser) {
            $query->where('follower_user_id', $targetUser->id)
                  ->where('followed_user_id', $currentUser->id);
        })->exists();

        return $isFriend || $isFollowing;
    }

    /**
     * フレンド関係をチェック
     */
    private function checkIfFriend(?int $userId1, int $userId2): bool
    {
        if (!$userId1) return false;

        return Friend::where(function ($query) use ($userId1, $userId2) {
            $query->where('user_id', $userId1)
                  ->where('friend_user_id', $userId2);
        })
        ->orWhere(function ($query) use ($userId1, $userId2) {
            $query->where('user_id', $userId2)
                  ->where('friend_user_id', $userId1);
        })
        ->where('status', 'accepted')
        ->exists();
    }
}
