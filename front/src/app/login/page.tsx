'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // ここでログイン処理を実装
    try {
      // ログイン API 呼び出し
      console.log('Login attempt:', { email, password });
      const req = await fetch(`${process.env.NEXT_PUBLIC_API_ROOT}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      if (req.ok) {
        const data = await req.json();
        window.localStorage.setItem('access_token', data.access_token);
        setErrorMessage(''); // エラーメッセージをクリア
        router.push('/home'); // ログイン成功後のリダイレクト
      } else {
        console.error('Login failed:', req.statusText);
        setErrorMessage('ログインに失敗しました。メールアドレスとパスワードを確認してください。');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('ネットワークエラーが発生しました。しばらく時間をおいて再度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* ログインフォーム */}
      <Card className="w-full max-w-md relative z-10 bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-xl">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">ログイン</CardTitle>
          <CardDescription className="text-gray-600">
            My Michelinにおかえりなさい！ガイド作成を続けましょう！
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* エラーメッセージ表示 */}
            {errorMessage && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{errorMessage}</p>
              </div>
            )}
            {/* メールアドレス入力 */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">
                <Mail className="w-4 h-4" />
                メールアドレス
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/80 border-gray-300 focus:ring-red-400/20"
                style={{
                  '--tw-ring-color': 'rgba(169, 0, 23, 0.2)'
                } as React.CSSProperties}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#A90017';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
              />
            </div>

            {/* パスワード入力 */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">
                <Lock className="w-4 h-4" />
                パスワード
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="パスワードを入力"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/80 border-gray-300 focus:ring-red-400/20 pr-10"
                  style={{
                    '--tw-ring-color': 'rgba(169, 0, 23, 0.2)'
                  } as React.CSSProperties}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#A90017';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* パスワードを忘れた場合のリンク */}
            <div className="text-right">
              <button
                type="button"
                className="text-sm transition-colors"
                style={{ color: '#A90017' }}
                onClick={() => router.push('/reset-password')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#940014';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#A90017';
                }}
              >
                パスワードを忘れましたか？
              </button>
            </div>

            {/* ログインボタン */}
            <Button
              type="submit"
              className="w-full text-white transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: '#A90017',
                borderColor: '#A90017'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#940014';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#A90017';
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ログイン中...
                </div>
              ) : (
                'ログイン'
              )}
            </Button>

            {/* 区切り線 */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">または</span>
              </div>
            </div>

            {/* 新規登録リンク */}
            <div className="text-center">
              <span className="text-gray-600">アカウントをお持ちでない方は </span>
              <button
                type="button"
                className="font-medium transition-colors"
                style={{ color: '#A90017' }}
                onClick={() => router.push('/sign-up')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#940014';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#A90017';
                }}
              >
                新規登録
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
