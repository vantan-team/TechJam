<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\SearchRequest;
use App\Http\Requests\AddToGuideRequest;
use App\Models\Shop;
use App\Models\VisitedShop;
use App\Models\GuideBook;
use App\Models\GuideBookContent;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class RestaurantController extends Controller
{
    public function search(SearchRequest $request): JsonResponse
    {
        $keyword = $request->validated()['keyword'];
        $includeHistory = $request->validated()['include_history'] ?? true;

        $results = [];

        // HotPepper検索
        $hotpepperShops = $this->getHotpepperShops($keyword);
        $results = array_merge($results, $hotpepperShops);

        // 履歴検索 (認証ユーザーのみ)
        if ($includeHistory && Auth::check()) {
            $historyShops = $this->getHistoryShops($keyword, Auth::id());
            $results = array_merge($results, $historyShops);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'shops' => array_slice($results, 0, 10),
                'has_hotpepper' => count($hotpepperShops) > 0,
                'has_history' => $includeHistory && count($results) > count($hotpepperShops)
            ]
        ]);
    }

    public function addToGuide(AddToGuideRequest $request): JsonResponse
    {
        $validated = $request->validated();
        
        DB::beginTransaction();
        
        try {
            // ガイドブックの権限チェック
            $guideBook = GuideBook::findOrFail($validated['guide_book_id']);
            if (Auth::id() !== $guideBook->user_id) {
                abort(403, '編集権限がありません');
            }

            // Shopテーブルにレコードを作成または取得
            $shop = Shop::firstOrCreate([
                'hotpepper_id' => $validated['hotpepper_id']
            ], [
                'shop_name' => $validated['shop_name'],
                'address' => $validated['shop_address'],
                'category' => '',
                'image_url' => null
            ]);

            // 訪問日を作成
            $visitedAt = \Carbon\Carbon::create($validated['visited_year'], $validated['visited_month'], 1);

            // VisitedShopテーブルに保存
            $visitedShop = VisitedShop::create([
                'user_id' => Auth::id(),
                'shop_id' => $shop->id,
                'visited_at' => $visitedAt,
                'memo' => $validated['memo']
            ]);

            // 重複チェック
            $existingContent = GuideBookContent::where('guide_id', $guideBook->id)
                ->where('shop_id', $shop->id)
                ->first();

            if ($existingContent) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'この店舗は既にガイドブックに追加されています'
                ], 409);
            }

            // GuideBookContentテーブルに保存
            $guideBookContent = GuideBookContent::create([
                'guide_id' => $guideBook->id,
                'shop_id' => $shop->id,
                'star' => $validated['rating'],
                'visited_shop_id' => $visitedShop->id,
                'image_url' => null
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => [
                    'shop_name' => $shop->shop_name,
                    'rating' => $guideBookContent->star,
                    'added_at' => $guideBookContent->created_at->format('Y-m-d H:i:s')
                ],
                'message' => 'ガイドブックに追加しました'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Guide addition error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => '追加に失敗しました'
            ], 500);
        }
    }

    private function getHotpepperShops(string $keyword): array
    {
        $apiKey = config('services.hotpepper.api_key');
        if (empty($apiKey)) {
            return [];
        }

        try {
            $response = Http::timeout(5)->get('http://webservice.recruit.co.jp/hotpepper/gourmet/v1/', [
                'key' => $apiKey,
                'keyword' => $keyword,
                'format' => 'json',
                'count' => 5
            ]);

            if ($response->successful()) {
                $shops = $response->json()['results']['shop'] ?? [];
                return array_map(fn($shop) => [
                    'id' => $shop['id'],
                    'name' => $shop['name'],
                    'address' => $shop['address'],
                    'category' => $shop['genre']['name'] ?? '',
                    'source' => 'hotpepper',
                    'budget' => $shop['budget']['name'] ?? '',
                    'photo_url' => $shop['photo']['mobile']['l'] ?? null
                ], $shops);
            }
        } catch (\Exception $e) {
            Log::warning('HotPepper API error: ' . $e->getMessage());
        }

        return [];
    }

    private function getHistoryShops(string $keyword, int $userId): array
    {
        try {
            return VisitedShop::with('shop:id,shop_name,address,category')
                ->where('user_id', $userId)
                ->whereHas('shop', fn($q) => $q->where('shop_name', 'LIKE', '%' . $keyword . '%'))
                ->orderBy('visited_at', 'desc')
                ->limit(5)
                ->get()
                ->map(fn($visitedShop) => [
                    'id' => $visitedShop->shop->id,
                    'name' => $visitedShop->shop->shop_name,
                    'address' => $visitedShop->shop->address,
                    'category' => $visitedShop->shop->category,
                    'source' => 'history',
                    'visited_at' => $visitedShop->visited_at->format('Y-m-d'),
                    'memo' => $visitedShop->memo
                ])
                ->toArray();
        } catch (\Exception $e) {
            Log::warning('History search error: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * ホットペッパーIDから店舗の詳細情報を取得（DBキャッシュ付き）
     */
    public function getShopDetail(string $hotpepperId): JsonResponse
    {
        try {
            // まずDBから店舗情報を検索（キャッシュチェック）
            $shopData = $this->getOrCreateShopFromHotpepper($hotpepperId);
            
            if (!$shopData) {
                return response()->json([
                    'success' => false,
                    'message' => '店舗情報が見つかりませんでした'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'shop' => $shopData
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('店舗詳細取得エラー: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => '店舗情報の取得に失敗しました'
            ], 500);
        }
    }

    /**
     * ホットペッパーAPIから店舗情報を取得してDBに保存またはDBから取得
     */
    private function getOrCreateShopFromHotpepper(string $hotpepperId): ?array
    {
        // まずDBから検索（キャッシュチェック）
        $shop = Shop::where('hotpepper_id', $hotpepperId)->first();
        
        // DBに存在し、かつ更新から24時間以内なら DBから詳細情報を構築
        if ($shop && $shop->updated_at->diffInHours(now()) < 24) {
            if (config('app.debug')) {
                Log::info('DBから店舗情報を取得', ['hotpepper_id' => $hotpepperId]);
            }
            
            // DBの基本情報に詳細情報を追加してレスポンス作成
            return $this->buildShopResponse($shop);
        }

        // DBに存在しないか古い情報の場合、ホットペッパーAPIから取得
        $apiData = $this->fetchFromHotpepperAPI($hotpepperId);
        
        if (!$apiData) {
            // API取得失敗時はDBの古い情報があれば返す
            return $shop ? $this->buildShopResponse($shop) : null;
        }

        // DBに保存用のデータ（既存フィールドのみ）
        $dbData = [
            'shop_name' => $apiData['shop_name'] ?? '',
            'address' => $apiData['address'] ?? '',
            'category' => $apiData['category'] ?? '',
            'image_url' => $apiData['image_url'] ?? null,
        ];

        // DBに保存または更新
        if ($shop) {
            // 既存レコードを更新
            $shop->update($dbData);
            if (config('app.debug')) {
                Log::info('DBの店舗情報を更新', ['hotpepper_id' => $hotpepperId]);
            }
        } else {
            // 新規レコードを作成
            $shop = Shop::create(array_merge($dbData, ['hotpepper_id' => $hotpepperId]));
            if (config('app.debug')) {
                Log::info('新規店舗情報をDB保存', ['hotpepper_id' => $hotpepperId]);
            }
        }

        // APIデータをそのまま返す（詳細情報含む）
        return array_merge($apiData, [
            'id' => $shop->id,
            'cached_at' => $shop->updated_at->format('Y-m-d H:i:s'),
            'source' => 'api_fresh'
        ]);
    }

    /**
     * DBの店舗情報からレスポンス用データを構築
     */
    private function buildShopResponse(Shop $shop): array
    {
        return [
            'id' => $shop->id,
            'hotpepper_id' => $shop->hotpepper_id,
            'name' => $shop->shop_name,
            'address' => $shop->address,
            'category' => $shop->category,
            'image_url' => $shop->image_url,
            // 詳細情報はDBキャッシュからは提供しない（基本情報のみ）
            'description' => '店舗の詳細情報',
            'budget' => '予算情報なし',
            'access' => '',
            'open_hours' => '',
            'phone' => '',
            'latitude' => null,
            'longitude' => null,
            'cached_at' => $shop->updated_at->format('Y-m-d H:i:s'),
            'source' => 'db_cache'
        ];
    }

    /**
     * ホットペッパーAPIから店舗の詳細情報を取得
     */
    private function fetchFromHotpepperAPI(string $hotpepperId): ?array
    {
        $apiKey = config('services.hotpepper.api_key');
        if (empty($apiKey)) {
            Log::warning('ホットペッパーAPIキーが設定されていません');
            return null;
        }

        try {
            $response = Http::timeout(10)->get('http://webservice.recruit.co.jp/hotpepper/gourmet/v1/', [
                'key' => $apiKey,
                'id' => $hotpepperId,
                'format' => 'json'
            ]);

            if (!$response->successful()) {
                Log::warning('ホットペッパーAPI呼び出し失敗', [
                    'hotpepper_id' => $hotpepperId,
                    'status' => $response->status()
                ]);
                return null;
            }

            $data = $response->json();
            $shops = $data['results']['shop'] ?? [];
            
            if (empty($shops)) {
                Log::info('ホットペッパーAPIで店舗が見つかりませんでした', ['hotpepper_id' => $hotpepperId]);
                return null;
            }

            $shopData = $shops[0]; // 最初の店舗データを使用
            
            return [
                'hotpepper_id' => $hotpepperId,
                'name' => $shopData['name'] ?? '',
                'shop_name' => $shopData['name'] ?? '', // DBフィールド名に合わせる
                'address' => $shopData['address'] ?? '',
                'category' => $shopData['genre']['name'] ?? '',
                'image_url' => $shopData['photo']['pc']['l'] ?? $shopData['photo']['mobile']['l'] ?? null,
                // 詳細情報（レスポンス専用）
                'description' => $shopData['catch'] ?? '',
                'budget' => $shopData['budget']['name'] ?? '',
                'access' => $shopData['mobile_access'] ?? $shopData['pc_access'] ?? '',
                'open_hours' => $shopData['open'] ?? '',
                'phone' => $shopData['tel'] ?? '',
                'latitude' => isset($shopData['lat']) ? (float)$shopData['lat'] : null,
                'longitude' => isset($shopData['lng']) ? (float)$shopData['lng'] : null,
            ];

        } catch (\Exception $e) {
            Log::error('ホットペッパーAPI呼び出しエラー', [
                'hotpepper_id' => $hotpepperId,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }
}