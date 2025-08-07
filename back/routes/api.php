<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FriendController;
use App\Http\Controllers\FollowController;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/status', [AuthController::class, 'status']);

    // Friend endpoints
    Route::get('/friends', [FriendController::class, 'index']);
    Route::post('/friends/request', [FriendController::class, 'store']);
    Route::post('/friends/{id}/accept', [FriendController::class, 'accept']);
    Route::delete('/friends/{id}', [FriendController::class, 'destroy']);

    // User endpoints (authenticated)
    Route::post('/user/follow', [FollowController::class, 'follow']);
    Route::post('/user/{id}/followed', [FollowController::class, 'getFollowed']);

});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});
