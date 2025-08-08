<?php

namespace App\Http\Controllers;

use App\Models\GuideBook;
use App\Models\Follower;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class HomeController extends Controller
{
    /**
     * ホーム画面用のガイドブック一覧を取得
     */
    public function index()
    {
        // フォロワー数を一括取得してN+1問題を解決
        $guidebooks = GuideBook::with(['user', 'contents.shop'])->get();

        $userIds = $guidebooks->pluck('user_id');
        $followerCounts = Follower::select('followed_user_id', DB::raw('count(*) as followers_count'))
            ->whereIn('followed_user_id', $userIds)
            ->groupBy('followed_user_id')
            ->pluck('followers_count', 'followed_user_id');

        $guidebooks = $guidebooks->map(function ($guidebook) use ($followerCounts) {
            return [
                'id' => $guidebook->id,
                'user_id' => $guidebook->user_id,
                'title' => $guidebook->title,
                'author' => $guidebook->user->name,
                'followers' => $followerCounts->get($guidebook->user_id, 0),
                'image' => $guidebook->image_url ?? 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400',
                'description' => $this->generateDescription($guidebook),
                'restaurants' => $guidebook->contents->map(function ($content) {
                    $shop = $content->shop;
                    return [
                        'id' => $shop->id,
                        'hotpepper_id' => $shop->hotpepper_id,
                        'position' => $this->getPositionFromAddress($shop->address, $shop->hotpepper_id),
                        'title' => $shop->shop_name,
                        'popup' => $this->generatePopupContent($shop),
                        'description' => $content->comment ?? '美味しいお店です。',
                        'image' => $shop->image_url ?? 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400',
                        'rating' => $content->star ?? 1,
                        'priceRange' => $this->getPriceRangeFromHotpepper($shop->hotpepper_id) ?? $this->getPriceRange($shop->category)
                    ];
                })->toArray()
            ];
        })
        ->sortByDesc('followers')
        ->values();

        return response()->json(['guidebooks' => $guidebooks]);
    }

    /**
     * ホットペッパーAPIから店舗の正確な位置情報を取得
     */
    private function getPositionFromAddress($address, $hotpepperId = null)
    {
        // hotpepper_idがある場合はAPIから正確な位置情報を取得
        if ($hotpepperId) {
            try {
                $apiKey = config('services.hotpepper.api_key');
                // 本番環境ではログを制限
                if (config('app.debug')) {
                    Log::info('ホットペッパーAPI呼び出し開始', [
                        'hotpepper_id' => $hotpepperId,
                        'address' => $address
                    ]);
                }

                if ($apiKey) {
                    $url = "http://webservice.recruit.co.jp/hotpepper/gourmet/v1/";
                    $params = [
                        'key' => $apiKey,
                        'id' => $hotpepperId,
                        'format' => 'json'
                    ];

                    $response = file_get_contents($url . '?' . http_build_query($params));
                    if ($response) {
                        $data = json_decode($response, true);
                        // デバッグ環境のみでレスポンス詳細をログ出力
                        if (config('app.debug')) {
                            Log::info('ホットペッパーAPIレスポンス取得', [
                                'hotpepper_id' => $hotpepperId,
                                'success' => isset($data['results']['shop'][0])
                            ]);
                        }

                        if (isset($data['results']['shop'][0])) {
                            $shop = $data['results']['shop'][0];
                            if (isset($shop['lat']) && isset($shop['lng'])) {
                                $coords = [(float)$shop['lat'], (float)$shop['lng']];
                                // 本番環境では座標取得の詳細ログは出力しない
                                return $coords;
                            }
                        }
                    }
                } else {
                    // 本番環境ではAPIキー未設定警告は出力しない
                    if (config('app.debug')) {
                        Log::warning('ホットペッパーAPIキーが設定されていません');
                    }
                }
            } catch (\Exception $e) {
                // APIエラーの場合はフォールバック処理に進む
                // 本番環境ではエラー詳細は記録しない
                Log::error('外部API取得失敗', [
                    'service' => 'hotpepper',
                    'error' => config('app.debug') ? $e->getMessage() : 'API call failed'
                ]);
            }
        }

        // フォールバック：名古屋周辺の詳細エリアマッピング（より正確な座標）
        $nagoyaAreas = [
            // 中区エリア（細かい住所マッチング）- より正確な座標に修正
            '栄3-4' => [35.1681, 136.9015], // 陳麻婆豆腐 名古屋栄店
            '栄3-12' => [35.1685, 136.9020], // 山本屋本店 栄本店
            '栄3-6' => [35.1678, 136.9010], // 風来坊 栄本店
            '栄3-15' => [35.1683, 136.9025], // ブルーシール 栄店
            '錦2-4' => [35.1692, 136.9015], // リストランテ ベリーニ
            '錦3-15' => [35.1695, 136.9018], // 世界の山ちゃん 本店
            '丸の内2-18' => [35.1753, 136.9066], // レストラン オゼール
            '大須2-8' => [35.1593, 136.9005], // 北京飯店 大須店
            '大須2-32' => [35.1600, 136.9010], // タイ料理 クルンテープ
            '大須3-6' => [35.1590, 136.9000], // 矢場とん 本店（矢場町）
            '金山1-17' => [35.1389, 136.9056], // カフェ・ド・クリエ 金山店

            // 東区エリア
            '東桜1-13' => [35.1769, 136.9189], // 中華菜館 桃花林
            '東桜2-23' => [35.1775, 136.9195], // ビストロ ラ・フィーユ
            '泉1-14' => [35.1803, 136.9156], // オステリア・ルッカ

            // 千種区エリア
            '今池1-12' => [35.1644, 136.9174], // 味仙 今池本店
            '池下1-4' => [35.1658, 136.9203], // 麺や 福座
            '覚王山通8-70' => [35.1712, 136.9312], // ハワイアン ロコモコ

            // 中村区エリア（名古屋駅周辺）
            '名駅1-1' => [35.1715, 136.8815], // きしめん よしだ
            '名駅3-13' => [35.1718, 136.8820], // 焼肉 牛角 名駅店
            '名駅4-6' => [35.1720, 136.8825], // ラーメン横綱 名古屋店

            // 熱田区エリア
            '神戸町503' => [35.1234, 136.9067], // あつた蓬莱軒 本店

            // 昭和区エリア
            '白金1-5' => [35.1647, 136.9256], // コメダ珈琲店 本店
            '白金1-17' => [35.1650, 136.9260], // 喫茶マウンテン
            '御器所2-18' => [35.1476, 136.9345], // インド料理 ガンガ

            // 一般的なエリア名（部分マッチ用）
            '栄' => [35.1681, 136.9012],
            '錦' => [35.1692, 136.9015],
            '丸の内' => [35.1753, 136.9066],
            '大須' => [35.1593, 136.9005],
            '今池' => [35.1644, 136.9174],
            '池下' => [35.1658, 136.9203],
            '覚王山' => [35.1712, 136.9312],
            '東桜' => [35.1769, 136.9189],
            '泉' => [35.1803, 136.9156],
            '名駅' => [35.1715, 136.8815],
            '名古屋駅' => [35.1715, 136.8815],
            '中村区' => [35.1715, 136.8815],
            '熱田区' => [35.1284, 136.9100],
            '神戸町' => [35.1234, 136.9067],
            '昭和区' => [35.1647, 136.9256],
            '白金' => [35.1647, 136.9256],
            '御器所' => [35.1476, 136.9345],
            '千種区' => [35.1644, 136.9174],
            '中区' => [35.1681, 136.9012],
            '東区' => [35.1769, 136.9189],
            '金山' => [35.1389, 136.9056],
        ];

        // より詳細な住所マッチング（長いマッチから優先してチェック）
        // 配列を文字列長の降順でソート（長いマッチを優先）
        $sortedAreas = $nagoyaAreas;
        uksort($sortedAreas, function($a, $b) {
            return strlen($b) - strlen($a);
        });

        foreach ($sortedAreas as $area => $coords) {
            if (strpos($address, $area) !== false) {
                // フォールバック座標使用（デバッグ時のみログ）
                return [$coords[0], $coords[1]];
            }
        }

        // 最終フォールバック：名古屋駅（デモの中心地）
        return [35.1715, 136.8815];
    }

    /**
     * 店舗のポップアップコンテンツを生成
     */
    private function generatePopupContent($shop)
    {
        return "{$shop->shop_name}<br />{$shop->category}";
    }


    /**
     * カテゴリに応じた価格帯を返す
     */
    private function getPriceRange($category)
    {
        $priceMap = [
            '中華' => '¥¥',
            '日本料理' => '¥¥¥',
            'イタリアン' => '¥¥¥',
            'フレンチ' => '¥¥¥¥',
            'カフェ' => '¥¥',
            '居酒屋' => '¥¥',
            'ラーメン' => '¥',
            'その他' => '¥¥'
        ];

        return $priceMap[$category] ?? '¥¥';
    }

    /**
     * ホットペッパーAPIから価格帯情報を取得
     */
    private function getPriceRangeFromHotpepper($hotpepperId)
    {
        if (!$hotpepperId) {
            return null;
        }

        try {
            $apiKey = config('services.hotpepper.api_key');
            if (!$apiKey) {
                return null;
            }

            $url = "http://webservice.recruit.co.jp/hotpepper/gourmet/v1/";
            $params = [
                'key' => $apiKey,
                'id' => $hotpepperId,
                'format' => 'json'
            ];

            $response = file_get_contents($url . '?' . http_build_query($params));
            if ($response) {
                $data = json_decode($response, true);
                if (isset($data['results']['shop'][0]['budget'])) {
                    $budget = $data['results']['shop'][0]['budget'];
                    return $this->convertBudgetToPriceRange($budget);
                }
            }
        } catch (\Exception $e) {
            Log::info('ホットペッパー価格帯取得失敗: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * ホットペッパーの予算情報を価格帯表記に変換
     */
    private function convertBudgetToPriceRange($budget)
    {
        // ホットペッパーの予算コードを価格帯に変換
        if (isset($budget['code'])) {
            $budgetCode = $budget['code'];

            $priceRangeMap = [
                'B009' => '¥',       // ～500円
                'B010' => '¥',       // 501～1000円
                'B011' => '¥',       // 1001～1500円
                'B001' => '¥¥',      // 1501～2000円
                'B002' => '¥¥',      // 2001～3000円
                'B003' => '¥¥',      // 3001～4000円
                'B008' => '¥¥¥',     // 4001～5000円
                'B004' => '¥¥¥',     // 5001～7000円
                'B005' => '¥¥¥¥',    // 7001～10000円
                'B006' => '¥¥¥¥',    // 10001～15000円
                'B012' => '¥¥¥¥¥',   // 15001～20000円
                'B013' => '¥¥¥¥¥',   // 20001～30000円
                'B014' => '¥¥¥¥¥',   // 30000円～
            ];

            return $priceRangeMap[$budgetCode] ?? '¥¥';
        }

        // 価格名称から推定（フォールバック）
        if (isset($budget['name'])) {
            $name = $budget['name'];
            if (strpos($name, '1000') !== false) return '¥';
            if (strpos($name, '2000') !== false) return '¥¥';
            if (strpos($name, '5000') !== false) return '¥¥¥';
            if (strpos($name, '10000') !== false) return '¥¥¥¥';
        }

        return '¥¥';
    }

    /**
     * ガイドブックの説明文を生成
     */
    private function generateDescription($guidebook)
    {
        $restaurantCount = $guidebook->contents->count();
        $genre = $guidebook->genre ?? 'グルメ';

        return "{$genre}の厳選されたお店を{$restaurantCount}店舗紹介しています。地元で愛される名店から話題の新店まで、必見のお店ばかりです。";
    }

}
