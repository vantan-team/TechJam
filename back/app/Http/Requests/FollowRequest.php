<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FollowRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'follow_user_id' => 'required|integer|exists:users,id',
            'type' => 'required|string|in:follow,unfollow'
        ];
    }

    public function messages(): array
    {
        return [
            'follow_user_id.required' => 'フォローユーザーIDは必須です',
            'follow_user_id.exists' => '指定されたユーザーは存在しません',
            'type.required' => 'タイプは必須です',
            'type.in' => 'タイプはfollowまたはunfollowを指定してください'
        ];
    }
}