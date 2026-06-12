<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnomalyLog extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'order_id',
        'expected_amount_usdt',
        'actual_amount_usdt',
        'transaction_hash',
        'status',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'expected_amount_usdt' => 'decimal:6',
        'actual_amount_usdt' => 'decimal:6',
    ];

    /**
     * Get the order associated with the anomaly log.
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
