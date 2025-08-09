<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GuideContentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // 新規作成時のみshop_idを必須に、更新時は不要
        $isUpdate = $this->route('contentId') !== null;
        
        return [
            'shop_id' => $isUpdate ? 'sometimes|integer' : 'required|integer',
            'star' => 'required|integer|min:1|max:3',
            'comment' => 'nullable|string|max:500',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ];
    }

    public function messages(): array
    {
        return [
            'shop_id.required' => '店舗は必須です',
            'star.required' => '評価は必須です',
            'star.min' => '評価は1以上を選択してください',
            'star.max' => '評価は3以下を選択してください'
        ];
    }
}