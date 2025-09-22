// hooks/useMqtt.ts
'use client';
import { useEffect, useState, useRef } from 'react';
import mqtt, { MqttClient } from 'mqtt';
import { SensorData } from '@/types';

export type MqttStatus = 'Conectando...' | 'Conectado' | 'Erro' | 'Reconectando...' | 'Desconectado';
export type HistoryData = {
  id: keyof SensorData;
  data: { x: string; y: number }[];
}[];

const MAX_HISTORY_LENGTH = 30;

export const useMqtt = () => {
  const [status, setStatus] = useState<MqttStatus>('Desconectado');
  const [latestData, setLatestData] = useState<SensorData | null>(null);
  const [history, setHistory] = useState<HistoryData>([
    { id: 'ph', data: [] }, { id: 'ec', data: [] },
    { id: 'airTemp', data: [] }, { id: 'humidity', data: [] },
    { id: 'waterTemp', data: [] },
  ]);
  const clientRef = useRef<MqttClient | null>(null);

  useEffect(() => {
    if (clientRef.current) return;

    const brokerUrl = process.env.NEXT_PUBLIC_MQTT_BROKER_URL || '';
    const options: mqtt.IClientOptions = {
      username: process.env.NEXT_PUBLIC_MQTT_USERNAME,
      password: process.env.NEXT_PUBLIC_MQTT_PASSWORD,
      reconnectPeriod: 5000,
    };

    setStatus('Conectando...');
    const client = mqtt.connect(brokerUrl, options);
    clientRef.current = client;

    client.on('connect', () => {
      setStatus('Conectado');
      const topic = process.env.NEXT_PUBLIC_MQTT_TOPIC || 'aquasys/sensors/all';
      client.subscribe(topic, (err) => {
        if (err) {
          console.error('Erro ao se inscrever:', err);
          setStatus('Erro');
        }
      });
    });

    client.on('message', (topic, payload) => {
      try {
        const message = JSON.parse(payload.toString()) as SensorData;
        const formattedMessage: SensorData = {
          ph: parseFloat(message.ph.toFixed(2)),
          ec: parseFloat(message.ec.toFixed(0)),
          airTemp: parseFloat(message.airTemp.toFixed(2)),
          humidity: parseFloat(message.humidity.toFixed(2)),
          waterTemp: parseFloat(message.waterTemp.toFixed(2)),
        };
        setLatestData(formattedMessage);

        const now = new Date();
        const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

        setHistory(prevHistory => prevHistory.map(sensor => {
          const newPoint = { x: timestamp, y: formattedMessage[sensor.id as keyof SensorData] };
          const newData = [...sensor.data, newPoint].slice(-MAX_HISTORY_LENGTH);
          return { ...sensor, data: newData };
        }));
      } catch (error) {
        console.error('Erro ao parsear JSON:', error);
      }
    });

    client.on('reconnect', () => setStatus('Reconectando...'));
    client.on('error', (err) => {
      console.error('Erro MQTT:', err);
      setStatus('Erro');
      client.end();
    });

    return () => {
      if (client) {
        client.end();
        clientRef.current = null;
      }
    };
  }, []);

  return { status, latestData, history };
};