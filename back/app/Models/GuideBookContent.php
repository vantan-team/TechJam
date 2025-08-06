<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GuideBookContent extends Model
{
    protected $fillable = [
        'guide_id',
        'shop_id',
        'star',
        'visited_shop_id',
        'image_url',
    ];

    public function guide()
    {
        return $this->belongsTo(GuideBook::class, 'guide_id');
    }

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    public function visitedShop()
    {
        return $this->belongsTo(VisitedShop::class);
    }
}
