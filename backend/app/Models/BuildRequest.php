<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BuildRequest extends Model
{
    protected $fillable = [
        'name',
        'email',
        'phone',
        'build_snapshot',
        'message',
        'status',
    ];

    protected $casts = [
        'build_snapshot' => 'array',
    ];
}
