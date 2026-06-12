<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->string('id')->primary(); // Order UUID or custom receipt code
            $table->string('customer_address')->nullable();
            $table->string('merchant_address');
            $table->decimal('total_price_idr', 12, 2);
            $table->decimal('total_price_usdt', 16, 6);
            $table->decimal('gas_fee_estimated', 16, 6)->nullable();
            $table->string('status')->default('pending'); // pending, paid, anomaly, processing
            $table->string('blockchain_network'); // polygon, arbitrum
            $table->string('transaction_hash')->nullable();
            $table->string('payment_method')->default('custody'); // custody, direct
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
