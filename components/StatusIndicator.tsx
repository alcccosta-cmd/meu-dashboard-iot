// components/StatusIndicator.tsx
'use client';
import { MqttStatus } from "@/hooks/useMqtt";

interface StatusIndicatorProps {
  status: MqttStatus;
}

export default function StatusIndicator({ status }: StatusIndicatorProps) {
  const statusColor = {
    'Conectado': 'bg-green-500',
    'Conectando...': 'bg-yellow-500 animate-pulse',
    'Reconectando...': 'bg-yellow-500 animate-pulse',
    'Erro': 'bg-red-500',
    'Desconectado': 'bg-gray-500',
  };

  return (
    <div className="flex items-center gap-3 bg-gray-800/50 p-3 rounded-lg shadow-md">
      <div className={`w-4 h-4 rounded-full ${statusColor[status]}`}></div>
      <span className="font-medium text-white">{status}</span>
    </div>
  );
}