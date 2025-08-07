<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Friend;
use App\Models\Shop;
use App\Models\VisitedShop;
use App\Models\GuideBook;
use App\Models\GuideBookContent;
use App\Models\Follower;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // フレンドAPIテスト用のユーザーを作成
        // 全てのユーザーのパスワードは 'password' で統一

        $user1 = User::create([
            'name' => 'テストユーザー1',
            'email' => 'test1@example.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        $user2 = User::create([
            'name' => 'テストユーザー2',
            'email' => 'test2@example.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        $user3 = User::create([
            'name' => 'テストユーザー3',
            'email' => 'test3@example.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        $user4 = User::create([
            'name' => 'テストユーザー4',
            'email' => 'test4@example.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        $user5 = User::create([
            'name' => 'テストユーザー5',
            'email' => 'test5@example.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        // 管理者用ユーザー
        $admin = User::create([
            'name' => '管理者',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        // テスト用追加ユーザー（ガイドブック作成者として活用）
        $foodCritic = User::create([
            'name' => '名古屋グルメ評論家',
            'email' => 'critic@example.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        $localReporter = User::create([
            'name' => '地元レポーター',
            'email' => 'local@example.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        $cafeExpert = User::create([
            'name' => 'カフェ専門家',
            'email' => 'cafe@example.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        $sweets_lover = User::create([
            'name' => 'スイーツ愛好家',
            'email' => 'sweets@example.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        $ramen_master = User::create([
            'name' => 'ラーメン修行僧',
            'email' => 'ramen@example.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        // 一部のフレンド関係を事前に作成（テスト用）
        // user1とuser2は既に友達
        Friend::create([
            'user_id' => $user1->id,
            'friend_user_id' => $user2->id,
            'status' => 'accepted',
            'requested_at' => now()->subDays(2),
            'accepted_at' => now()->subDays(1),
        ]);

        // user3からuser1への未承認申請
        Friend::create([
            'user_id' => $user3->id,
            'friend_user_id' => $user1->id,
            'status' => 'pending',
            'requested_at' => now()->subHours(3),
        ]);

        // user4からuser2への未承認申請
        Friend::create([
            'user_id' => $user4->id,
            'friend_user_id' => $user2->id,
            'status' => 'pending',
            'requested_at' => now()->subHours(1),
        ]);

        // 🍽️ 店舗データの作成（名古屋エリアの充実した店舗データ）
        $shops = [
            // 中華料理店
            [
                'hotpepper_id' => 'J001248901',
                'shop_name' => '陳麻婆豆腐 名古屋栄店',
                'address' => '愛知県名古屋市中区栄3-4-15',
                'category' => '中華',
                'image_url' => 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop'
            ],
            [
                'hotpepper_id' => 'J001248921',
                'shop_name' => '中華菜館 桃花林',
                'address' => '愛知県名古屋市東区東桜1-13-3',
                'category' => '中華',
                'image_url' => 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop'
            ],
            [
                'hotpepper_id' => 'J001248922',
                'shop_name' => '北京飯店 大須店',
                'address' => '愛知県名古屋市中区大須2-8-45',
                'category' => '中華',
                'image_url' => 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop'
            ],
            // ラーメン店
            [
                'hotpepper_id' => 'J001248902',
                'shop_name' => '味仙 今池本店',
                'address' => '愛知県名古屋市千種区今池1-12-10',
                'category' => 'ラーメン',
                'image_url' => 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop&sat=-50'
            ],
            [
                'hotpepper_id' => 'J001248923',
                'shop_name' => 'ラーメン横綱 名古屋店',
                'address' => '愛知県名古屋市中村区名駅4-6-17',
                'category' => 'ラーメン',
                'image_url' => 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400'
            ],
            [
                'hotpepper_id' => 'J001248924',
                'shop_name' => '麺や 福座',
                'address' => '愛知県名古屋市千種区池下1-4-15',
                'category' => 'ラーメン',
                'image_url' => 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400'
            ],

            // 名古屋めし・日本料理
            [
                'hotpepper_id' => 'J001248903',
                'shop_name' => '矢場とん 本店',
                'address' => '愛知県名古屋市中区大須3-6-18',
                'category' => '日本料理',
                'image_url' => 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop'
            ],
            [
                'hotpepper_id' => 'J001248908',
                'shop_name' => 'あつた蓬莱軒 本店',
                'address' => '愛知県名古屋市熱田区神戸町503',
                'category' => '日本料理',
                'image_url' => 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop'
            ],
            [
                'hotpepper_id' => 'J001248925',
                'shop_name' => '山本屋本店 栄本店',
                'address' => '愛知県名古屋市中区栄3-12-19',
                'category' => '日本料理',
                'image_url' => 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400'
            ],
            [
                'hotpepper_id' => 'J001248926',
                'shop_name' => 'きしめん よしだ',
                'address' => '愛知県名古屋市中村区名駅1-1-4',
                'category' => '日本料理',
                'image_url' => 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400'
            ],

            // カフェ・喫茶店
            [
                'hotpepper_id' => 'J001248904',
                'shop_name' => 'コメダ珈琲店 本店',
                'address' => '愛知県名古屋市昭和区白金1-5-1',
                'category' => 'カフェ',
                'image_url' => 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop'
            ],
            [
                'hotpepper_id' => 'J001248910',
                'shop_name' => '喫茶マウンテン',
                'address' => '愛知県名古屋市昭和区白金1-17-5',
                'category' => 'カフェ',
                'image_url' => 'https://images.unsplash.com/photo-1571167433940-4b5100e1d67c?w=400&h=300&fit=crop'
            ],
            [
                'hotpepper_id' => 'J001248927',
                'shop_name' => 'ブルーシール 栄店',
                'address' => '愛知県名古屋市中区栄3-15-33',
                'category' => 'カフェ',
                'image_url' => 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400'
            ],
            [
                'hotpepper_id' => 'J001248928',
                'shop_name' => 'カフェ・ド・クリエ 金山店',
                'address' => '愛知県名古屋市中区金山1-17-18',
                'category' => 'カフェ',
                'image_url' => 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400'
            ],

            // イタリアン・フレンチ
            [
                'hotpepper_id' => 'J001248905',
                'shop_name' => 'オステリア・ルッカ',
                'address' => '愛知県名古屋市東区泉1-14-23',
                'category' => 'イタリアン',
                'image_url' => 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop'
            ],
            [
                'hotpepper_id' => 'J001248906',
                'shop_name' => 'レストラン オゼール',
                'address' => '愛知県名古屋市中区丸の内2-18-22',
                'category' => 'フレンチ',
                'image_url' => 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop'
            ],
            [
                'hotpepper_id' => 'J001248929',
                'shop_name' => 'リストランテ ベリーニ',
                'address' => '愛知県名古屋市中区錦2-4-15',
                'category' => 'イタリアン',
                'image_url' => 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'
            ],
            [
                'hotpepper_id' => 'J001248930',
                'shop_name' => 'ビストロ ラ・フィーユ',
                'address' => '愛知県名古屋市東区東桜2-23-22',
                'category' => 'フレンチ',
                'image_url' => 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400'
            ],

            // 居酒屋・焼肉
            [
                'hotpepper_id' => 'J001248907',
                'shop_name' => '世界の山ちゃん 本店',
                'address' => '愛知県名古屋市中区錦3-15-13',
                'category' => '居酒屋',
                'image_url' => 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&h=300&fit=crop'
            ],
            [
                'hotpepper_id' => 'J001248931',
                'shop_name' => '風来坊 栄本店',
                'address' => '愛知県名古屋市中区栄3-6-1',
                'category' => '居酒屋',
                'image_url' => 'https://images.unsplash.com/photo-1594221708779-94832f4320d1?w=400'
            ],
            [
                'hotpepper_id' => 'J001248932',
                'shop_name' => '焼肉 牛角 名駅店',
                'address' => '愛知県名古屋市中村区名駅3-13-28',
                'category' => '居酒屋',
                'image_url' => 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400'
            ],

            // その他各国料理
            [
                'hotpepper_id' => 'J001248909',
                'shop_name' => '龍の家 栄店',
                'address' => '愛知県名古屋市中区栄3-12-8',
                'category' => '中華',
                'image_url' => 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop'
            ],
            [
                'hotpepper_id' => 'J001248933',
                'shop_name' => 'タイ料理 クルンテープ',
                'address' => '愛知県名古屋市中区大須2-32-24',
                'category' => 'その他',
                'image_url' => 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400'
            ],
            [
                'hotpepper_id' => 'J001248934',
                'shop_name' => 'インド料理 ガンガ',
                'address' => '愛知県名古屋市昭和区御器所2-18-1',
                'category' => 'その他',
                'image_url' => 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400'
            ],
            [
                'hotpepper_id' => 'J001248935',
                'shop_name' => 'ハワイアン ロコモコ',
                'address' => '愛知県名古屋市千種区覚王山通8-70',
                'category' => 'その他',
                'image_url' => 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400'
            ]
        ];

        $createdShops = [];
        foreach ($shops as $shopData) {
            $createdShops[] = Shop::create($shopData);
        }

        // 🏠 訪問履歴データの作成（名古屋グルメ体験記録）
        $visitedShopsData = [
            // user1の訪問履歴（豊富な履歴を持つグルメユーザー）
            [
                'user_id' => $user1->id,
                'shop_id' => $createdShops[0]->id, // 陳麻婆豆腐 名古屋栄店
                'visited_at' => now()->subDays(15),
                'memo' => '同期の誕生日で利用！本場四川の味に感動しました。麻婆豆腐の辛さがクセになって、みんなで汗をかきながら完食。記念日にはまた来たい。'
            ],
            [
                'user_id' => $user1->id,
                'shop_id' => $createdShops[2]->id, // 矢場とん 本店
                'visited_at' => now()->subDays(7),
                'memo' => '名古屋出張で初体験！八丁味噌のカツは想像以上に美味しくて、なぜもっと早く来なかったのかと後悔。お土産の味噌だれも買って帰りました。'
            ],
            [
                'user_id' => $user1->id,
                'shop_id' => $createdShops[4]->id, // オステリア・ルッカ
                'visited_at' => now()->subDays(30),
                'memo' => 'デート利用。名古屋でこんなに本格的なイタリアンが食べられるとは！パスタの茹で加減も完璧で、彼女も大満足でした。'
            ],
            [
                'user_id' => $user1->id,
                'shop_id' => $createdShops[7]->id, // あつた蓬莱軒 本店
                'visited_at' => now()->subDays(45),
                'memo' => '会社の接待で利用。ひつまぶしの3つの食べ方に取引先も感動していました。名古屋らしいおもてなしができて良かった。'
            ],

            // user2の訪問履歴（カジュアル好き）
            [
                'user_id' => $user2->id,
                'shop_id' => $createdShops[1]->id, // 味仙 今池本店
                'visited_at' => now()->subDays(3),
                'memo' => '台湾ラーメン発祥の店！辛さが後を引いて最高でした。深夜まで営業してるのも助かる。学生の頃からお世話になってます。'
            ],
            [
                'user_id' => $user2->id,
                'shop_id' => $createdShops[3]->id, // コメダ珈琲店 本店
                'visited_at' => now()->subDays(10),
                'memo' => '友達とモーニング利用。シロノワールの甘さと珈琲の苦味がベストマッチ！名古屋の喫茶文化を体験できました。'
            ],
            [
                'user_id' => $user2->id,
                'shop_id' => $createdShops[6]->id, // 世界の山ちゃん 本店
                'visited_at' => now()->subDays(20),
                'memo' => '会社の同僚との飲み会。手羽先の辛さでビールが進みすぎて危険！みんなで盛り上がって最高の夜でした。'
            ],

            // user3の訪問履歴（スイーツ好き）
            [
                'user_id' => $user3->id,
                'shop_id' => $createdShops[9]->id, // 喫茶マウンテン
                'visited_at' => now()->subDays(5),
                'memo' => 'インスタ映えを狙って行ったけど、甘いスパゲティが意外と美味しくてびっくり！名古屋のカオス文化を体験できました。'
            ],
            [
                'user_id' => $user3->id,
                'shop_id' => $createdShops[3]->id, // コメダ珈琲店 本店
                'visited_at' => now()->subDays(25),
                'memo' => 'デートで利用。シロノワールをシェアして、ほっこりした時間を過ごせました♪ 名古屋のカフェ文化が大好きになりました。'
            ],

            // user4の訪問履歴（グルメ探究者）
            [
                'user_id' => $user4->id,
                'shop_id' => $createdShops[5]->id, // レストラン オゼール
                'visited_at' => now()->subDays(12),
                'memo' => '記念日ディナー。フレンチの技法と地元食材の融合が素晴らしい。名古屋にもこんな本格フレンチがあることに感動しました。'
            ],
            [
                'user_id' => $user4->id,
                'shop_id' => $createdShops[8]->id, // 龍の家 栄店
                'visited_at' => now()->subDays(35),
                'memo' => '昔ながらの中華料理店の温かみに癒されました。エビチリの優しい味付けが心に染みる。地元に愛される名店ですね。'
            ],

            // user5の訪問履歴
            [
                'user_id' => $user5->id,
                'shop_id' => $createdShops[1]->id, // 味仙 今池本店
                'visited_at' => now()->subDays(8),
                'memo' => '夜勤明けの台湾ラーメン。疲れた体に辛さが染みて目が覚めました。名古屋ソウルフードの力を実感。'
            ]
        ];

        foreach ($visitedShopsData as $visitedData) {
            VisitedShop::create($visitedData);
        }

        // 📖 ガイドブックデータの作成（テスト用に大幅拡張）
        $guidebook1 = GuideBook::create([
            'user_id' => $user1->id,
            'title' => '名古屋で感動した中華まとめ',
            'geo' => '名古屋',
            'genre' => '中華',
            'image_url' => 'https://shirodashi.co.jp/wp-content/uploads/2020/11/3288bf4a573065863272d7792bdaece4.jpg',
        ]);

        $guidebook2 = GuideBook::create([
            'user_id' => $user2->id,
            'title' => '名古屋グルメ完全攻略',
            'geo' => '名古屋',
            'genre' => 'グルメ',
            'image_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Hitsumabushi_by_Naotake_Murayama.jpg/1280px-Hitsumabushi_by_Naotake_Murayama.jpg',
        ]);

        $guidebook3 = GuideBook::create([
            'user_id' => $user3->id,
            'title' => '名古屋の隠れ家カフェ特集',
            'geo' => '名古屋',
            'genre' => 'カフェ',
            'image_url' => 'https://images.unsplash.com/photo-1511920170033-f8396924c348?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        ]);

        // テスト用追加ガイドブック
        $guidebook4 = GuideBook::create([
            'user_id' => $foodCritic->id,
            'title' => '名古屋ラーメン道 極めし者の選択',
            'geo' => '名古屋',
            'genre' => 'ラーメン',
            'image_url' => 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
        ]);

        $guidebook5 = GuideBook::create([
            'user_id' => $localReporter->id,
            'title' => '本当に美味しい名古屋めし名店',
            'geo' => '名古屋',
            'genre' => '名古屋めし',
            'image_url' => 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
        ]);

        $guidebook6 = GuideBook::create([
            'user_id' => $cafeExpert->id,
            'title' => '喫茶文化が息づく名古屋の名店',
            'geo' => '名古屋',
            'genre' => '喫茶店',
            'image_url' => 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
        ]);

        $guidebook7 = GuideBook::create([
            'user_id' => $sweets_lover->id,
            'title' => 'スイーツ巡礼 名古屋編',
            'geo' => '名古屋',
            'genre' => 'スイーツ',
            'image_url' => 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400',
        ]);

        $guidebook8 = GuideBook::create([
            'user_id' => $ramen_master->id,
            'title' => '究極のラーメン求道記',
            'geo' => '名古屋',
            'genre' => 'ラーメン',
            'image_url' => 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
        ]);

        $guidebook9 = GuideBook::create([
            'user_id' => $admin->id,
            'title' => '名古屋高級フレンチ・イタリアン案内',
            'geo' => '名古屋',
            'genre' => '高級料理',
            'image_url' => 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
        ]);

        $guidebook10 = GuideBook::create([
            'user_id' => $user4->id,
            'title' => 'エスニック料理で世界旅行',
            'geo' => '名古屋',
            'genre' => 'エスニック',
            'image_url' => 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
        ]);

        // 📝 ガイドブックコンテンツデータの作成（ミシュラン風評価システム）
        // guidebook1: 名古屋の本格中華 - ミシュラン級の味を追求
        GuideBookContent::create([
            'guide_id' => $guidebook1->id,
            'shop_id' => $createdShops[0]->id, // 陳麻婆豆腐 名古屋栄店
            'star' => 3, // ミシュラン3つ星：exceptional cuisine worth a special journey
            'comment' => '【最高評価】本場四川の味が完璧に再現された逸品。麻婆豆腐の複雑な旨味と絶妙な辛さのバランスは、まさに芸術的。本店から呼んだシェフの技術は圧巻で、名古屋で本場を超える体験ができる奇跡の店。',
            'image_url' => 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
        ]);

        GuideBookContent::create([
            'guide_id' => $guidebook1->id,
            'shop_id' => $createdShops[8]->id, // 龍の家 栄店
            'star' => 2, // ミシュラン2つ星：excellent cooking worth a detour
            'comment' => '【優秀評価】老舗の技と心意気が光る名店。エビチリの火加減とソースの絡みは絶妙で、何度食べても飽きない完成度。地元に根差した味作りへのこだわりが随所に感じられる、訪れる価値のある店。',
            'image_url' => 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400',
        ]);

        // guidebook2: 名古屋グルメの殿堂 - 郷土料理の真髄を味わう
        GuideBookContent::create([
            'guide_id' => $guidebook2->id,
            'shop_id' => $createdShops[2]->id, // 矢場とん 本店
            'star' => 3, // ミシュラン3つ星：名古屋グルメの最高峰
            'comment' => '【最高評価】名古屋グルメの王座に君臨する不朽の名店。八丁味噌の深い味わいとカツの完璧な食感は、他では絶対に味わえない唯一無二の体験。これを食べずして名古屋を語ることはできない。',
            'image_url' => 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
        ]);

        GuideBookContent::create([
            'guide_id' => $guidebook2->id,
            'shop_id' => $createdShops[7]->id, // あつた蓬莱軒 本店
            'star' => 3, // ミシュラン3つ星：ひつまぶしの頂点
            'comment' => '【最高評価】ひつまぶし発祥の地で味わう至高の体験。3つの食べ方それぞれが完璧に計算され、うなぎの香ばしさと秘伝のタレが織りなす味の物語は感動的。名古屋文化の結晶とも言える傑作料理。',
            'image_url' => 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400',
        ]);

        GuideBookContent::create([
            'guide_id' => $guidebook2->id,
            'shop_id' => $createdShops[6]->id, // 世界の山ちゃん 本店
            'star' => 2, // ミシュラン2つ星：手羽先文化の創造者
            'comment' => '【優秀評価】名古屋の夜を彩る手羽先文化の立役者。スパイスの絶妙な配合と独特の調理法で生み出される中毒性は、単なる居酒屋メニューを超えた芸術性を持つ。名古屋の食文化を語る上で欠かせない存在。',
            'image_url' => 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400',
        ]);

        // guidebook3: 名古屋カフェ文化の探究 - 独自の喫茶文化を体験
        GuideBookContent::create([
            'guide_id' => $guidebook3->id,
            'shop_id' => $createdShops[3]->id, // コメダ珈琲店 本店
            'star' => 2, // ミシュラン2つ星：名古屋喫茶文化の象徴
            'comment' => '【優秀評価】名古屋喫茶文化の根幹を支える記念すべき店。シロノワールの考案に始まる独創性と、モーニング文化への貢献は計り知れない。単なるカフェを超えて、名古屋の文化的アイデンティティを形成した偉大な存在。',
            'image_url' => 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
        ]);

        GuideBookContent::create([
            'guide_id' => $guidebook3->id,
            'shop_id' => $createdShops[9]->id, // 喫茶マウンテン
            'star' => 1, // ミシュラン1つ星：カオス料理の先駆者
            'comment' => '【良評価】常識を打ち破る革新的メニューで名古屋B級グルメ界に新風を吹き込む異端の名店。甘いスパゲティという発想の転換は、食の多様性を体現している。エンターテイメント性も含めて評価すべき独特の世界観。',
            'image_url' => 'https://images.unsplash.com/photo-1571167433940-4b5100e1d67c?w=400',
        ]);

        // guidebook4: ラーメン道の探究 - 修行僧による厳選
        GuideBookContent::create([
            'guide_id' => $guidebook4->id,
            'shop_id' => $createdShops[1]->id, // 味仙 今池本店
            'star' => 3, // ミシュラン3つ星：台湾ラーメンの聖地
            'comment' => '【最高評価】台湾ラーメン発祥の地として歴史に刻まれる殿堂。激辛スープの奥深い味わいは他店の追随を許さず、一度味わえば虜になる魔力がある。名古屋のラーメン文化を築いた不朽の名店。',
            'image_url' => 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
        ]);

        GuideBookContent::create([
            'guide_id' => $guidebook4->id,
            'shop_id' => $createdShops[11]->id, // ラーメン横綱 名古屋店
            'star' => 2, // ミシュラン2つ星：京都系の上質ラーメン
            'comment' => '【優秀評価】京都系の丁寧な仕事が光る質の高いラーメン。スープの透明感と豚骨の旨味のバランスが絶妙で、関西の技術力の高さを実感できる。名古屋激戦区でも確実に存在感を放つ実力店。',
            'image_url' => 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
        ]);

        GuideBookContent::create([
            'guide_id' => $guidebook4->id,
            'shop_id' => $createdShops[12]->id, // 麺や 福座
            'star' => 2, // ミシュラン2つ星：隠れた実力派
            'comment' => '【優秀評価】知る人ぞ知る池下の実力派。自家製麺の食感とスープとの一体感は職人の技が光る逸品。派手さはないが確実に記憶に残る、本物志向のラーメン愛好家に愛される名店。',
            'image_url' => 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
        ]);

        // guidebook5: 名古屋めしの真髄 - 地元記者が選ぶ本物
        GuideBookContent::create([
            'guide_id' => $guidebook5->id,
            'shop_id' => $createdShops[13]->id, // 山本屋本店 栄本店
            'star' => 2, // ミシュラン2つ星：味噌煮込みうどんの王道
            'comment' => '【優秀評価】名古屋めしの代表格として君臨する老舗の矜持。赤味噌の深いコクと硬い麺の絶妙なバランスは、代々受け継がれた技の結晶。名古屋の食文化を語る上で絶対に外せない重要文化財級の存在。',
            'image_url' => 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
        ]);

        GuideBookContent::create([
            'guide_id' => $guidebook5->id,
            'shop_id' => $createdShops[14]->id, // きしめん よしだ
            'star' => 1, // ミシュラン1つ星：駅きしめんの傑作
            'comment' => '【良評価】名古屋駅の立ち食いながら侮れない本格派。つゆの上品な味わいと平打ち麺の滑らかな食感は、短時間でも満足度の高い名古屋体験を提供。旅の記憶に残る駅グルメの最高峰。',
            'image_url' => 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
        ]);

        // guidebook6: 喫茶文化の奥深さ - 専門家による解説
        GuideBookContent::create([
            'guide_id' => $guidebook6->id,
            'shop_id' => $createdShops[15]->id, // ブルーシール 栄店
            'star' => 1, // ミシュラン1つ星：モダンカフェの新風
            'comment' => '【良評価】沖縄発の新しいカフェ文化が名古屋に定着した好例。アイスクリームの独特の食感と南国風の店内は、従来の喫茶店とは異なる魅力を提供。多様化する名古屋カフェシーンの一翼を担う。',
            'image_url' => 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400',
        ]);

        GuideBookContent::create([
            'guide_id' => $guidebook6->id,
            'shop_id' => $createdShops[16]->id, // カフェ・ド・クリエ 金山店
            'star' => 1, // ミシュラン1つ星：ビジネス利用に最適
            'comment' => '【良評価】金山という交通の要所で提供される安定した品質のコーヒーは、忙しいビジネスパーソンの強い味方。効率性と品質のバランスが取れた現代的なカフェスタイルの代表格。',
            'image_url' => 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
        ]);

        // guidebook7: スイーツ巡礼 - 甘党による徹底レビュー
        GuideBookContent::create([
            'guide_id' => $guidebook7->id,
            'shop_id' => $createdShops[3]->id, // コメダ珈琲店 本店
            'star' => 3, // ミシュラン3つ星：シロノワールの奇跡
            'comment' => '【最高評価】シロノワール誕生の聖地として、スイーツ界に革命をもたらした歴史的意義は計り知れない。温かいデニッシュと冷たいソフトクリームの温度差が創り出すハーモニーは、まさに天才的な発想の産物。',
            'image_url' => 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
        ]);

        // guidebook8: 究極のラーメン求道記 - マスターの選択
        GuideBookContent::create([
            'guide_id' => $guidebook8->id,
            'shop_id' => $createdShops[1]->id, // 味仙 今池本店
            'star' => 3, // ミシュラン3つ星：不動の王者
            'comment' => '【最高評価】50年間変わらぬ味で名古屋人を魅了し続ける不動の王座。台湾ラーメンという新ジャンルを創造した革新性と、それを今日まで守り続けた一貫性は、ラーメン界の奇跡そのもの。',
            'image_url' => 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
        ]);

        // guidebook9: 高級料理の神髄 - 特別な夜のために
        GuideBookContent::create([
            'guide_id' => $guidebook9->id,
            'shop_id' => $createdShops[4]->id, // オステリア・ルッカ
            'star' => 3, // ミシュラン3つ星：東海地方屈指のイタリアン
            'comment' => '【最高評価】本場イタリアの技術と日本の食材が完璧に融合した芸術品。シェフの圧倒的な技術力とセンスが生み出す料理は、名古屋の外食レベルを次元の違う高さまで押し上げた記念碑的存在。',
            'image_url' => 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
        ]);

        GuideBookContent::create([
            'guide_id' => $guidebook9->id,
            'shop_id' => $createdShops[5]->id, // レストラン オゼール
            'star' => 3, // ミシュラン3つ星：フレンチの最高峰
            'comment' => '【最高評価】フランス料理の精神を体現した名古屋屈指の高級レストラン。季節感を重視した繊細な料理構成と完璧なサービスは、特別な日にふさわしい非日常体験を約束する。東海地方フレンチ界の宝石。',
            'image_url' => 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
        ]);

        // guidebook10: エスニック料理で世界旅行 - 多様性を求めて
        GuideBookContent::create([
            'guide_id' => $guidebook10->id,
            'shop_id' => $createdShops[19]->id, // タイ料理 クルンテープ
            'star' => 2, // ミシュラン2つ星：本格タイ料理の拠点
            'comment' => '【優秀評価】大須という多国籍エリアで存在感を放つ本格タイ料理の名店。辛さとココナッツミルクのバランスが絶妙なグリーンカレーは、現地で修行したシェフの技が光る逸品。',
            'image_url' => 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
        ]);

        GuideBookContent::create([
            'guide_id' => $guidebook10->id,
            'shop_id' => $createdShops[20]->id, // インド料理 ガンガ
            'star' => 2, // ミシュラン2つ星：スパイスマジックの世界
            'comment' => '【優秀評価】御器所で愛され続けるインド料理の老舗。自家調合のスパイスが織りなすカレーの深い味わいは、一度体験すれば忘れられない強烈な印象を残す。本場の味を名古屋で堪能できる貴重な存在。',
            'image_url' => 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
        ]);

        // 👥 フォロワーデータの作成（ガイドブックの人気度と多様性のため）
        // 人気の分散: 各ユーザーに異なる規模のフォロワーを設定

        // 超人気ユーザー: user1（中華ガイド）- 8フォロワー
        $followers1 = [
            ['follower_user_id' => $user2->id, 'followed_user_id' => $user1->id],
            ['follower_user_id' => $user3->id, 'followed_user_id' => $user1->id],
            ['follower_user_id' => $user4->id, 'followed_user_id' => $user1->id],
            ['follower_user_id' => $user5->id, 'followed_user_id' => $user1->id],
            ['follower_user_id' => $admin->id, 'followed_user_id' => $user1->id],
            ['follower_user_id' => $foodCritic->id, 'followed_user_id' => $user1->id],
            ['follower_user_id' => $localReporter->id, 'followed_user_id' => $user1->id],
            ['follower_user_id' => $cafeExpert->id, 'followed_user_id' => $user1->id],
        ];

        // 人気ユーザー: user2（総合グルメ）- 6フォロワー
        $followers2 = [
            ['follower_user_id' => $user1->id, 'followed_user_id' => $user2->id],
            ['follower_user_id' => $user3->id, 'followed_user_id' => $user2->id],
            ['follower_user_id' => $user5->id, 'followed_user_id' => $user2->id],
            ['follower_user_id' => $admin->id, 'followed_user_id' => $user2->id],
            ['follower_user_id' => $localReporter->id, 'followed_user_id' => $user2->id],
            ['follower_user_id' => $sweets_lover->id, 'followed_user_id' => $user2->id],
        ];

        // 中級人気: user3（カフェ）- 4フォロワー
        $followers3 = [
            ['follower_user_id' => $user1->id, 'followed_user_id' => $user3->id],
            ['follower_user_id' => $user2->id, 'followed_user_id' => $user3->id],
            ['follower_user_id' => $sweets_lover->id, 'followed_user_id' => $user3->id],
            ['follower_user_id' => $cafeExpert->id, 'followed_user_id' => $user3->id],
        ];

        // 専門家同士のフォロー関係も作成
        // foodCritic（グルメ評論家）- 5フォロワー（プロとして注目される）
        $followersFoodCritic = [
            ['follower_user_id' => $localReporter->id, 'followed_user_id' => $foodCritic->id],
            ['follower_user_id' => $ramen_master->id, 'followed_user_id' => $foodCritic->id],
            ['follower_user_id' => $user4->id, 'followed_user_id' => $foodCritic->id],
            ['follower_user_id' => $user5->id, 'followed_user_id' => $foodCritic->id],
            ['follower_user_id' => $admin->id, 'followed_user_id' => $foodCritic->id],
        ];

        // localReporter（地元記者）- 3フォロワー（地元密着で信頼度高）
        $followersLocalReporter = [
            ['follower_user_id' => $user2->id, 'followed_user_id' => $localReporter->id],
            ['follower_user_id' => $user4->id, 'followed_user_id' => $localReporter->id],
            ['follower_user_id' => $admin->id, 'followed_user_id' => $localReporter->id],
        ];

        // cafeExpert（カフェ専門家）- 3フォロワー（専門分野で定評）
        $followersCafeExpert = [
            ['follower_user_id' => $user3->id, 'followed_user_id' => $cafeExpert->id],
            ['follower_user_id' => $sweets_lover->id, 'followed_user_id' => $cafeExpert->id],
            ['follower_user_id' => $user5->id, 'followed_user_id' => $cafeExpert->id],
        ];

        // sweets_lover（スイーツ愛好家）- 2フォロワー（ニッチだが熱心な支持）
        $followersSweets = [
            ['follower_user_id' => $user3->id, 'followed_user_id' => $sweets_lover->id],
            ['follower_user_id' => $cafeExpert->id, 'followed_user_id' => $sweets_lover->id],
        ];

        // ramen_master（ラーメン修行僧）- 4フォロワー（ラーメン愛好家に支持）
        $followersRamen = [
            ['follower_user_id' => $user1->id, 'followed_user_id' => $ramen_master->id],
            ['follower_user_id' => $user2->id, 'followed_user_id' => $ramen_master->id],
            ['follower_user_id' => $foodCritic->id, 'followed_user_id' => $ramen_master->id],
            ['follower_user_id' => $user5->id, 'followed_user_id' => $ramen_master->id],
        ];

        // admin（管理者）- 1フォロワー（権威として少数精鋭）
        $followersAdmin = [
            ['follower_user_id' => $foodCritic->id, 'followed_user_id' => $admin->id],
        ];

        // user4（高級志向）- 2フォロワー（高級グルメ愛好家）
        $followersUser4 = [
            ['follower_user_id' => $admin->id, 'followed_user_id' => $user4->id],
            ['follower_user_id' => $foodCritic->id, 'followed_user_id' => $user4->id],
        ];

        // 全フォロワーデータを一括作成
        $allFollowers = array_merge(
            $followers1, $followers2, $followers3,
            $followersFoodCritic, $followersLocalReporter, $followersCafeExpert,
            $followersSweets, $followersRamen, $followersAdmin, $followersUser4
        );

        foreach ($allFollowers as $followerData) {
            Follower::create($followerData);
        }

    }
}
