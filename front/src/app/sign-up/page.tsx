// サインアップページ
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Mail, Lock, User, Camera, FileText, ArrowLeft, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

type FormStep = 'credentials' | 'profile' | 'complete';

interface SignUpData {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  profileImage: File | null;
  bio: string;
}

export default function SignUpPage() {
  const [currentStep, setCurrentStep] = useState<FormStep>('credentials');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState<SignUpData>({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    profileImage: null,
    bio: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateCredentials = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.email) {
      newErrors.email = 'メールアドレスは必須です';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    if (!formData.password) {
      newErrors.password = 'パスワードは必須です';
    } else if (formData.password.length < 8) {
      newErrors.password = 'パスワードは8文字以上である必要があります';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'パスワード確認は必須です';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'パスワードが一致しません';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateProfile = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.username) {
      newErrors.username = 'ユーザー名は必須です';
    } else if (formData.username.length < 3) {
      newErrors.username = 'ユーザー名は3文字以上である必要があります';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 'credentials') {
      if (validateCredentials()) {
        setCurrentStep('profile');
      }
    } else if (currentStep === 'profile') {
      if (validateProfile()) {
        setCurrentStep('complete');
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 'profile') {
      setCurrentStep('credentials');
    } else if (currentStep === 'complete') {
      setCurrentStep('profile');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, profileImage: file }));
      
      // プレビュー用のURL作成
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      // FormDataを作成してファイルも含めて送信
      const submitData = new FormData();
      submitData.append('email', formData.email);
      submitData.append('password', formData.password);
      submitData.append('password_confirmation', formData.confirmPassword);
      submitData.append('username', formData.username);
      submitData.append('introduction', formData.bio);
      
      if (formData.profileImage) {
        submitData.append('profileImage', formData.profileImage);
      }

      console.log('SignUp attempt:', {
        email: formData.email,
        username: formData.username,
        bio: formData.bio,
        hasProfileImage: !!formData.profileImage
      });
      const req = await fetch(`${process.env.NEXT_PUBLIC_API_ROOT}/api/auth/register`, {
        method: 'POST',
        body: submitData
      });

      if (req.ok) {
          const uData = await req.json();
          window.localStorage.setItem('access_token', uData.access_token);
          router.push('/home');
      }
    } catch (error) {
      console.error('SignUp error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'credentials': return '基本情報';
      case 'profile': return 'あと少しで完了です！';
      case 'complete': return 'ありがとうございます！！';
      default: return '新規登録';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'credentials': return 'メールアドレスとパスワードを入力してください';
      case 'profile': return 'プロフィール情報を設定しましょう';
      case 'complete': return '入力内容を確認して登録を完了してください';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      <Card className="w-full max-w-md relative z-10 bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-xl">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">{getStepTitle()}</CardTitle>
          <CardDescription className="text-gray-600">
            {getStepDescription()}
          </CardDescription>
          
          {/* ステップインジケーター */}
          <div className="flex justify-center space-x-2 pt-2">
            <div className={`w-3 h-3 rounded-full transition-colors ${
              currentStep === 'credentials' ? 'bg-[#A90017]' : 'bg-gray-300'
            }`} />
            <div className={`w-3 h-3 rounded-full transition-colors ${
              currentStep === 'profile' ? 'bg-[#A90017]' : 'bg-gray-300'
            }`} />
            <div className={`w-3 h-3 rounded-full transition-colors ${
              currentStep === 'complete' ? 'bg-[#A90017]' : 'bg-gray-300'
            }`} />
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="relative overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${
                  currentStep === 'credentials' ? 0 : 
                  currentStep === 'profile' ? 100 : 200
                }%)`
              }}
            >
              {/* ステップ1: 基本情報 */}
              <div className="w-full flex-shrink-0 space-y-4">
                {/* メールアドレス入力 */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    メールアドレス
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={`bg-white/80 border-gray-300 focus:ring-[#A90017]/20 ${
                      errors.email ? 'border-red-500' : ''
                    }`}
                    style={{
                      '--tw-ring-color': 'rgba(169, 0, 23, 0.2)'
                    } as React.CSSProperties}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#A90017';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = errors.email ? '#ef4444' : '#d1d5db';
                    }}
                  />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>

                {/* パスワード入力 */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    パスワード
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="パスワードを入力"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className={`bg-white/80 border-gray-300 focus:ring-[#A90017]/20 pr-10 ${
                        errors.password ? 'border-red-500' : ''
                      }`}
                      style={{
                        '--tw-ring-color': 'rgba(169, 0, 23, 0.2)'
                      } as React.CSSProperties}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#A90017';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = errors.password ? '#ef4444' : '#d1d5db';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                </div>

                {/* パスワード確認入力 */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    パスワード確認
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="パスワードを再入力"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className={`bg-white/80 border-gray-300 focus:ring-[#A90017]/20 pr-10 ${
                        errors.confirmPassword ? 'border-red-500' : ''
                      }`}
                      style={{
                        '--tw-ring-color': 'rgba(169, 0, 23, 0.2)'
                      } as React.CSSProperties}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#A90017';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = errors.confirmPassword ? '#ef4444' : '#d1d5db';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
                </div>

                <Button
                  onClick={handleNextStep}
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
                >
                  次へ <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {/* ステップ2: プロフィール設定 */}
              <div className="w-full flex-shrink-0 space-y-4">
                {/* プロフィール写真アップロード */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="profile-image"
                    />
                    <label
                      htmlFor="profile-image"
                      className="relative flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-full cursor-pointer hover:border-[#A90017] transition-colors bg-gray-50 overflow-hidden"
                    >
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="プロフィール写真"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <>
                          <Camera className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-xs text-gray-500 text-center px-2">
                            写真を選択
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* ユーザー名入力 */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-700 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    ユーザー名
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="ユーザー名を入力"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className={`bg-white/80 border-gray-300 focus:ring-[#A90017]/20 ${
                      errors.username ? 'border-red-500' : ''
                    }`}
                    style={{
                      '--tw-ring-color': 'rgba(169, 0, 23, 0.2)'
                    } as React.CSSProperties}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#A90017';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = errors.username ? '#ef4444' : '#d1d5db';
                    }}
                  />
                  {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
                </div>

                {/* 自己紹介入力 */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-gray-700 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    自己紹介（任意）
                  </Label>
                  <textarea
                    id="bio"
                    placeholder="自己紹介を入力してください"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A90017]/20 focus:border-[#A90017] resize-none"
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

                <div className="flex space-x-3">
                  <Button
                    onClick={handlePrevStep}
                    variant="outline"
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> 戻る
                  </Button>
                  <Button
                    onClick={handleNextStep}
                    className="flex-1 text-white transition-all duration-200"
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
                  >
                    確認へ <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>

              {/* ステップ3: 確認・完了 */}
              <div className="w-full flex-shrink-0 space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold text-gray-900">入力内容確認</h3>
                  
                  {/* プロフィール写真表示 */}
                  {previewImage && (
                    <div className="flex justify-center">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300">
                        <img
                          src={previewImage}
                          alt="プロフィール写真"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">メールアドレス:</span>
                      <span className="ml-2 text-gray-900">{formData.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">ユーザー名:</span>
                      <span className="ml-2 text-gray-900">{formData.username}</span>
                    </div>
                    {formData.bio && (
                      <div>
                        <span className="text-gray-600">自己紹介:</span>
                        <p className="ml-2 text-gray-900 text-xs bg-white p-2 rounded border">
                          {formData.bio}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={handlePrevStep}
                    variant="outline"
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> 修正
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="flex-1 text-white transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
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
                        登録中...
                      </div>
                    ) : (
                      '登録完了'
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* ログインページへのリンク */}
            {currentStep === 'credentials' && (
              <div className="mt-6">
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">または</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <span className="text-gray-600">すでにアカウントをお持ちの方は </span>
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
                    ログイン
                  </button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
