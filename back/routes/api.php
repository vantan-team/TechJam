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
use App\Http\Controllers\GuideBookController;
use App\Http\Controllers\GuideContentController;
use App\Http\Controllers\UserController;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Home endpoints
Route::get('/home', [HomeController::class, 'index']);

// Restaurant endpoints
Route::get('/restaurants/{hotpepperId}/detail', [RestaurantController::class, 'getShopDetail']);
Route::post('/restaurants/search', [RestaurantController::class, 'search']);

// User public profile endpoint
Route::post('/user/{id}', [UserController::class, 'show'])->whereNumber('id');


Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/status', [AuthController::class, 'status']);

    // Friend endpoints
    Route::get('/friends', [FriendController::class, 'index']);
    Route::post('/friends/request', [FriendController::class, 'store']);
    Route::post('/friends/{id}/accept', [FriendController::class, 'accept']);
    Route::delete('/friends/{id}', [FriendController::class, 'destroy']);
    Route::post('/friends/search', [FriendController::class, 'searchUsers']);

    // User endpoints (authenticated)
    Route::post('/user/follow', [FollowController::class, 'follow']);
    Route::post('/user/{id}/followed/status', [FollowController::class, 'followStatus']);
    Route::post('/user/{id}/followed', [FollowController::class, 'getFollowed']);
    Route::post('/user/{id}/followers', [FollowController::class, 'getFollowers']);
    Route::post('/user/{id}/guide_books', [UserController::class, 'guidebooks'])->whereNumber('id');
    Route::post('/user/{id}/visited_history', [VisitedShopController::class, 'getUserHistory']);

    // Restaurant endpoints (authenticated)
    Route::post('/restaurants/add-to-guide', [RestaurantController::class, 'addToGuide']);

    // Notification endpoints (authenticated)
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/mark-as-read', [NotificationController::class, 'markAsRead']);

    // Visited Shop History endpoints (authenticated)
    Route::post('/history/add', [VisitedShopController::class, 'store']);

    // GuideBook endpoints (authenticated)
    Route::post('/guidebooks', [GuideBookController::class, 'store']);
    Route::get('/guidebooks/{id}', [GuideBookController::class, 'show']);
    Route::put('/guidebooks/{id}', [GuideBookController::class, 'update']);
    Route::delete('/guidebooks/{id}', [GuideBookController::class, 'destroy']);

    // GuideBook Content endpoints (authenticated)
    Route::get('/guidebooks/{guidebookId}/contents', [GuideContentController::class, 'index']);
    Route::post('/guidebooks/{guidebookId}/contents', [GuideContentController::class, 'store']);
    Route::put('/guidebooks/{guidebookId}/contents/{contentId}', [GuideContentController::class, 'update']);
    Route::delete('/guidebooks/{guidebookId}/contents/{contentId}', [GuideContentController::class, 'destroy']);

});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});
