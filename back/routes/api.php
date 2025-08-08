<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FriendController;
use App\Http\Controllers\FollowController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\RestaurantController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\VisitedShopController;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Home endpoints
Route::get('/home', [HomeController::class, 'index']);

// Restaurant endpoints
Route::get('/restaurants/{hotpepperId}/detail', [RestaurantController::class, 'getShopDetail']);
Route::post('/restaurants/search', [RestaurantController::class, 'search']);


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
    Route::post('/user/{id}/visited_history', [VisitedShopController::class, 'getUserHistory']);

    // Restaurant endpoints (authenticated)
    Route::post('/restaurants/add-to-guide', [RestaurantController::class, 'addToGuide']);
    
    // Notification endpoints (authenticated)
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    
    // Visited Shop History endpoints (authenticated)
    Route::post('/history/add', [VisitedShopController::class, 'store']);

});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});
