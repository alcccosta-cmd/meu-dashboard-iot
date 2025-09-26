// components/AuthStatus.tsx
'use client';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="text-gray-400">Carregando...</div>;
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-300">{session.user?.email}</span>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-1 px-3 rounded-md transition-colors"
        >
          Sair
        </button>
      </div>
    );
  }

  // Este botão não será muito usado, pois as páginas irão redirecionar, mas é bom tê-lo.
  return (
    <button
      onClick={() => signIn()}
      className="bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-bold py-1 px-3 rounded-md transition-colors"
    >
      Entrar
    </button>
  );
}