<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class NewsletterSubscriber extends Model {
    protected $fillable = ['email','name','status','unsubscribe_token','subscribed_at'];
    protected $casts = ['subscribed_at' => 'datetime'];

    protected static function booted(): void {
        static::creating(function (self $model) {
            if (!$model->unsubscribe_token) {
                $model->unsubscribe_token = Str::random(64);
            }
            if (!$model->subscribed_at) {
                $model->subscribed_at = now();
            }
        });
    }
}
