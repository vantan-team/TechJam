<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Http\Requests\GuideBookRequest;
use App\Models\GuideBook;

class GuideBookController extends Controller
{
    // index はユーザー別API (/api/user/{id}/guide_books) に統一のため削除

    public function show($id): JsonResponse
    {
        try {
            $guidebook = GuideBook::with('user:id,name')
                ->withCount('contents')
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'message' => 'ガイドブック詳細を取得しました',
                'guidebook' => [
                    'id' => $guidebook->id,
                    'title' => $guidebook->title,
                    'image_url' => $guidebook->image_url,
                    'geo' => $guidebook->geo,
                    'genre' => $guidebook->genre,
                    'contents_count' => $guidebook->contents_count,
                    'author' => [
                        'id' => $guidebook->user->id,
                        'name' => $guidebook->user->name
                    ],
                    'created_at' => $guidebook->created_at->format('Y-m-d')
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('ガイドブック詳細取得エラー: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'ガイドブック詳細の取得に失敗しました',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function store(GuideBookRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();

            // 画像アップロード対応（任意）
            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('uploads/guidebooks', 'public');
                $data['image_url'] = asset('storage/'.$path);
            }

            $guidebook = GuideBook::create([
                'user_id' => Auth::id(),
                'title' => $data['title'] ?? '',
                'geo' => $data['geo'] ?? null,
                'genre' => $data['genre'] ?? null,
                'image_url' => $data['image_url'] ?? null,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'ガイドブックを作成しました',
                'guidebook' => [
                    'id' => $guidebook->id,
                    'title' => $guidebook->title,
                    'image_url' => $guidebook->image_url,
                    'geo' => $guidebook->geo,
                    'genre' => $guidebook->genre,
                    'contents_count' => 0,
                    'created_at' => $guidebook->created_at->format('Y-m-d')
                ]
            ], 201);
        } catch (\Exception $e) {
            Log::error('ガイドブック作成エラー: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'ガイドブックの作成に失敗しました',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function update(GuideBookRequest $request, $id): JsonResponse
    {
        try {
            $guidebook = GuideBook::where('id', $id)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            $guidebook->update($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'ガイドブックを更新しました',
                'guidebook' => [
                    'id' => $guidebook->id,
                    'title' => $guidebook->title,
                    'geo' => $guidebook->geo,
                    'genre' => $guidebook->genre,
                    'updated_at' => $guidebook->updated_at->format('Y-m-d H:i:s')
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('ガイドブック更新エラー: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'ガイドブックの更新に失敗しました',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function destroy($id): JsonResponse
    {
        try {
            $guidebook = GuideBook::withCount('contents')
                ->where('id', $id)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            if ($guidebook->contents_count > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'コンテンツが存在するため削除できません'
                ], 409);
            }

            $guidebook->delete();

            return response()->json([
                'success' => true,
                'message' => 'ガイドブックを削除しました',
                'deleted_id' => $id,
                'deleted_at' => now()->format('Y-m-d H:i:s')
            ]);
        } catch (\Exception $e) {
            Log::error('ガイドブック削除エラー: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'ガイドブックの削除に失敗しました',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}
