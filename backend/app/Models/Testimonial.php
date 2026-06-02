<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Testimonial extends Model {
    protected $fillable = ['author_name','role_company','content','avatar_path','rating','is_active','position'];
    protected $casts = ['is_active' => 'boolean', 'rating' => 'integer'];
}
