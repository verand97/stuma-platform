<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\AnomalyLog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    /**
     * Display a listing of orders.
     */
    public function index()
    {
        return response()->json(Order::orderBy('created_at', 'desc')->get());
    }

    /**
     * Get a specific order.
     */
    public function show($id)
    {
        $order = Order::find($id);
        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }
        return response()->json($order);
    }

    /**
     * Create a new order (Checkout).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'blockchain_network' => 'required|in:polygon,arbitrum',
            'payment_method' => 'required|in:custody,direct',
            'customer_address' => 'required|string',
        ]);

        // Calculate total IDR
        $totalPriceIdr = 0;
        foreach ($validated['items'] as $item) {
            $product = Product::find($item['product_id']);
            $totalPriceIdr += $product->price_idr * $item['quantity'];
            
            // Reduce stock (simple check)
            if ($product->stock < $item['quantity']) {
                return response()->json(['message' => "Stok untuk {$product->name} tidak mencukupi"], 400);
            }
            $product->decrement('stock', $item['quantity']);
        }

        // Get USDT/IDR exchange rate (fiat to crypto conversion)
        $usdtRate = $this->getUsdtRate();

        // Convert IDR to USDT (USDT has 6 decimals, but we store as decimal)
        $totalPriceUsdt = round($totalPriceIdr / $usdtRate, 6);

        // Estimate L2 Gas Fee (Polygon is cheaper than Arbitrum usually)
        // Polygon: ~0.003-0.008 USDT, Arbitrum: ~0.01-0.03 USDT
        $gasFeeEstimated = $validated['blockchain_network'] === 'polygon' 
            ? round(0.005 + (rand(1, 100) / 100000), 6)
            : round(0.015 + (rand(1, 100) / 50000), 6);

        // Establish merchant wallet address (hardcoded for the UMKM platform demo)
        $merchantAddress = '0x37c8D8Db16a9A1f87B64d6Bc1F4a1c5d809110B6';

        // Generate custom order ID
        $orderId = 'STUMA-' . strtoupper(Str::random(10));

        $order = Order::create([
            'id' => $orderId,
            'customer_address' => $validated['customer_address'],
            'merchant_address' => $merchantAddress,
            'total_price_idr' => $totalPriceIdr,
            'total_price_usdt' => $totalPriceUsdt,
            'gas_fee_estimated' => $gasFeeEstimated,
            'status' => 'pending',
            'blockchain_network' => $validated['blockchain_network'],
            'payment_method' => $validated['payment_method'],
        ]);

        return response()->json([
            'order' => $order,
            'usdt_rate' => $usdtRate,
        ], 201);
    }

    /**
     * Mock / Real webhook endpoint from Chainstack RPC Node.
     * When a payment transaction is written to the block, RPC node triggers this webhook.
     */
    public function blockchainWebhook(Request $request)
    {
        // Chainstack webhook payload structure
        // In production, we verify signatures/tokens sent in headers.
        $txHash = $request->input('tx_hash');
        $orderId = $request->input('order_id');
        $amountSentUsdt = $request->input('amount_usdt'); // Amount detected in blockchain transfer

        if (!$orderId || !$txHash) {
            return response()->json(['message' => 'Invalid webhook payload'], 400);
        }

        $order = Order::find($orderId);
        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        // Prevent processing paid orders
        if ($order->status === 'paid') {
            return response()->json(['message' => 'Order already processed'], 200);
        }

        // Update transaction hash
        $order->transaction_hash = $txHash;

        // Automated Anomaly Checking:
        // Suspend order if the transfer amount does not match the invoice amount.
        $expectedAmount = (float)$order->total_price_usdt;
        $actualAmount = (float)$amountSentUsdt;

        // Allowing a tiny precision margin (e.g. 0.0001) for rounding differences,
        // but anything larger is flagged as an anomaly.
        if (abs($expectedAmount - $actualAmount) > 0.00001) {
            $order->status = 'anomaly';
            $order->save();

            AnomalyLog::create([
                'order_id' => $order->id,
                'expected_amount_usdt' => $expectedAmount,
                'actual_amount_usdt' => $actualAmount,
                'transaction_hash' => $txHash,
                'status' => 'flagged',
                'notes' => 'Jumlah USDT yang ditransfer tidak sesuai dengan total tagihan. Potensi kecurangan/kesalahan modifikasi payload wallet.',
            ]);

            Log::warning("Transaction Anomaly Detected for Order {$order->id}. Expected: {$expectedAmount} USDT, Got: {$actualAmount} USDT.");

            return response()->json([
                'message' => 'Transaction flagged as ANOMALY. Order suspended.',
                'status' => 'anomaly'
            ], 200);
        }

        // Transaction is valid! Mark order as Paid
        $order->status = 'paid';
        $order->save();

        return response()->json([
            'message' => 'Payment successfully verified. Order marked as PAID.',
            'status' => 'paid'
        ], 200);
    }

    /**
     * Resolve an order anomaly manually (Admin action)
     */
    public function resolveAnomaly(Request $request, $id)
    {
        $order = Order::find($id);
        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $anomaly = AnomalyLog::where('order_id', $id)->where('status', 'flagged')->first();
        if (!$anomaly) {
            return response()->json(['message' => 'No active anomaly found for this order'], 404);
        }

        $action = $request->input('action'); // 'approve' or 'refund'
        if ($action === 'approve') {
            $order->status = 'paid';
            $order->save();
            
            $anomaly->status = 'resolved';
            $anomaly->notes .= ' | Disetujui secara manual oleh merchant.';
            $anomaly->save();

            return response()->json(['message' => 'Anomaly resolved. Order marked as paid.']);
        } else {
            $order->status = 'refunded';
            $order->save();

            $anomaly->status = 'resolved';
            $anomaly->notes .= ' | Pesanan dibatalkan dan direfund.';
            $anomaly->save();

            return response()->json(['message' => 'Anomaly resolved. Order cancelled.']);
        }
    }

    /**
     * Fetch USDT rate in IDR with fallback
     */
    private function getUsdtRate(): float
    {
        try {
            // Attempt to fetch price from CoinGecko API
            $response = Http::timeout(3)->get('https://api.coingecko.com/api/v3/simple/price', [
                'ids' => 'tether',
                'vs_currencies' => 'idr'
            ]);

            if ($response->successful() && isset($response->json()['tether']['idr'])) {
                return (float)$response->json()['tether']['idr'];
            }
        } catch (\Exception $e) {
            Log::info("CoinGecko API failed, using fallback rate. Error: " . $e->getMessage());
        }

        // Fallback exchange rate (1 USDT = ~16,400 IDR)
        return 16400.00;
    }
}
