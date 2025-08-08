<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\User;
use App\Models\Friend;
use App\Models\Follower;

class UserController extends Controller
{
    /**
     * 基本プロフィール情報を取得（軽量版）
     */
    public function show(Request $request, $id): JsonResponse
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => ['The user did not exist in this universe.'],
                'user' => (object)[]
            ], 404);
        }

        $currentUser = $request->user(); // 認証済みユーザー（nullの場合もある）

        // フォロー数とフォロワー数を取得
        $followCount = $user->following()->count();
        $followerCount = $user->followers()->count();

        // 認証ユーザーがいる場合、フレンド関係をチェック
        $isFriend = false;
        if ($currentUser) {
            $isFriend = Friend::where(function ($query) use ($currentUser, $user) {
                    $query->where('user_id', $currentUser->id)
                          ->where('friend_user_id', $user->id);
                })
                ->orWhere(function ($query) use ($currentUser, $user) {
                    $query->where('user_id', $user->id)
                          ->where('friend_user_id', $currentUser->id);
                })
                ->where('status', 'accepted')
                ->exists();
        }

        return response()->json([
            'success' => true,
            'message' => ['ユーザープロフィールを取得しました'],
            'is_private' => (bool) $user->private,
            'user' => [
                'id' => (string) $user->id,
                'name' => $user->name,
                'introduction' => $user->introduction ?? '',
                'profilePhotoUrl' => $user->profile_photo_url ?? '',
                'follow' => $followCount,
                'follower' => $followerCount,
                'is_friend' => $isFriend,
            ]
        ]);
    }

    /**
     * プロフィール更新
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => ['認証ユーザーが見つかりません'],
            ], 401);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'bio' => 'nullable|string|max:300',
            'profilePhotoUrl' => 'nullable|string|max:255',
        ]);

        $user->name = $validated['name'];
        $user->introduction = $validated['bio'] ?? '';
        $user->profile_photo_url = $validated['profilePhotoUrl'] ?? '';
        $user->save();

        return response()->json([
            'success' => true,
            'message' => ['プロフィールを更新しました'],
        ]);
    }

    /**
     * ユーザーのガイドブック一覧を取得
     */
    public function guidebooks(Request $request, $id): JsonResponse
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => ['The user did not exist in this universe.'],
            ], 404);
        }

        $currentUser = $request->user();

        // プライバシーチェック: 非公開ユーザーで関係性がない場合
        if ($user->private && (!$currentUser || !$this->areConnected($currentUser, $user))) {
            return response()->json([
                'success' => true,
                'message' => [''],
                'books' => []
            ]);
        }

        // ガイドブッククエリ構築
        $query = $user->guideBooks()
            ->withCount('contents')
            ->orderBy('created_at', 'desc');

        $guidebooks = $query->get();

        return response()->json([
            'success' => true,
            'message' => [''],
            'books' => $guidebooks->map(function ($g) {
                return [
                    'title' => $g->title,
                    'geo' => $g->geo,
                    'genre' => $g->genre,
                    'cover_image' => $g->image_url,
                ];
            })->values(),
        ]);
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
     * プロフィール画像アップロード
     */
    public function uploadProfileImage(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => ['認証ユーザーが見つかりません'],
            ], 401);
        }

        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:4096',
        ]);

        $file = $request->file('image');
        $fileName = time() . '_' . $file->getClientOriginalName();
        $file->move(public_path('uploads/profiles'), $fileName);
        $url = '/uploads/profiles/' . $fileName;

        return response()->json([
            'success' => true,
            'url' => $url,
            'message' => ['画像をアップロードしました'],
        ]);
    }
}
