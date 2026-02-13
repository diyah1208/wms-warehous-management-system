<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;

class UserModel extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, Notifiable;

    protected $table = 'users';
    protected $primaryKey = 'id';

    /**
     * ======================
     * MASS ASSIGNMENT
     * ======================
     */
    protected $fillable = [
        'nama',
        'email',
        'password',
        'role',
        'lokasi',

        // 🔥 STATUS BARU
        'approval_status',
        'is_active',
    ];

    /**
     * ======================
     * HIDDEN FIELD
     * ======================
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * ======================
     * CASTING
     * ======================
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_active' => 'boolean', // 🔥 penting biar FE dapat true/false
    ];
}