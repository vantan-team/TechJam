<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GuideBookRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:100',
            'geo' => 'nullable|string|max:50',
            'genre' => 'nullable|string|max:50',
            // allow up to 16MB (Laravel's max in kilobytes)
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:16384'
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'タイトルは必須です',
            'title.max' => 'タイトルは100文字以下で入力してください'
        ];
    }
}
