// components/SensorCard.tsx
'use client';
interface SensorCardProps {
  title: string;
  value: number | string;
  unit: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function SensorCard({ title, value, unit, isSelected = false, onClick }: SensorCardProps) {
  const selectedClasses = isSelected ? 'ring-2 ring-cyan-400' : 'ring-1 ring-gray-700';

  return (
    <div
      onClick={onClick}
      className={`flex flex-col justify-between p-4 bg-gray-800/50 rounded-lg shadow-lg cursor-pointer transition-all duration-300 hover:bg-gray-700/60 ${selectedClasses}`}
    >
      <h3 className="text-sm font-medium text-gray-300">{title}</h3>
      <p className="text-3xl font-bold text-white mt-2">
        {value} <span className="text-xl text-gray-400">{unit}</span>
      </p>
    </div>
  );
}