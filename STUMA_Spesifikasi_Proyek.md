# Spesifikasi Proyek: STUMA (Stablecoin Trade for UMKM Advancement)

## 1. Konsep Utama
STUMA adalah platform e-commerce untuk UMKM Indonesia yang memfasilitasi transaksi menggunakan stablecoin USDT pada jaringan Layer 2 (Polygon dan Arbitrum). Platform ini bertujuan menekan biaya operasional pembayaran konvensional (MDR) dan biaya gas jaringan utama, sehingga memaksimalkan keuntungan pelaku UMKM.

## 2. Pedoman Desain UI/UX (Design System)
Antarmuka dirancang dengan tema gelap (Dark Mode) yang modern, bersih, dan profesional. Tampilan harus berfokus pada kemudahan penggunaan dan menghindari elemen visual yang berlebihan.

### Palet Warna
- Latar Belakang Utama (Background): Charcoal - Hex #1E1F22 | RGB(30, 31, 34)
- Warna Aksen Utama (Primary Button / Elemen Aktif): Neon Purple - Hex #7F56FF | RGB(127, 86, 255)
- Warna Sukses / Notifikasi (Success / Highlight): Lime Green - Hex #80FF56 | RGB(128, 255, 86)
- Warna Teks Utama (Typography): Putih (Off-White) - Hex #F3F4F6
- Warna Teks Sekunder (Muted): Abu-abu - Hex #9CA3AF

### Tipografi
- Header & Title: Plus Jakarta Sans atau Inter (Bold/Semi-bold).
- Body Text: Inter (Regular).

### Panduan Ikonografi
Implementasi ikon harus menggunakan pustaka vektor terstandarisasi seperti Lucide Icons atau Phosphor Icons. Hindari penggunaan aset ilustrasi generik atau emoji.
- Ikon Dompet Kripto: `wallet` (outline 1.5px, warna putih atau Neon Purple).
- Ikon Keranjang Belanja: `shopping-bag` (outline 1.5px).
- Ikon Verifikasi Sukses: `check-circle` (outline 1.5px, warna Lime Green).
- Ikon Riwayat Transaksi: `history` atau `receipt`.
- Ikon Dasbor UMKM: `layout-dashboard`.

## 3. Spesifikasi Teknis & Bahasa Pemrograman

### Backend (Logika Bisnis & API)
- Bahasa Pemrograman & Framework: PHP (Laravel). Sangat tangguh untuk menangani manajemen pesanan, relasi basis data, pembuatan REST API, dan aman untuk memproses webhook dari RPC Node (seperti Chainstack) guna memverifikasi status transaksi USDT secara otomatis.
- Basis Data: MySQL atau PostgreSQL.
- Message Broker: Kafka (untuk mengelola antrean pemrosesan webhook dari blockchain saat lalu lintas transaksi tinggi).

### Frontend Web (Antarmuka Pengguna & Dasbor Merchant)
- Bahasa Pemrograman & Framework: JavaScript / TypeScript (Next.js). Pustaka utama untuk integrasi dompet kripto (Wagmi, Viem) berjalan paling optimal di lingkungan React/Next.js untuk proses otorisasi dompet yang mulus.
- Styling: Tailwind CSS (diatur sesuai palet warna STUMA).

### Aplikasi Mobile (Opsional)
- Bahasa Pemrograman & Framework: Dart (Flutter). Memungkinkan interaksi langsung dengan smart contract melalui paket seperti web3dart. Dalam implementasinya, pastikan penggunaan kutipan string yang standar untuk format URL dan kehati-hatian dalam inisialisasi variabel bertipe dinamis saat mem-parsing data transaksi JSON dari blockchain.

### Infrastruktur Blockchain & Smart Contract
- Bahasa Pemrograman: Solidity. Digunakan untuk menulis fungsi penerimaan pembayaran USDT di jaringan EVM yang terikat dengan ID pesanan.
- Jaringan yang Didukung: Polygon (Chain ID: 137) dan Arbitrum One (Chain ID: 42161).
- RPC Node Provider: Chainstack.

## 4. Alur Transaksi (Payment Gateway Layer 2)
1. Checkout: Pembeli menyelesaikan proses belanja dan memilih metode pembayaran USDT (jaringan Polygon atau Arbitrum).
2. Konversi Real-Time: Backend mengambil harga produk dalam Rupiah dan mengonversinya ke nilai USDT secara real-time melalui API Oracle (seperti CoinGecko).
3. Estimasi Biaya Gas: Sistem frontend memanggil RPC Node untuk menampilkan estimasi gas fee Layer 2 saat itu (Dynamic Gas Estimation).
4. Otorisasi Pembayaran: Pembeli menandatangani transaksi (sign transaction) melalui dompet Web3 untuk mentransfer USDT ke smart contract STUMA.
5. Verifikasi Webhook: Setelah transaksi masuk ke dalam blok, Chainstack mengirimkan webhook ke server Laravel.
6. Pembaruan Status: Server memvalidasi hash transaksi. Jika sesuai, pesanan ditandai sebagai "Lunas" dan UI pembeli menampilkan notifikasi sukses dengan elemen berwarna Lime Green.

## 5. Fitur Fungsional Utama
- Konversi Otomatis Fiat ke Kripto: Katalog produk menampilkan harga dalam Rupiah, namun eksekusi tagihan di checkout otomatis dikonversi ke USDT.
- Sistem Penarikan (Withdrawal) UMKM: Penjual dapat mencairkan saldo USDT mereka di dasbor secara berkala (batching) untuk menghemat gas fee.
- Manajemen Produk & Pesanan: Modul CRUD standar untuk UMKM mengatur stok, deskripsi, dan melacak resi pengiriman.
- Pemantauan Anomali Transaksi: Modul backend yang otomatis menangguhkan pesanan jika mendeteksi perbedaan jumlah transfer USDT yang dikirimkan dengan total tagihan.
