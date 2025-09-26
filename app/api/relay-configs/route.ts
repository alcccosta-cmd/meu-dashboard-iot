import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import mqtt from 'mqtt';

// --- FUNÇÃO GET: CORRIGIDA ---
export async function GET() {
  try {
    let configs = await prisma.relayConfig.findMany({
      orderBy: { relayIndex: 'asc' },
    });

    // Se o banco estiver vazio, cria as configurações padrão para os 8 relés
    if (configs.length === 0) {
      console.log("Nenhuma configuração encontrada, criando padrões...");
      
      // Objeto de dados padrão CORRIGIDO para incluir os novos campos
      const defaultConfigs = Array.from({ length: 8 }, (_, i) => ({
        relayIndex: i,
        mode: 0, // MODE_UNUSED
        led_on_hour: 6,
        led_off_hour: 0,
        cycle_on_min: 15,
        cycle_off_min: 15,
        ph_pulse_sec: 5,
        temp_threshold_on: 28.0,
        temp_threshold_off: 26.0,
        humidity_threshold_on: 75.0,
        humidity_threshold_off: 65.0,
        ec_threshold: 1200.0,
        ec_pulse_sec: 5,
        co2_threshold_on: 1000,
        co2_threshold_off: 800,
        ph_threshold_low: 5.8,   // <-- CORREÇÃO
        ph_threshold_high: 6.5,  // <-- CORREÇÃO
      }));

      // Atribui os modos padrão para os 4 primeiros relés
      defaultConfigs[0].mode = 1; // MODE_LED
      defaultConfigs[1].mode = 2; // MODE_CYCLE
      defaultConfigs[2].mode = 3; // MODE_PH_UP
      defaultConfigs[3].mode = 4; // MODE_TEMPERATURE
      
      await prisma.relayConfig.createMany({
        data: defaultConfigs,
      });
      configs = await prisma.relayConfig.findMany({
        orderBy: { relayIndex: 'asc' },
      });
    }

    return NextResponse.json(configs);
  } catch (error) {
    console.error("Erro ao buscar configurações dos relés:", error);
    return NextResponse.json({ error: 'Falha ao buscar dados no servidor' }, { status: 500 });
  }
}

// --- FUNÇÃO POST: (Sem alterações, mas incluída para o arquivo ficar completo) ---
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const updatedConfig = await prisma.relayConfig.update({
      where: { relayIndex: body.relayIndex },
      data: body.config,
    });
    console.log(`Configuração do Relé ${body.relayIndex + 1} salva no banco.`);

    const commandTopic = 'aquasys/relay/command';
    const commandPayload = {
      command: 'update_config',
      payload: {
        relay_index: body.relayIndex,
        config: body.config,
      },
    };

    const brokerUrl = process.env.MQTT_BROKER_URL_INTERNAL;
    const options: mqtt.IClientOptions = {
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
    };
    
    if(brokerUrl){
        const client = mqtt.connect(brokerUrl, options);
        client.on('connect', () => {
            client.publish(commandTopic, JSON.stringify(commandPayload), (err) => {
                if(err) console.error("Erro ao publicar comando MQTT:", err);
                else console.log("Comando de atualização enviado ao ESP32.");
                client.end();
            });
        });
    }

    return NextResponse.json(updatedConfig);
  } catch (error) {
    console.error("Erro ao atualizar configuração do relé:", error);
    return NextResponse.json({ error: 'Falha ao salvar dados no servidor' }, { status: 500 });
  }
}