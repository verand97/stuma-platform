<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Withdrawal;
use App\Models\AnomalyLog;
use App\Models\Product;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Get analytics statistics for the merchant dashboard.
     */
    public function index()
    {
        // Merchant address (hardcoded for demo)
        $merchantAddress = '0x37c8D8Db16a9A1f87B64d6Bc1F4a1c5d809110B6';

        // Revenue calculations
        $totalSalesIdr = Order::where('status', '!=', 'pending')->where('status', '!=', 'anomaly')->sum('total_price_idr');
        $totalSalesUsdt = Order::where('status', '!=', 'pending')->where('status', '!=', 'anomaly')->sum('total_price_usdt');

        // Total gas saved
        $totalGasSaved = Withdrawal::sum('gas_saved_usdt');

        // Balances
        // Funds currently held in the smart contract (status 'paid' and method 'custody')
        $availableWithdrawalUsdt = Order::where('merchant_address', $merchantAddress)
            ->where('status', 'paid')
            ->where('payment_method', 'custody')
            ->sum('total_price_usdt');

        // Count statuses
        $statusCounts = [
            'pending' => Order::where('status', 'pending')->count(),
            'paid' => Order::where('status', 'paid')->count(),
            'withdrawn' => Order::where('status', 'withdrawn')->count(),
            'anomaly' => Order::where('status', 'anomaly')->count(),
        ];

        // Fetch logs and history
        $recentOrders = Order::orderBy('created_at', 'desc')->take(6)->get();
        $recentAnomalies = AnomalyLog::with('order')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();
        $recentWithdrawals = Withdrawal::orderBy('created_at', 'desc')->take(5)->get();

        $productCount = Product::count();

        return response()->json([
            'metrics' => [
                'total_sales_idr' => $totalSalesIdr,
                'total_sales_usdt' => $totalSalesUsdt,
                'total_gas_saved_usdt' => $totalGasSaved,
                'available_withdrawal_usdt' => $availableWithdrawalUsdt,
                'product_count' => $productCount,
            ],
            'status_counts' => $statusCounts,
            'recent_orders' => $recentOrders,
            'recent_anomalies' => $recentAnomalies,
            'recent_withdrawals' => $recentWithdrawals,
        ]);
    }
}
