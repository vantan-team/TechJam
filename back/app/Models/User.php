<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'profile_photo_url',
        'introduction',
        'private',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'private' => 'boolean',
        ];
    }

    public function followers()
    {
        return $this->hasMany(Follower::class, 'followed_user_id');
    }

    public function following()
    {
        return $this->hasMany(Follower::class, 'follower_user_id');
    }

    public function friendRequestsSent()
    {
        return $this->hasMany(Friend::class, 'user_id');
    }

    public function friendRequestsReceived()
    {
        return $this->hasMany(Friend::class, 'friend_user_id');
    }

    public function visitedShops()
    {
        return $this->hasMany(VisitedShop::class);
    }

    public function guideBooks()
    {
        return $this->hasMany(GuideBook::class);
    }
}
