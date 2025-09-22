// components/Dashboard.tsx
'use client';
import { useState } from 'react';
import { useMqtt } from '@/hooks/useMqtt';
import SensorCard from './SensorCard';
import LineChart from './LineChart';
import StatusIndicator from './StatusIndicator';
import { SensorData } from '@/types';

const sensorConfig = {
  ph: { name: 'pH da Água', unit: '' },
  ec: { name: 'Condutividade (EC)', unit: 'µS/cm' },
  waterTemp: { name: 'Temp. da Água', unit: '°C' },
  airTemp: { name: 'Temp. do Ar', unit: '°C' },
  humidity: { name: 'Umidade do Ar', unit: '%' },
};

export default function Dashboard() {
  const { status, latestData, history } = useMqtt();
  const [selectedSensor, setSelectedSensor] = useState<keyof SensorData>('ph');

  const selectedHistory = history.find(h => h.id === selectedSensor);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <StatusIndicator status={status} />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {latestData ? (
          (Object.keys(sensorConfig) as Array<keyof SensorData>).map((key) => (
            <SensorCard
              key={key}
              title={sensorConfig[key].name}
              value={latestData[key]}
              unit={sensorConfig[key].unit}
              onClick={() => setSelectedSensor(key)}
              isSelected={selectedSensor === key}
            />
          ))
        ) : (
          Array.from({ length: 5 }).map((_, i) => (
            <SensorCard key={i} title="Carregando..." value="--" unit="" />
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-800/50 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-cyan-300">
            Histórico de {sensorConfig[selectedSensor].name}
          </h2>
          {selectedHistory && <LineChart data={[selectedHistory]} />}
        </div>

        <div className="bg-gray-800/50 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-cyan-300">Controles e Alertas</h2>
          <div className="flex flex-col gap-4 text-gray-400">
            <p>Em breve:</p>
            <ul className="list-disc list-inside">
              <li>Acionamento de bombas</li>
              <li>Controle de válvulas</li>
              <li>Notificações de alerta</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}