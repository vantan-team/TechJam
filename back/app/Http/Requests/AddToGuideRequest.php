<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddToGuideRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'shop_name' => 'required|string|max:255',
            'shop_address' => 'required|string|max:500',
            'rating' => 'required|integer|min:1|max:3',
            'memo' => 'nullable|string|max:1000',
            'visited_year' => 'required|integer|min:2020|max:' . (date('Y') + 1),
            'visited_month' => 'required|integer|min:1|max:12',
            'guide_book_id' => 'required|integer',
            'hotpepper_id' => 'nullable|string'
        ];
    }

    public function messages(): array
    {
        return [
            'shop_name.required' => '店舗名は必須です',
            'rating.required' => '評価は必須です',
            'rating.min' => '評価は1以上を選択してください',
            'rating.max' => '評価は3以下を選択してください'
        ];
    }
}