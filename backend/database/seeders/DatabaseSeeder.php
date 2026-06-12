<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Product;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create a test user / merchant
        User::factory()->create([
            'name' => 'Aditya Pratama (Merchant)',
            'email' => 'aditya@stuma.id',
            'password' => bcrypt('password123'),
        ]);

        // Seed Indonesian UMKM products
        $products = [
            [
                'name' => 'Batik Tulis Solo Canting Mas',
                'description' => 'Batik tulis premium dengan motif sogan klasik khas Solo, dibuat 100% menggunakan malam dan canting tradisional.',
                'price_idr' => 350000.00,
                'stock' => 12,
                'image_url' => 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80',
            ],
            [
                'name' => 'Kopi Arabika Gayo Single Origin 250g',
                'description' => 'Kopi Arabika specialty dari dataran tinggi Gayo, Aceh. Proses wet hulled (giling basah) dengan note spicy, caramel, dan chocolatey.',
                'price_idr' => 850000.00 / 10, // 85,000 IDR
                'stock' => 50,
                'image_url' => 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80',
            ],
            [
                'name' => 'Sepatu Kulit Oxford Cibaduyut',
                'description' => 'Sepatu formal Oxford dari pengrajin kulit legendaris Cibaduyut, Bandung. Menggunakan kulit sapi asli dengan jaminan kenyamanan.',
                'price_idr' => 450000.00,
                'stock' => 8,
                'image_url' => 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=400&q=80',
            ],
            [
                'name' => 'Tas Anyaman Rotan Lombok',
                'description' => 'Tas bahu bundar bermotif etnik buatan tangan seniman Lombok, NTB. Sangat modis dan awet menggunakan rotan pilihan.',
                'price_idr' => 120000.00,
                'stock' => 15,
                'image_url' => 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=400&q=80',
            ],
            [
                'name' => 'Keripik Tempe Premium Rejeki (3 Pack)',
                'description' => 'Keripik tempe tipis gurih renyah tanpa bahan pengawet. Menggunakan kedelai non-GMO berkualitas tinggi.',
                'price_idr' => 45000.00,
                'stock' => 100,
                'image_url' => 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=400&q=80',
            ],
            [
                'name' => 'Madu Hutan Liar Sumbawa Asli 500ml',
                'description' => 'Madu murni organik yang dipanen langsung dari sarang lebah Apis Dorsata di hutan belantara Sumbawa. Kaya antioksidan.',
                'price_idr' => 165000.00,
                'stock' => 25,
                'image_url' => 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80',
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
