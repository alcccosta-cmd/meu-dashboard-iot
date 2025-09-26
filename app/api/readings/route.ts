// app/api/readings/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { SensorData } from '@/types';

// --- FUNÇÃO GET: Para buscar as leituras (sem alterações) ---
export async function GET() {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const readings = await prisma.reading.findMany({
      where: {
        timestamp: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    return NextResponse.json(readings);
  } catch (error) {
    console.error("Erro ao buscar leituras:", error);
    return NextResponse.json({ error: 'Falha ao buscar dados' }, { status: 500 });
  }
}


// --- FUNÇÃO POST: Para salvar uma nova leitura (CORRIGIDA) ---
export async function POST(request: Request) {
  try {
    const body: SensorData = await request.json();

    const newReading = await prisma.reading.create({
      data: {
        ph: body.ph,
        ec: body.ec,
        air_temp: body.air_temp,   // Corrigido
        humidity: body.humidity,
        water_temp: body.water_temp, // Corrigido
      },
    });

    return NextResponse.json(newReading, { status: 201 });
  } catch (error) {
    console.error("Erro ao salvar leitura:", error);
    return NextResponse.json({ error: 'Falha ao salvar dados' }, { status: 500 });
  }
}