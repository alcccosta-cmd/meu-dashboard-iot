'use client';
import { ResponsiveLine } from '@nivo/line';

interface LineChartProps {
  data: { id: string | number; data: { x: string; y: number }[] }[];
}

export default function LineChart({ data }: LineChartProps) {
  return (
    <div className="w-full h-full min-h-[250px] md:min-h-[350px]">
      <ResponsiveLine
        data={data}
        margin={{ top: 30, right: 20, bottom: 60, left: 50 }}
        xScale={{ type: 'point' }}
        yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45,
          legend: 'Tempo',
          legendOffset: 50,
          legendPosition: 'middle',
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Valor',
          legendOffset: -40,
          legendPosition: 'middle',
        }}
        colors={['#22d3ee', '#facc15']}
        
        // --- NOVAS ALTERAÇÕES PARA O VISUAL ---
        enablePoints={false}       // <-- MUDANÇA: Remove os pontos/círculos da linha
        lineWidth={3}              // <-- BÔNUS: Deixa a linha um pouco mais grossa
        curve="catmullRom"         // <-- MUDANÇA: Suaviza a curva de forma mais pronunciada
        enableArea={true}          // <-- BÔNUS: Adiciona uma área preenchida abaixo da linha
        areaOpacity={0.1}          // <-- BÔNUS: Deixa a área bem sutil
        // ------------------------------------
        
        useMesh={true}
        legends={[
            {
                anchor: 'top-left',
                direction: 'row',
                justify: false,
                translateX: 0,
                translateY: -25, // Ajustado para o novo margin.top
                itemsSpacing: 0,
                itemDirection: 'left-to-right',
                itemWidth: 140,
                itemHeight: 20,
                itemOpacity: 0.85,
                symbolSize: 12,
                symbolShape: 'circle',
                symbolBorderColor: 'rgba(0, 0, 0, .5)',
            }
        ]}
        theme={{
          // ... (o tema permanece o mesmo)
          textColor: '#e5e7eb',
          axis: {
            domain: { line: { stroke: '#6b7280' } },
            ticks: { line: { stroke: '#6b7280' }, text: { fill: '#d1d5db' } },
            legend: { text: { fill: '#9ca3af' } },
          },
          grid: { line: { stroke: '#4b5563', strokeDasharray: '4 4' } },
          tooltip: { container: { background: '#1f2937', color: '#f9fafb' } },
          legends: { text: { fill: '#e5e7eb' } },
        }}
      />
    </div>
  );
}