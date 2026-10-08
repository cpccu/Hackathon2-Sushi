import type { Metadata } from 'next';
import './globals.css';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { AuthProvider } from '../context/AuthContext';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'campusOS — Campus Event Hub',
  description: 'Minimalist campus event & club administration platform. Fast registrations, eligibility check, and instant QR check-ins.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen flex-col bg-[#09090b] text-zinc-100 antialiased selection:bg-red-500 selection:text-white">
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
