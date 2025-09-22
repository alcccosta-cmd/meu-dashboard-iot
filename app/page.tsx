// app/page.tsx
import Dashboard from "@/components/Dashboard";

export default function Home() {
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