<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VisitedShop extends Model
{
    protected $fillable = [
        'user_id',
        'shop_id',
        'visited_at',
        'memo',
    ];

    protected function casts(): array
    {
        return [
            'visited_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    public function guideBookContents()
    {
        return $this->hasMany(GuideBookContent::class);
    }
}
