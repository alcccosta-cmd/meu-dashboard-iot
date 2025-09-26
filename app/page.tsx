'use client'; // Esta página agora precisa ser um Componente de Cliente para usar hooks

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Dashboard from "@/components/Dashboard";

export default function Home() {
  // 1. Lógica de autenticação no topo da função
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      // Se o usuário não estiver autenticado, redireciona para a página de login
      redirect('/login');
    },
  });

  // 2. Mostra uma mensagem de "Carregando..." enquanto a sessão é verificada
  if (status === "loading") {
    return <p className="text-center p-10">Verificando autenticação...</p>;
  }

  // 3. Se o usuário estiver autenticado, renderiza o conteúdo normal da página
  return (
    <main className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-cyan-400">AquaSys IoT Dashboard</h1>
        <p className="text-lg text-gray-400 mt-2">Monitoramento Ambiental em Tempo Real</p>
      </header>
      <Dashboard />
    </main>
  );
}