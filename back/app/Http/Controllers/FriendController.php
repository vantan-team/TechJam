<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Friend;
use App\Models\User;

class FriendController extends Controller
{
    /**
     * 自分が承認済みの友達リストを取得
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // 自分が送信した承認済みフレンド申請
        $sentFriends = $user->friendRequestsSent()
            ->where('status', 'accepted')
            ->with('friend:id,name,email,profile_photo_url')
            ->get()
            ->map(function ($friendship) {
                return [
                    'id' => $friendship->friend->id,
                    'name' => $friendship->friend->name,
                    'email' => $friendship->friend->email,
                    'profile_photo_url' => $friendship->friend->profile_photo_url,
                    'accepted_at' => $friendship->accepted_at,
                ];
            });

        // 自分が受信した承認済みフレンド申請
        $receivedFriends = $user->friendRequestsReceived()
            ->where('status', 'accepted')
            ->with('user:id,name,email,profile_photo_url')
            ->get()
            ->map(function ($friendship) {
                return [
                    'id' => $friendship->user->id,
                    'name' => $friendship->user->name,
                    'email' => $friendship->user->email,
                    'profile_photo_url' => $friendship->user->profile_photo_url,
                    'accepted_at' => $friendship->accepted_at,
                ];
            });

        // 両方向のフレンドをマージ
        $friends = $sentFriends->merge($receivedFriends);

        return response()->json([
            'success' => true,
            'friends' => $friends->values(),
            'message' => ['フレンドリストを取得しました']
        ]);
    }

    /**
     * 指定ユーザーへ友達リクエストを送信
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'request_user_id' => 'required|integer|exists:users,id'
        ]);

        $user = $request->user();
        $targetUserId = $request->input('request_user_id');

        // 自分自身にフレンド申請はできない
        if ($user->id == $targetUserId) {
            return response()->json([
                'success' => false,
                'message' => ['自分自身にフレンド申請はできません'],
            ], 400);
        }

        // 既存のフレンド関係をチェック（双方向）
        $existingFriend = Friend::where(function ($query) use ($user, $targetUserId) {
                $query->where('user_id', $user->id)
                      ->where('friend_user_id', $targetUserId);
            })
            ->orWhere(function ($query) use ($user, $targetUserId) {
                $query->where('user_id', $targetUserId)
                      ->where('friend_user_id', $user->id);
            })
            ->first();

        if ($existingFriend) {
            if ($existingFriend->status === 'accepted') {
                return response()->json([
                    'success' => false,
                    'message' => ['already friend'],
                ], 409);
            }

            if ($existingFriend->status === 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => ['フレンド申請はすでに送信済みです'],
                ], 409);
            }
        }

        // 相手からの申請が既にある場合は自動で承認
        $existingRequest = $user->friendRequestsReceived()
            ->where('user_id', $targetUserId)
            ->where('status', 'pending')
            ->first();

        if ($existingRequest) {
            // 相手の申請を承認
            $existingRequest->update([
                'status' => 'accepted',
                'accepted_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'status' => 'accept',
                'message' => ['フレンド申請を承認しました'],
            ]);
        }

        // 新規フレンド申請を作成
        Friend::create([
            'user_id' => $user->id,
            'friend_user_id' => $targetUserId,
            'status' => 'pending',
            'requested_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'status' => 'waiting',
            'message' => ['フレンド申請を送信しました'],
        ]);
    }

    /**
     * 受信したリクエストを承認し、相互フレンド関係を確立
     */
    public function accept(Request $request, $id): JsonResponse
    {
        $user = $request->user();

        // 自分宛てのpendingリクエストかチェック
        $friendRequest = $user->friendRequestsReceived()
            ->where('id', $id)
            ->where('status', 'pending')
            ->first();

        if (!$friendRequest) {
            return response()->json([
                'success' => false,
                'message' => ['フレンド申請が見つかりません'],
            ], 404);
        }

        // リクエストを承認
        $friendRequest->update([
            'status' => 'accepted',
            'accepted_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => ['フレンド申請を承認しました'],
        ]);
    }

    /**
     * 友達関係またはリクエストを取り消す／拒否
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $user = $request->user();

        // 自分に関連するフレンド関係かチェック（送信または受信）
        $friend = Friend::where('id', $id)
            ->where(function($query) use ($user) {
                $query->where('user_id', $user->id)
                      ->orWhere('friend_user_id', $user->id);
            })
            ->first();

        if (!$friend) {
            return response()->json([
                'success' => false,
                'message' => ['フレンド関係が見つかりません'],
            ], 404);
        }

        $message = $friend->status === 'pending' ?
            'フレンド申請を削除しました' :
            'フレンド関係を解除しました';

        // フレンド関係を削除
        $friend->delete();

        return response()->json([
            'success' => true,
            'message' => [$message],
        ]);
    }

    /**
     * ユーザー検索
     */
    public function searchUsers(Request $request): JsonResponse
    {
        $request->validate([
            'query' => 'required|string|min:1|max:255'
        ]);

        $currentUser = $request->user();
        $query = $request->input('query');

        // ユーザー名またはメールアドレスで検索
        $users = User::where(function ($queryBuilder) use ($query) {
                $queryBuilder->where('name', 'like', '%' . $query . '%')
                           ->orWhere('email', 'like', '%' . $query . '%');
            })
            ->where('id', '!=', $currentUser->id) // 自分を除外
            ->select('id', 'name', 'email', 'profile_photo_url', 'created_at')
            ->limit(20) // 検索結果を20件に制限
            ->get()
            ->map(function ($user) use ($currentUser) {
                // フレンド関係の状態をチェック
                $friendRelation = Friend::where(function ($q) use ($currentUser, $user) {
                        $q->where('user_id', $currentUser->id)
                          ->where('friend_user_id', $user->id);
                    })
                    ->orWhere(function ($q) use ($currentUser, $user) {
                        $q->where('user_id', $user->id)
                          ->where('friend_user_id', $currentUser->id);
                    })
                    ->first();

                $friendStatus = 'none'; // none, pending, accepted
                if ($friendRelation) {
                    $friendStatus = $friendRelation->status;
                }

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'profile_photo_url' => $user->profile_photo_url,
                    'friend_status' => $friendStatus,
                    'joined_at' => $user->created_at->format('Y-m-d'),
                ];
            });

        return response()->json([
            'success' => true,
            'users' => $users,
            'total' => $users->count(),
            'query' => $query,
            'message' => ['ユーザー検索が完了しました']
        ]);
    }
}
