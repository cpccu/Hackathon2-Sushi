import type { Metadata } from 'next';
import './globals.css';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import ScrollToTop from '../components/common/ScrollToTop';
import { AuthProvider } from '../context/AuthContext';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: {
    default: 'campusOS — City University',
    template: '%s | campusOS',
  },
  description: 'City University Campus Events, Information, and more.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen flex-col bg-[#09090b] text-zinc-100 antialiased selection:bg-red-500 selection:text-white">
        <ScrollToTop />
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#121214',
                borderColor: '#27272a',
                color: '#f4f4f5',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
