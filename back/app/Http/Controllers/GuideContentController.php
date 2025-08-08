<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\GuideContentRequest;
use App\Models\GuideBook;
use App\Models\GuideBookContent;
use Illuminate\Support\Facades\Log;

class GuideContentController extends Controller
{
    public function index($guidebookId): JsonResponse
    {
        try {
            $guidebook = $this->findAccessibleGuideBook($guidebookId);

            $contents = GuideBookContent::with('shop:id,shop_name,address,category')
                ->where('guide_id', $guidebook->id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(fn($content) => [
                    'id' => $content->id,
                    'star' => $content->star,
                    'comment' => $content->comment,
                    'image_url' => $content->image_url,
                    'shop' => [
                        'id' => $content->shop->id,
                        'name' => $content->shop->shop_name,
                        'address' => $content->shop->address,
                        'category' => $content->shop->category
                    ],
                    'created_at' => $content->created_at->format('Y-m-d')
                ]);

            // 星ごとの件数
            $counts = [
                3 => GuideBookContent::where('guide_id', $guidebook->id)->where('star', 3)->count(),
                2 => GuideBookContent::where('guide_id', $guidebook->id)->where('star', 2)->count(),
                1 => GuideBookContent::where('guide_id', $guidebook->id)->where('star', 1)->count(),
            ];
            // 星の上限（将来的に設定化も検討）
            $caps = [3 => 2, 2 => 6, 1 => 12];

            return response()->json([
                'success' => true,
                'message' => 'ガイドブックコンテンツを取得しました',
                'contents' => $contents,
                'guidebook_title' => $guidebook->title,
                'meta' => [
                    'counts' => $counts,
                    'caps' => $caps,
                    'remaining' => [
                        3 => max(0, $caps[3] - $counts[3]),
                        2 => max(0, $caps[2] - $counts[2]),
                        1 => max(0, $caps[1] - $counts[1]),
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('ガイドブックコンテンツ取得エラー: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'ガイドブックコンテンツの取得に失敗しました',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function store(GuideContentRequest $request, $guidebookId): JsonResponse
    {
        try {
            $guidebook = $this->findAccessibleGuideBook($guidebookId, true);

            // 重複チェック
            if (GuideBookContent::where('guide_id', $guidebook->id)->where('shop_id', $request->validated()['shop_id'])->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'この店舗は既に追加されています'
                ], 409);
            }

            // 星ごとの上限チェック
            $caps = [3 => 2, 2 => 6, 1 => 12];
            $star = (int)$request->validated()['star'];
            $currentCount = GuideBookContent::where('guide_id', $guidebook->id)->where('star', $star)->count();
            if (isset($caps[$star]) && $currentCount >= $caps[$star]) {
                return response()->json([
                    'success' => false,
                    'message' => 'この星ランは上限に達しています'
                ], 409);
            }

            $data = $request->validated();
            
            // 画像アップロード処理
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $uploadPath = public_path('uploads/contents');
                
                // アップロードディレクトリが存在しない場合は作成
                if (!file_exists($uploadPath)) {
                    mkdir($uploadPath, 0755, true);
                }
                
                $file->move($uploadPath, $fileName);
                $data['image_url'] = url('uploads/contents/' . $fileName);
            }

            $content = GuideBookContent::create([
                'guide_id' => $guidebook->id,
                ...$data
            ]);

            $content->load('shop:id,shop_name,address,category');

            return response()->json([
                'success' => true,
                'message' => 'ガイドブックに追加しました',
                'content' => [
                    'id' => $content->id,
                    'star' => $content->star,
                    'comment' => $content->comment,
                    'image_url' => $content->image_url,
                    'shop' => [
                        'id' => $content->shop->id,
                        'name' => $content->shop->shop_name,
                        'address' => $content->shop->address,
                        'category' => $content->shop->category
                    ],
                    'created_at' => $content->created_at->format('Y-m-d')
                ]
            ], 201);
        } catch (\Exception $e) {
            Log::error('ガイドブックコンテンツ作成エラー: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'ガイドブックコンテンツの作成に失敗しました',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function update(GuideContentRequest $request, $guidebookId, $contentId): JsonResponse
    {
        try {
            $this->findAccessibleGuideBook($guidebookId, true);

            $content = GuideBookContent::where('guide_id', $guidebookId)
                ->where('id', $contentId)
                ->firstOrFail();

            $data = $request->validated();
            
            // 画像アップロード処理
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $uploadPath = public_path('uploads/contents');
                
                // アップロードディレクトリが存在しない場合は作成
                if (!file_exists($uploadPath)) {
                    mkdir($uploadPath, 0755, true);
                }
                
                $file->move($uploadPath, $fileName);
                $data['image_url'] = url('uploads/contents/' . $fileName);
            }

            $content->update($data);
            $content->load('shop:id,shop_name,address,category');

            return response()->json([
                'success' => true,
                'message' => 'コンテンツを更新しました',
                'content' => [
                    'id' => $content->id,
                    'star' => $content->star,
                    'comment' => $content->comment,
                    'image_url' => $content->image_url,
                    'shop' => [
                        'id' => $content->shop->id,
                        'name' => $content->shop->shop_name,
                        'address' => $content->shop->address,
                        'category' => $content->shop->category
                    ],
                    'updated_at' => $content->updated_at->format('Y-m-d H:i:s')
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('ガイドブックコンテンツ更新エラー: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'ガイドブックコンテンツの更新に失敗しました',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function destroy($guidebookId, $contentId): JsonResponse
    {
        try {
            $this->findAccessibleGuideBook($guidebookId, true);

            GuideBookContent::where('guide_id', $guidebookId)
                ->where('id', $contentId)
                ->firstOrFail()
                ->delete();

            return response()->json([
                'success' => true,
                'message' => 'コンテンツを削除しました',
                'deleted_id' => $contentId,
                'deleted_at' => now()->format('Y-m-d H:i:s')
            ]);
        } catch (\Exception $e) {
            Log::error('ガイドブックコンテンツ削除エラー: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'ガイドブックコンテンツの削除に失敗しました',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    private function findAccessibleGuideBook($guidebookId, bool $requireOwnership = false): GuideBook
    {
        $guidebook = GuideBook::findOrFail($guidebookId);

        if ($requireOwnership) {
            // 編集権限チェック（自分のガイドブックのみ編集可能）
            if (Auth::id() !== $guidebook->user_id) {
                abort(403, '編集権限がありません');
            }
        }
        // 全てのガイドブックは公開されているため、表示権限チェックは不要

        return $guidebook;
    }
}
