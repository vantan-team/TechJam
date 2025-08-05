<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Shop extends Model
{
    protected $fillable = [
        'hotpepper_id',
        'shop_name',
        'address',
        'category',
    ];

    public function visitedShops()
    {
        return $this->hasMany(VisitedShop::class);
    }

    public function guideBookContents()
    {
        return $this->hasMany(GuideBookContent::class);
    }
}
