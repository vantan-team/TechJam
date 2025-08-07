// パスワードリセットページ
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // パスワードリセット処理
    try {
      // パスワードリセットAPI呼び出し
      console.log('Reset password request:', { email });
      // 実際のリセット処理をここに追加
      setSent(true);
    } catch (error) {
      console.error('Reset password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      <Card className="w-full max-w-md relative z-10 bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-xl">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">パスワードリセット</CardTitle>
          <CardDescription className="text-gray-600">
            登録済みメールアドレスを入力してください。リセット用リンクを送信します。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center text-green-700 py-8">
              リセット用メールを送信しました。ご確認ください。
              <div className="mt-6">
                <Button
                  type="button"
                  className="w-full"
                  style={{ backgroundColor: '#A90017', borderColor: '#A90017' }}
                  onClick={() => router.push('/login')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#940014';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#A90017';
                  }}
                >
                  ログイン画面へ戻る
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    送信中...
                  </div>
                ) : (
                  'リセットリンクを送信'
                )}
              </Button>
              <div className="text-center">
                <button
                  type="button"
                  className="font-medium transition-colors"
                  style={{ color: '#A90017' }}
                  onClick={() => router.push('/login')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#940014';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#A90017';
                  }}
                >
                  ログイン画面へ戻る
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
