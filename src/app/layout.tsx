import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "./providers";
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TikTok Clone",
  description: "A TikTok-style social media app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-black`}>
        <Providers>
          <AuthProvider> {/* Wrapping the existing Providers with AuthProvider */}
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
