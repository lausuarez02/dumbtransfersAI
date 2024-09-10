import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from '@vercel/analytics/react';
import Head from 'next/head';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Transactions",
  description: "Make natural language transactions.",
  icons: {
    icon: [
      { rel: 'icon', url: '/logo.png' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', url: '/logo.png' },
      { rel: 'icon', type: 'image/png', sizes: '16x16', url: '/logo.png' },
      { rel: 'icon', type: 'image/x-icon', sizes: '16x16', url: '/logo.png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <Head>
            <link rel="icon" href="/logo.png" />
            <title>Stock Management Software</title>
          </Head>
        {children}
      <Analytics />
      </body>
    </html>
  );
}
