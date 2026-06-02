<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Page extends Model {
    protected $fillable = ['slug','title','hero_title','hero_subtitle','hero_image_path','content','meta_title','meta_description','is_active'];
    protected $casts = ['content' => 'array', 'is_active' => 'boolean'];
}
