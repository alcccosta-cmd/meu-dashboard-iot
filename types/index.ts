// types/index.ts

export interface SensorData {
  ph: number;
  ec: number;
  air_temp: number;   // Corrigido de airTemp para air_temp
  humidity: number;
  water_temp: number; // Corrigido de waterTemp para water_temp
}