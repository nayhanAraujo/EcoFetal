import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function ZScoreCalculator() {
  const [estrutura, setEstrutura] = useState('aortica');
  const [medida, setMedida] = useState('');
  const [idadeGestacional, setIdadeGestacional] = useState('');
  const [comprimentoFemur, setComprimentoFemur] = useState('');
  const [resultado, setResultado] = useState(null);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const calcularZScore = (estrutura, medida, ig, femur) => {
    let media, desvioPadrao;

    // Equações de Schneider et al. (2005)
    switch (estrutura) {
      case 'aortica':
        media = -2.263 + 0.219 * ig;
        desvioPadrao = 0.075 + 0.013 * ig;
        break;
      case 'mitral':
        media = -3.123 + 0.287 * ig;
        desvioPadrao = 0.092 + 0.015 * ig;
        break;
      case 'ventriculoEsquerdo':
        media = -2.745 + 0.347 * ig;
        desvioPadrao = 0.108 + 0.017 * ig;
        break;
      case 'tricuspide':
        media = -3.456 + 0.305 * ig;
        desvioPadrao = 0.100 + 0.016 * ig;
        break;
      case 'pulmonar':
        media = -2.451 + 0.227 * ig;
        desvioPadrao = 0.080 + 0.014 * ig;
        break;
      case 'aortaAscendente':
        media = -2.894 + 0.236 * ig;
        desvioPadrao = 0.085 + 0.013 * ig;
        break;
      default:
        return null;
    }

    // Ajuste opcional por comprimento do fêmur (simplificado, baseado em Pasquini et al.)
    if (femur) {
      const ajusteFemur = 0.01 * femur; // Ajuste hipotético (consultar Pasquini et al. para precisão)
      media += ajusteFemur;
    }

    const z = (medida - media) / desvioPadrao;
    let interpretacao = 'Z-Score dentro do intervalo normal.';
    let cor = 'text-green-600';
    if (Math.abs(z) > 2) {
      interpretacao = 'Atenção: Z-Score fora do intervalo normal. Consulte um cardiologista fetal.';
      cor = 'text-red-600';
    } else if (Math.abs(z) > 1.5) {
      interpretacao = 'Z-Score próximo do limite. Avaliação adicional recomendada.';
      cor = 'text-yellow-600';
    }

    return {
      zScore: z.toFixed(2),
      interpretacao,
      media: media.toFixed(2),
      desvioPadrao: desvioPadrao.toFixed(2),
      cor,
    };
  };

  const criarGrafico = (zScore) => {
    // Verificar se o canvas existe
    if (!chartRef.current) {
      console.error('Canvas não encontrado');
      return;
    }

    // Destruir gráfico anterior, se existir
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Z-Score'],
        datasets: [{
          label: 'Z-Score Calculado',
          data: [zScore],
          backgroundColor: Math.abs(zScore) > 2 ? 'rgba(239, 68, 68, 0.7)' : Math.abs(zScore) > 1.5 ? 'rgba(245, 158, 11, 0.7)' : 'rgba(34, 197, 94, 0.7)',
          borderColor: Math.abs(zScore) > 2 ? 'rgb(239, 68, 68)' : Math.abs(zScore) > 1.5 ? 'rgb(245, 158, 11)' : 'rgb(34, 197, 94)',
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',
        scales: {
          x: {
            min: -3,
            max: 3,
            ticks: { stepSize: 1 },
            title: { display: true, text: 'Z-Score' }
          },
          y: { display: false }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `Z-Score: ${context.raw}`
            }
          },
          annotation: {
            annotations: {
              normal: {
                type: 'box',
                xMin: -2,
                xMax: 2,
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                borderWidth: 0
              }
            }
          }
        }
      }
    });
  };

  const handleCalcular = () => {
    const ig = parseFloat(idadeGestacional);
    const m = parseFloat(medida);
    if (!m || !ig || ig < 18 || ig > 34) {
      setResultado({
        erro: 'Por favor, insira valores válidos. Idade gestacional deve estar entre 18 e 34 semanas.'
      });
      return;
    }
    const resultado = calcularZScore(estrutura, m, ig, comprimentoFemur ? parseFloat(comprimentoFemur) : null);
    setResultado(resultado);
  };

  // Criar gráfico após atualização do resultado
  useEffect(() => {
    if (resultado && !resultado.erro && chartRef.current) {
      criarGrafico(parseFloat(resultado.zScore));
    }
  }, [resultado]);

  // Limpar gráfico ao desmontar ou mudar estrutura
  useEffect(() => {
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="container max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-blue-800 mb-6">
          Calculadora de Z-Score para Ecocardiograma Fetal
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Estrutura Cardíaca</label>
              <select
                value={estrutura}
                onChange={(e) => setEstrutura(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="aortica">Válvula Aórtica</option>
                <option value="mitral">Válvula Mitral</option>
                <option value="ventriculoEsquerdo">Ventrículo Esquerdo</option>
                <option value="tricuspide">Válvula Tricúspide</option>
                <option value="pulmonar">Válvula Pulmonar</option>
                <option value="aortaAscendente">Aorta Ascendente</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Medida Observada (mm)</label>
              <input
                type="number"
                step="0.1"
                value={medida}
                onChange={(e) => setMedida(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex.: 4.5"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Idade Gestacional (semanas)</label>
              <input
                type="number"
                step="0.1"
                value={idadeGestacional}
                onChange={(e) => setIdadeGestacional(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex.: 24"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Comprimento do Fêmur (mm, opcional)</label>
              <input
                type="number"
                step="0.1"
                value={comprimentoFemur}
                onChange={(e) => setComprimentoFemur(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex.: 45"
              />
            </div>

            <button
              onClick={handleCalcular}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Calcular Z-Score
            </button>
          </div>

          {/* Resultados e Gráfico */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            {resultado ? (
              resultado.erro ? (
                <p className="text-red-600">{resultado.erro}</p>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800">Resultados</h2>
                  <p><strong>Z-Score:</strong> <span className={resultado.cor}>{resultado.zScore}</span></p>
                  <p><strong>Interpretação:</strong> <span className={resultado.cor}>{resultado.interpretacao}</span></p>
                  <p><strong>Média Esperada:</strong> {resultado.media} mm</p>
                  <p><strong>Desvio Padrão:</strong> {resultado.desvioPadrao} mm</p>
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Visualização do Z-Score</h3>
                    <canvas ref={chartRef} className="max-h-40"></canvas>
                  </div>
                </div>
              )
            ) : (
              <p className="text-gray-600">Insira os dados e clique em "Calcular" para ver os resultados.</p>
            )}
          </div>
        </div>

        <p className="mt-6 text-sm text-gray-600 text-center">
          Esta ferramenta é informativa e não substitui a avaliação de um médico. Baseado em Schneider et al. (2005) e Pasquini et al. (2007).
        </p>
      </div>
    </div>
  );
}