<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\User;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\LoginRequest;

class AuthController extends Controller
{
    public function status(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'isLoggedIn' => true,
            'message' => ['認証に成功しました'],
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'profilePhotoUrl' => $user->profile_photo_url ?? ''
            ]
        ]);
    }

    public function register(Request $request): JsonResponse
    {
        // FormDataとJSONの両方に対応
        $request->validate([
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8',
            'username' => 'required|string|min:3|max:255',
            'introduction' => 'nullable|string|max:1000',
            'profileImage' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        // プロフィール画像のアップロード処理
        $profilePhotoUrl = null;
        if ($request->hasFile('profileImage')) {
            $file = $request->file('profileImage');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('uploads/profiles'), $fileName);
            $profilePhotoUrl = '/uploads/profiles/' . $fileName;
        }

        // ユーザー作成
        $user = User::create([
            'name' => $request->username,  // フロントエンドからは"username"で送信される
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'introduction' => $request->introduction,
            'profile_photo_url' => $profilePhotoUrl,
        ]);

        $token = $user->createToken('auth_token', ['full'])->plainTextToken;

        return response()->json([
            'isLoggedIn' => true,
            'message' => ['ユーザー登録が完了しました'],
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'profilePhotoUrl' => $user->profile_photo_url ?? ''
            ],
            'access_token' => $token  // フロントエンドが期待しているキー名
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'isLoggedIn' => false,
                'message' => ['メールアドレスまたはパスワードが正しくありません'],
                'user' => (object)[]
            ], 401);
        }

        $user = Auth::user();
        /** @var User $user */
        $token = $user->createToken('auth_token', ['full'])->plainTextToken;

        return response()->json([
            'isLoggedIn' => true,
            'message' => ['ログインしました'],
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'profilePhotoUrl' => $user->profile_photo_url ?? ''
            ],
            'access_token' => $token
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'isLoggedIn' => false,
            'message' => ['ログアウトしました'],
            'user' => (object)[]
        ]);
    }
}
