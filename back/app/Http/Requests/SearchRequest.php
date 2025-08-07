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
            'include_history' => 'sometimes|boolean'
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