<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SearchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'keyword' => 'required|string|min:2|max:50',
            'include_history' => 'sometimes|boolean',
            // 追加の検索パラメータ（任意）
            'lat' => 'sometimes|numeric|between:-90,90',
            'lng' => 'sometimes|numeric|between:-180,180',
            // ホットペッパーAPIのrange: 1(300m)/2(500m)/3(1000m)/4(2000m)/5(3000m)
            'range' => 'sometimes|integer|min:1|max:5',
            // ページング
            'start' => 'sometimes|integer|min:1',
            'count' => 'sometimes|integer|min:1|max:50',
            // 絞り込み
            'genre' => 'sometimes|string|max:50',
            'budget' => 'sometimes|string|max:10'
        ];
    }

    public function messages(): array
    {
        return [
            'keyword.required' => 'キーワードは必須です',
            'keyword.min' => 'キーワードは2文字以上で入力してください',
            'keyword.max' => 'キーワードは50文字以下で入力してください'
        ];
    }
}
