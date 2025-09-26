'use client';

import { useEffect, useState, useRef } from 'react';
import mqtt, { MqttClient } from 'mqtt';
import { SensorData } from '@/types';

export type MqttStatus = 'Conectando...' | 'Conectado' | 'Erro' | 'Reconectando...' | 'Desconectado';
export type HistoryData = { id: string; data: { x: string; y: number }[] }[];
export interface RelayStatus { [key: string]: boolean; }

const MAX_HISTORY_LENGTH = 100;

export const useMqtt = (initialHistory: HistoryData | null) => {
  const [status, setStatus] = useState<MqttStatus>('Desconectado');
  const [latestData, setLatestData] = useState<SensorData | null>(null);
  const [history, setHistory] = useState<HistoryData>(initialHistory || []);
  const [relayStatus, setRelayStatus] = useState<RelayStatus | null>(null);
  const clientRef = useRef<MqttClient | null>(null);

  useEffect(() => {
    if (initialHistory) {
      setHistory(initialHistory);
    }
  }, [initialHistory]);

  useEffect(() => {
    if (clientRef.current) return;
    
    const brokerUrl = process.env.NEXT_PUBLIC_MQTT_BROKER_URL || '';
    const options: mqtt.IClientOptions = {
      username: process.env.NEXT_PUBLIC_MQTT_USERNAME,
      password: process.env.NEXT_PUBLIC_MQTT_PASSWORD,
      reconnectPeriod: 5000,
    };

    const client = mqtt.connect(brokerUrl, options);
    clientRef.current = client;

    client.on('connect', () => {
      setStatus('Conectado');
      const topics = [ 'aquasys/sensors/all', 'aquasys/relay/status' ];
      
      if (client.connected) {
        client.subscribe(topics, (err) => {
          if (err) {
            console.error('Erro ao se inscrever nos tópicos:', err);
          } else {
            console.log('Inscrito com sucesso nos tópicos:', topics);
          }
        });
      }
    });

    client.on('message', async (topic, payload) => {
      const message = payload.toString();
      try {
        const data = JSON.parse(message);
        
        if (topic === 'aquasys/relay/status') {
          setRelayStatus(data);
        } 
        else if (topic === 'aquasys/sensors/all') {
          const formattedMessage: SensorData = {
            ph: parseFloat(data.ph?.toFixed(2) || '0'),
            ec: parseFloat(data.ec?.toFixed(0) || '0'),
            air_temp: parseFloat(data.airTemp?.toFixed(2) || '0'),
            humidity: parseFloat(data.humidity?.toFixed(2) || '0'),
            water_temp: parseFloat(data.waterTemp?.toFixed(2) || '0'),
          };
          setLatestData(formattedMessage);
          
          try {
            const response = await fetch('/api/readings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(formattedMessage),
            });
            if (!response.ok) {
              console.error("API /api/readings retornou um erro:", response.statusText);
            }
          } catch (fetchError) {
            console.error("Fetch para /api/readings falhou:", fetchError);
          }

          const now = new Date();
          const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
          setHistory(prevHistory => 
            prevHistory.map(sensor => {
              const sensorKey = sensor.id as keyof SensorData;
              if (formattedMessage.hasOwnProperty(sensorKey)) {
                const newPoint = { x: timestamp, y: formattedMessage[sensorKey] };
                const newData = [...sensor.data, newPoint].slice(-MAX_HISTORY_LENGTH);
                return { ...sensor, data: newData };
              }
              return sensor;
            })
          );
        }
      } catch (error) { 
        console.error('Erro ao processar mensagem MQTT:', message, error); 
      }
    });

    client.on('reconnect', () => {
      setStatus('Reconectando...');
    });

    client.on('error', (err) => {
      console.error('Erro de conexão MQTT:', err);
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

  return { status, latestData, history, relayStatus };
};