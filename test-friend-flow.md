# フレンド機能テストガイド

## 前提条件
- Docker環境が起動していること
- 2つのテストユーザーが存在すること

## テスト手順

### 1. ユーザー作成
```bash
# Laravelのtinkerでユーザー作成
docker-compose exec back php artisan tinker
```

```php
// User1作成
$user1 = \App\Models\User::create([
    'name' => 'Test User 1',
    'email' => 'user1@test.com',
    'password' => bcrypt('password')
]);

// User2作成  
$user2 = \App\Models\User::create([
    'name' => 'Test User 2',
    'email' => 'user2@test.com', 
    'password' => bcrypt('password')
]);
```

### 2. ブラウザでテスト

#### User1でログイン
1. http://localhost:3000/login にアクセス
2. user1@test.com / password でログイン
3. フレンドページに移動
4. User2を検索してフレンド申請

#### User2でログイン（別タブ）
1. http://localhost:3000/login にアクセス  
2. user2@test.com / password でログイン
3. 通知ページ（/notifications）に移動
4. フレンド申請を承認

#### 結果確認
1. 両ユーザーのフレンドリストに相手が表示される
2. 通知が正しく動作する

## トラブルシューティング

### 404エラーの場合
- ルートキャッシュクリア: `php artisan route:cache`
- 認証トークン確認: ブラウザのLocal Storageを確認
- CORS設定確認: 
  - SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost:8008
  - フロントエンドとバックエンドのポート確認

### 認証エラーの場合  
- トークンが正しく送信されているかNetwork タブで確認
- トークンの有効期限を確認
- Sanctum設定を確認

### データベースエラーの場合
- Dockerコンテナが起動しているか確認
- マイグレーションが完了しているか確認
- データベース接続設定を確認