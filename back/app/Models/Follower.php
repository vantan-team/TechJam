<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Follower extends Model
{
    protected $fillable = [
        'follower_user_id',
        'followed_user_id',
    ];

    public function follower()
    {
        return $this->belongsTo(User::class, 'follower_user_id');
    }

    public function followed()
    {
        return $this->belongsTo(User::class, 'followed_user_id');
    }
}
