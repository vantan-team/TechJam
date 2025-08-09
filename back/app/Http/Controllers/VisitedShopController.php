<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\VisitedShop;
use App\Models\Shop;
use Carbon\Carbon;
use App\Http\Controllers\RestaurantController;

class VisitedShopController extends Controller
{
    /**
     * 店舗訪問履歴を新規作成
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'shop_id' => 'required_without:hotpepper_id|integer|exists:shops,id',
            'hotpepper_id' => 'required_without:shop_id|string',
            'visited_at' => 'required|date',
            'memo' => 'nullable|string|max:1000'
        ]);

        $user = Auth::user();
        $shopId = $request->shop_id;

        try {
            if ($request->hotpepper_id) {
                $restaurantController = new RestaurantController();
                $shopData = $restaurantController->getOrCreateShopFromHotpepper($request->hotpepper_id);
                if (!$shopData) {
                    return response()->json([
                        'success' => false,
                        'message' => '店舗情報の取得に失敗しました'
                    ], 404);
                }
                $shopId = $shopData['id'];
            }

            // 店舗情報を取得
            $shop = Shop::findOrFail($shopId);

            // 同じ店舗・同じ日付の履歴が既にないかチェック
            $visitedDate = Carbon::parse($request->visited_at)->format('Y-m-d');
            $existingVisit = VisitedShop::where('user_id', $user->id)
                ->where('shop_id', $shopId)
                ->whereDate('visited_at', $visitedDate)
                ->first();

            if ($existingVisit) {
                return response()->json([
                    'success' => false,
                    'message' => '同じ店舗の同じ日付の訪問履歴が既に存在します'
                ], 409);
            }

            // 訪問履歴を作成
            $visitedShop = VisitedShop::create([
                'user_id' => $user->id,
                'shop_id' => $shopId,
                'visited_at' => $request->visited_at,
                'memo' => $request->memo
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $visitedShop->id,
                    'shop_name' => $shop->shop_name,
                    'visited_at' => $visitedShop->visited_at->format('Y-m-d'),
                    'memo' => $visitedShop->memo,
                    'created_at' => $visitedShop->created_at->format('Y-m-d H:i:s')
                ],
                'message' => '訪問履歴を追加しました'
            ], 201);

        } catch (\Exception $e) {
            Log::error('訪問履歴追加エラー: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => '訪問履歴の追加に失敗しました'
            ], 500);
        }
    }

    /**
     * 指定ユーザーの訪問履歴を取得
     */
    public function getUserHistory($id): JsonResponse
    {
        try {
            // 指定されたユーザーが存在するかチェック
            $targetUser = \App\Models\User::find($id);
            if (!$targetUser) {
                return response()->json([
                    'success' => false,
                    'message' => ['The session did not exist in this universe.']
                ], 404);
            }

            // 訪問履歴を取得（店舗情報も含める）
            $visitedShops = VisitedShop::where('user_id', $id)
                ->with('shop:id,shop_name,hotpepper_id')
                ->orderBy('visited_at', 'desc')
                ->get();

            $visitedHistory = $visitedShops->map(function ($visit) {
                return [
                    'name' => $visit->shop->shop_name,
                    'visited_at' => $visit->visited_at->format('Y-m-d'),
                    'memo' => $visit->memo ?? '',
                    'hotpepper_id' => $visit->shop->hotpepper_id ? (int)$visit->shop->hotpepper_id : null,
                ];
            });

            return response()->json([
                'success' => true,
                'message' => [''],
                'visited_history' => $visitedHistory
            ]);

        } catch (\Exception $e) {
            Log::error('訪問履歴取得エラー: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => ['The session did not exist in this universe.']
            ], 500);
        }
    }
}
