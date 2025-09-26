'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import AutomationCard from '@/components/AutomationCard';
import toast from 'react-hot-toast';

// O tipo de dados que esperamos da nossa API
interface RelayConfig {
  relayIndex: number; mode: number; led_on_hour: number; led_off_hour: number;
  cycle_on_min: number; cycle_off_min: number; ph_pulse_sec: number;
  temp_threshold_on: number; temp_threshold_off: number;
  humidity_threshold_on: number; humidity_threshold_off: number;
  ec_threshold: number; ec_pulse_sec: number;
  ph_threshold_low: number; ph_threshold_high: number;
}

export default function AutomationPage() {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login');
    },
  });

  const [configs, setConfigs] = useState<RelayConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfigs = async () => {
      setIsLoading(true); setError(null);
      try {
        const response = await fetch('/api/relay-configs');
        if (!response.ok) { throw new Error(`Falha na resposta da rede: ${response.statusText}`); }
        const data = await response.json();
        if (Array.isArray(data)) { setConfigs(data); } 
        else { throw new Error("Os dados recebidos da API não são um array."); }
      } catch (error) { // <<< CORREÇÃO APLICADA AQUI
        console.error("Falha ao buscar configurações:", error);
        if (error instanceof Error) {
          setError(error.message); // Usa a mensagem do erro, de forma segura
        } else {
          setError("Ocorreu um erro desconhecido.");
        }
      }
      setIsLoading(false);
    };
    fetchConfigs();
  }, []);

  const handleSaveConfig = async (relayIndex: number, newConfig: Partial<RelayConfig>) => {
    const promise = fetch('/api/relay-configs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ relayIndex, config: newConfig }),
    });

    await toast.promise(promise, {
      loading: `Salvando configuração do Relé ${relayIndex + 1}...`,
      success: (response) => {
        if (!response.ok) { throw new Error('O servidor retornou um erro.'); }
        response.json().then(updatedConfig => {
          setConfigs(prevConfigs => 
            prevConfigs.map(c => c.relayIndex === relayIndex ? updatedConfig : c)
          );
        });
        return `Configuração do Relé ${relayIndex + 1} salva com sucesso!`;
      },
      error: `Falha ao salvar configuração do Relé ${relayIndex + 1}.`,
    });
  };
  
  if (status === "loading" || isLoading) {
    return <div className="text-center p-10">Carregando...</div>;
  }
  
  if (error) {
    return <div className="text-center p-10 text-red-500">Erro ao carregar configurações: {error}</div>;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-cyan-400">Configurações de Automação</h1>
        <p className="text-lg text-gray-400 mt-2">Defina os modos e parâmetros para cada um dos 8 relés.</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {configs.map(config => (
          <AutomationCard 
            key={config.relayIndex} 
            initialConfig={config} 
            onSave={handleSaveConfig} 
          />
        ))}
      </div>
    </main>
  );
}