<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Withdrawal extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'merchant_address',
        'amount_usdt',
        'gas_saved_usdt',
        'status',
        'transaction_hash',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount_usdt' => 'decimal:6',
        'gas_saved_usdt' => 'decimal:6',
    ];
}
