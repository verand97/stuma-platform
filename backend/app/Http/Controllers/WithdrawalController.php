<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Withdrawal;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class WithdrawalController extends Controller
{
    /**
     * Display a list of withdrawal histories.
     */
    public function index()
    {
        return response()->json(Withdrawal::orderBy('created_at', 'desc')->get());
    }

    /**
     * Create a new withdrawal (Batch Settlement).
     * Collects all 'paid' orders under 'custody' and settles them to the merchant.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'merchant_address' => 'required|string',
        ]);

        $merchantAddress = $validated['merchant_address'];

        // Fetch all orders that are 'paid', use 'custody' and haven't been settled (withdrawn)
        $orders = Order::where('merchant_address', $merchantAddress)
            ->where('status', 'paid')
            ->where('payment_method', 'custody')
            ->get();

        if ($orders->isEmpty()) {
            return response()->json([
                'message' => 'Tidak ada dana USDT yang tersedia untuk ditarik (sedang kosong atau sudah ditarik semua)'
            ], 400);
        }

        $totalAmount = $orders->sum('total_price_usdt');
        $orderCount = $orders->count();

        // Calculate gas saved:
        // Each separate transfer would cost a gas fee (approx 0.005 USDT for Polygon, 0.015 USDT for Arbitrum)
        // By batching, the merchant only performs 1 withdraw transaction instead of $N$ direct transfers.
        // Therefore, we save (N - 1) transactions worth of gas fee.
        $averageGasFee = 0.01; // 0.01 USDT average gas fee
        $gasSaved = ($orderCount - 1) * $averageGasFee;
        if ($gasSaved < 0) $gasSaved = 0.00;

        // Generate a mock withdrawal hash on Polygon or Arbitrum
        $txHash = '0x' . Str::random(64);

        // Create the withdrawal log
        $withdrawal = Withdrawal::create([
            'merchant_address' => $merchantAddress,
            'amount_usdt' => $totalAmount,
            'gas_saved_usdt' => $gasSaved,
            'status' => 'completed',
            'transaction_hash' => $txHash,
        ]);

        // Update the orders to 'withdrawn' status to prevent double withdrawal
        foreach ($orders as $order) {
            $order->status = 'withdrawn';
            $order->save();
        }

        return response()->json([
            'message' => 'Penarikan dana batch USDT berhasil diproses!',
            'withdrawal' => $withdrawal,
            'orders_settled' => $orderCount,
        ], 201);
    }
}
