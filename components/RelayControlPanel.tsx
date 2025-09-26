'use client';

import { Switch } from '@headlessui/react';
import { LightBulbIcon, BeakerIcon, CpuChipIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import { RelayStatus } from '@/hooks/useMqtt';

// Mapeamento de configuração para cada relé
const relayConfig = [
  { name: 'Painel de LED', key: 'relay1_led', icon: LightBulbIcon },
  { name: 'Bombas de Circulação', key: 'relay2_pump', icon: ArrowsRightLeftIcon },
  { name: 'Regulador de pH', key: 'relay3_ph', icon: BeakerIcon },
  { name: 'Ventilador', key: 'relay4_fan', icon: CpuChipIcon },
];

interface RelayControlPanelProps {
  status: RelayStatus | null;
}

export default function RelayControlPanel({ status }: RelayControlPanelProps) {
  
  const handleToggle = async (relayIndex: number, enabled: boolean) => {
    const commandPayload = {
      command: enabled ? 'manual_override' : 'set_auto',
      payload: {
        relay: relayIndex + 1,
        state: enabled ? 'on' : 'off',
      }
    };
    try {
      await fetch('/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commandPayload)
      });
    } catch (error) {
      console.error("Falha ao enviar comando para o relé:", error);
    }
  };

  return (
    <div className="bg-gray-800/50 p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-cyan-300">Controle e Status dos Relés</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {relayConfig.map((relay, index) => {
          // Esta linha é a chave. Garante que 'isEnabled' seja recalculado toda vez que 'status' mudar.
          const isEnabled = status ? !!status[relay.key as keyof RelayStatus] : false;
          const Icon = relay.icon;

          return (
            <div key={relay.key} className="flex items-center justify-between bg-gray-700/50 p-3 rounded-md">
              <div className="flex items-center gap-3">
                <Icon className={`h-6 w-6 transition-colors ${isEnabled ? 'text-yellow-400' : 'text-gray-400'}`} />
                <span className="font-medium text-white">{relay.name}</span>
              </div>
              <Switch
                checked={isEnabled}
                onChange={(enabled) => handleToggle(index, enabled)}
                className={`${
                  isEnabled ? 'bg-cyan-500' : 'bg-gray-600'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              >
                <span className="sr-only">Controlar {relay.name}</span>
                <span
                  className={`${
                    isEnabled ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
            </div>
          );
        })}
      </div>
      {/* Adiciona uma nota de status para o usuário */}
      {!status && <p className="text-sm text-gray-400 mt-4">Aguardando status inicial dos relés...</p>}
    </div>
  );
}