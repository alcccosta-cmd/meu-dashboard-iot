'use client';

import { useState, useEffect, useMemo } from 'react';
import { useMqtt, HistoryData } from '@/hooks/useMqtt';
import { formatReadingsForChart } from '@/utils/formatHistory';
import { calculateMovingAverage } from '@/utils/calculations';
import { SensorData } from '@/types';

import SensorCard from './SensorCard';
import LineChart from './LineChart';
import StatusIndicator from './StatusIndicator';
import RelayControlPanel from './RelayControlPanel';

const sensorConfig = {
  ph: { name: 'pH da Água', unit: '' },
  ec: { name: 'Condutividade (EC)', unit: 'µS/cm' },
  water_temp: { name: 'Temp. da Água', unit: '°C' },
  air_temp: { name: 'Temp. do Ar', unit: '°C' },
  humidity: { name: 'Umidade do Ar', unit: '%' },
};

const MOVING_AVERAGE_WINDOW = 5;

export default function Dashboard() {
  const [initialHistory, setInitialHistory] = useState<HistoryData | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    const fetchInitialHistory = async () => {
      try {
        const response = await fetch('/api/readings');
        if (!response.ok) {
          throw new Error(`API falhou com status: ${response.status}`);
        }
        const data = await response.json();
        const formattedData = formatReadingsForChart(data);
        setInitialHistory(formattedData);
      } catch (error) {
        console.error("Não foi possível carregar o histórico inicial:", error);
      }
      setIsLoadingHistory(false);
    };
    fetchInitialHistory();
  }, []);

  const { status, latestData, history, relayStatus } = useMqtt(initialHistory);
  
  const [selectedSensor, setSelectedSensor] = useState<keyof typeof sensorConfig>('ph');

  const chartData = useMemo(() => {
    if (!history || history.length === 0) return [];
    
    const sensorHistory = history.find(h => h.id === selectedSensor);
    if (!sensorHistory) return [];

    const rawData = {
      id: 'Leitura Instantânea',
      data: sensorHistory.data,
    };
    
    const averageData = {
      id: `Média Móvel`,
      data: calculateMovingAverage(sensorHistory.data, MOVING_AVERAGE_WINDOW),
    };

    return [rawData, averageData];
  }, [history, selectedSensor]);
  
  const latestAverages = useMemo(() => {
    const averages: { [key: string]: number | string } = {};
    if (!history || history.length === 0) return averages;

    history.forEach(sensorSeries => {
      const movingAverageData = calculateMovingAverage(sensorSeries.data, MOVING_AVERAGE_WINDOW);
      if (movingAverageData.length > 0) {
        averages[sensorSeries.id] = movingAverageData[movingAverageData.length - 1].y;
      }
    });
    return averages;
  }, [history]);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <StatusIndicator status={status} />
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {(Object.keys(sensorConfig) as Array<keyof typeof sensorConfig>).map((key) => {
          const displayValue = latestAverages[key] ?? latestData?.[key as keyof SensorData] ?? '--';
          return (
            <SensorCard
              key={key}
              title={sensorConfig[key].name}
              value={displayValue}
              unit={sensorConfig[key].unit}
              onClick={() => setSelectedSensor(key)}
              isSelected={selectedSensor === key}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-800/50 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-cyan-300">
            Histórico de {sensorConfig[selectedSensor].name}
          </h2>
          {isLoadingHistory ? (
            <div className="flex items-center justify-center h-full min-h-[300px]">
              <p className="text-gray-400">Carregando histórico de dados...</p>
            </div>
          ) : (
            (chartData.length > 0 && chartData[0].data.length > 0) ? (
              <LineChart data={chartData} />
            ) : (
              <div className="flex items-center justify-center h-full min-h-[300px]">
                <p className="text-gray-400">Aguardando dados para exibir o gráfico...</p>
              </div>
            )
          )}
        </div>
        <RelayControlPanel status={relayStatus} />
      </div>
    </div>
  );
}