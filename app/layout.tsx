import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from 'next/link';
import { Toaster } from 'react-hot-toast';
import AuthProvider from "@/components/AuthProvider";
import AuthStatus from "@/components/AuthStatus"; // Importa o novo componente de status
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AquaSys IoT Dashboard",
  description: "Monitoramento e Automação de Cultivo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="bg-gray-900 text-gray-200">
      <body className={inter.className}>
        <AuthProvider>
          <Toaster 
            position="top-center"
            toastOptions={{
              style: {
                background: '#1f2937',
                color: '#e5e7eb',
                border: '1px solid #4b5563',
              },
              success: {
                iconTheme: { primary: '#22d3ee', secondary: '#1f2937' },
              },
              error: {
                  iconTheme: { primary: '#f43f5e', secondary: '#1f2937' },
              },
            }}
          />

          <header className="bg-gray-800/70 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-700">
            {/* A tag <nav> agora usa flexbox para alinhar os itens */}
            <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
              {/* Links de navegação à esquerda */}
              <div className="flex items-center gap-8">
                <Link href="/" className="text-white hover:text-cyan-400 transition-colors font-bold text-lg">
                  Dashboard
                </Link>
                <Link href="/automation" className="text-white hover:text-cyan-400 transition-colors font-semibold">
                  Automação
                </Link>
              </div>
              {/* Componente de status de autenticação à direita */}
              <div>
                <AuthStatus />
              </div>
            </nav>
          </header>

          <main>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}