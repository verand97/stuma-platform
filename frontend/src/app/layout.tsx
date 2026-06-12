import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "STUMA | Stablecoin Trade for UMKM Advancement",
  description: "Platform e-commerce UMKM Indonesia terintegrasi pembayaran stablecoin USDT di jaringan Layer 2 (Polygon & Arbitrum) untuk meminimalkan biaya transaksi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full dark antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-charcoal text-off-white">
        {children}
      </body>
    </html>
  );
}
