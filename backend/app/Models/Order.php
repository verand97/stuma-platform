<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'id',
        'customer_address',
        'merchant_address',
        'total_price_idr',
        'total_price_usdt',
        'gas_fee_estimated',
        'status',
        'blockchain_network',
        'transaction_hash',
        'payment_method',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'total_price_idr' => 'decimal:2',
        'total_price_usdt' => 'decimal:6',
        'gas_fee_estimated' => 'decimal:6',
    ];

    /**
     * Get the anomaly logs associated with the order.
     */
    public function anomalyLogs()
    {
        return $this->hasMany(AnomalyLog::class);
    }
}
