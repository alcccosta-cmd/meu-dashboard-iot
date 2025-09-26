// utils/formatHistory.ts

import { HistoryData } from "@/hooks/useMqtt";
import { SensorData } from "@/types";

// Tipo de dado que vem da nossa API /api/readings
interface ReadingFromDB {
  timestamp: string;
  ph: number;
  ec: number;
  air_temp: number;
  humidity: number;
  water_temp: number;
}

// Esta função converte os dados do banco para o formato que o gráfico Nivo entende
export const formatReadingsForChart = (readings: ReadingFromDB[]): HistoryData => {
  const history: HistoryData = [
    { id: 'ph', data: [] },
    { id: 'ec', data: [] },
    { id: 'air_temp', data: [] },
    { id: 'humidity', data: [] },
    { id: 'water_temp', data: [] },
  ];

  readings.forEach(reading => {
    const date = new Date(reading.timestamp);
    // Formata o timestamp para 'HH:MM' para melhor visualização
    const formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

    history[0].data.push({ x: formattedTime, y: reading.ph });
    history[1].data.push({ x: formattedTime, y: reading.ec });
    history[2].data.push({ x: formattedTime, y: reading.air_temp });
    history[3].data.push({ x: formattedTime, y: reading.humidity });
    history[4].data.push({ x: formattedTime, y: reading.water_temp });
  });

  return history;
};