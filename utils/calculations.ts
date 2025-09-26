// utils/calculations.ts

// Formato de um ponto de dado para o gráfico
type DataPoint = { x: string; y: number };

/**
 * Calcula a média móvel simples de uma série de dados.
 * @param data - Array de pontos de dados {x, y}.
 * @param windowSize - O número de pontos a serem incluídos na média.
 * @returns Um novo array de pontos de dados representando a média móvel.
 */
export const calculateMovingAverage = (data: DataPoint[], windowSize: number): DataPoint[] => {
  if (windowSize <= 0 || data.length < windowSize) {
    return []; // Retorna vazio se não houver dados suficientes
  }

  const movingAverageData: DataPoint[] = [];

  for (let i = windowSize - 1; i < data.length; i++) {
    // Pega a "janela" de dados para calcular a média
    const window = data.slice(i - windowSize + 1, i + 1);

    // Soma os valores 'y' na janela
    const sum = window.reduce((acc, point) => acc + point.y, 0);

    // Calcula a média e a adiciona ao resultado
    movingAverageData.push({
      x: data[i].x, // Usa o timestamp do último ponto da janela
      y: parseFloat((sum / windowSize).toFixed(2)), // Média com 2 casas decimais
    });
  }

  return movingAverageData;
};