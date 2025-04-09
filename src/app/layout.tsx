import './globals.css';
import { Inter } from 'next/font/google';
import Providers from './providers';
import NetworkStatusChecker from './network-status';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Sample Text',
  description: 'A Sample Text built with Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <Providers>{children}</Providers>
        <NetworkStatusChecker />
      </body>
    </html>
  );
}
