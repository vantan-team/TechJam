<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GuideBook extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'geo',
        'genre',
        'image_url',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function contents()
    {
        return $this->hasMany(GuideBookContent::class, 'guide_id');
    }
}
