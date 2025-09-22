// components/LineChart.tsx
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
        margin={{ top: 20, right: 20, bottom: 60, left: 50 }}
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
        colors={['#22d3ee']}
        pointSize={10}
        pointColor={{ theme: 'background' }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        pointLabelYOffset={-12}
        useMesh={true}
        // --- SEÇÃO CORRIGIDA ---
        theme={{
          // A cor do texto agora está dentro do objeto 'text' usando a propriedade 'fill'
          text: {
            fill: '#e5e7eb',
          },
          axis: {
            domain: { line: { stroke: '#6b7280' } },
            ticks: { line: { stroke: '#6b7280' }, text: { fill: '#d1d5db' } },
            legend: { text: { fill: '#9ca3af' } },
          },
          grid: { line: { stroke: '#4b5563', strokeDasharray: '4 4' } },
          tooltip: { container: { background: '#1f2937', color: '#f9fafb' } },
        }}
        // -----------------------
      />
    </div>
  );
}