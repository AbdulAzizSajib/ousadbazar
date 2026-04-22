import { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { QueryProviders } from '@/components/QueryProviders';
import { ClientLayout } from '@/components/ClientLayout';
import './globals.css';
import ScrollToTop from '@/components/ScrollToTop';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'OusadBazar - Pharma Ecommerce',
    template: '%s',
  },
  description: 'Buy medicines online',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/ousadbazar/fav.svg" />
      </head>
      <body className={`${poppins.className} bg-[#f9fafb]`}>
        <QueryProviders>
          <ClientLayout>
            {children}
            <ScrollToTop />
          </ClientLayout>
        </QueryProviders>
      </body>
    </html>
  );
}
