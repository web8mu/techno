<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class HeroSlide extends Model {
    protected $fillable = ['title','subtitle','button_text','button_url','background_image_path','mobile_image_path','position','is_active'];
    protected $casts = ['is_active' => 'boolean'];
}
