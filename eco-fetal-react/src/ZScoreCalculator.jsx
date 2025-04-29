import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function ZScoreCalculator() {
  const [metrica, setMetrica] = useState('zScore');
  const [estrutura, setEstrutura] = useState('aortica');
  const [medida, setMedida] = useState('');
  const [idadeGestacional, setIdadeGestacional] = useState('');
  const [comprimentoFemur, setComprimentoFemur] = useState('');
  const [ictEsquerdo, setIctEsquerdo] = useState('');
  const [irtEsquerdo, setIrtEsquerdo] = useState('');
  const [etEsquerdo, setEtEsquerdo] = useState('');
  const [ictDireito, setIctDireito] = useState('');
  const [irtDireito, setIrtDireito] = useState('');
  const [etDireito, setEtDireito] = useState('');
  const [diastolicoEsquerdo, setDiastolicoEsquerdo] = useState('');
  const [sistolicoEsquerdo, setSistolicoEsquerdo] = useState('');
  const [diastolicoDireito, setDiastolicoDireito] = useState('');
  const [sistolicoDireito, setSistolicoDireito] = useState('');
  const [tapse, setTapse] = useState('');
  const [mapse, setMapse] = useState('');
  const [resultado, setResultado] = useState(null);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // Lista de idades gestacionais para o dropdown
  const idadesGestacionais = Array.from({ length: 17 }, (_, i) => 18 + i);

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
      case 'ventriculoDireito':
        media = -3.145 + 0.352 * ig;
        desvioPadrao = 0.110 + 0.018 * ig;
        break;
      case 'atrioEsquerdo':
        media = -2.987 + 0.294 * ig;
        desvioPadrao = 0.095 + 0.016 * ig;
        break;
      case 'atrioDireito':
        media = -3.234 + 0.301 * ig;
        desvioPadrao = 0.098 + 0.017 * ig;
        break;
      case 'arcoAortico':
        media = -2.576 + 0.211 * ig;
        desvioPadrao = 0.070 + 0.012 * ig;
        break;
      case 'arteriaPulmonar':
        media = -2.678 + 0.233 * ig;
        desvioPadrao = 0.082 + 0.014 * ig;
        break;
      case 'ductoArterioso':
        media = -1.987 + 0.176 * ig;
        desvioPadrao = 0.065 + 0.011 * ig;
        break;
      default:
        return null;
    }

    // Ajuste opcional por comprimento do fêmur (simplificado, baseado em Pasquini et al.)
    if (femur) {
      const ajusteFemur = 0.01 * femur;
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

  const calcularModMPI = (ict, irt, et, ventrículo) => {
    if (!ict || !irt || !et || ict <= 0 || irt <= 0 || et <= 0) {
      return { erro: 'Por favor, insira valores válidos para ICT, IRT e ET.' };
    }

    const mpi = (ict + irt) / et;
    let interpretacao = ventrículo === 'esquerdo'
      ? mpi <= 0.45 ? 'Mod-MPI normal.' : 'Mod-MPI elevado. Avaliação adicional recomendada.'
      : mpi <= 0.50 ? 'Mod-MPI normal.' : 'Mod-MPI elevado. Avaliação adicional recomendada.';
    const cor = mpi <= (ventrículo === 'esquerdo' ? 0.45 : 0.50) ? 'text-green-600' : 'text-red-600';

    return {
      mpi: mpi.toFixed(2),
      interpretacao,
      cor,
    };
  };

  const calcularFS = (diastolico, sistolico, ventrículo) => {
    if (!diastolico || !sistolico || diastolico <= 0 || sistolico <= 0 || sistolico >= diastolico) {
      return { erro: 'Por favor, insira valores válidos. Diâmetro diastólico deve ser maior que sistólico.' };
    }

    const fs = ((diastolico - sistolico) / diastolico) * 100;
    let interpretacao = fs >= 28 && fs <= 40 ? 'Fração de encurtamento normal.' : 'Fração de encurtamento anormal. Avaliação adicional recomendada.';
    const cor = fs >= 28 && fs <= 40 ? 'text-green-600' : 'text-red-600';

    return {
      fs: fs.toFixed(1),
      interpretacao,
      cor,
    };
  };

  const calcularExcursao = (deslocamento, tipo, ig) => {
    if (!deslocamento || deslocamento <= 0) {
      return { erro: `Por favor, insira um valor válido para ${tipo}.` };
    }

    // Estimativa de valores normais (baseado em médias aproximadas para o segundo trimestre)
    const normalMin = ig < 24 ? 4 : 5; // Ajuste simplificado
    const normalMax = ig < 24 ? 6 : 8;
    let interpretacao = deslocamento >= normalMin && deslocamento <= normalMax
      ? `${tipo} normal para ${ig} semanas.`
      : `${tipo} fora do intervalo esperado. Avaliação adicional recomendada.`;
    const cor = deslocamento >= normalMin && deslocamento <= normalMax ? 'text-green-600' : 'text-red-600';

    return {
      deslocamento: deslocamento.toFixed(1),
      interpretacao,
      cor,
    };
  };

  const criarGrafico = (zScore) => {
    if (!chartRef.current) {
      console.error('Canvas não encontrado');
      return;
    }

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [zScore],
        datasets: [{
          label: 'Z-Score Calculado',
          data: [{ x: zScore, y: 0 }],
          backgroundColor: Math.abs(zScore) > 2 ? 'rgba(239, 68, 68, 0.7)' : Math.abs(zScore) > 1.5 ? 'rgba(245, 158, 11, 0.7)' : 'rgba(34, 197, 94, 0.7)',
          borderColor: Math.abs(zScore) > 2 ? 'rgb(239, 68, 68)' : Math.abs(zScore) > 1.5 ? 'rgb(245, 158, 11)' : 'rgb(34, 197, 94)',
          pointRadius: 8,
          pointHoverRadius: 10,
          showLine: false
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            type: 'linear',
            min: -3,
            max: 3,
            ticks: {
              stepSize: 0.5,
              callback: (value) => value.toFixed(1)
            },
            title: {
              display: true,
              text: 'Z-Score'
            }
          },
          y: {
            display: false
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: () => `Z-Score: ${zScore}`
            }
          },
          annotation: {
            annotations: {
              normal: {
                type: 'box',
                xMin: -2,
                xMax: 2,
                yMin: -1,
                yMax: 1,
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                borderWidth: 0
              },
              warning: [
                {
                  type: 'box',
                  xMin: -2,
                  xMax: -1.5,
                  yMin: -1,
                  yMax: 1,
                  backgroundColor: 'rgba(245, 158, 11, 0.2)',
                  borderWidth: 0
                },
                {
                  type: 'box',
                  xMin: 1.5,
                  xMax: 2,
                  yMin: -1,
                  yMax: 1,
                  backgroundColor: 'rgba(245, 158, 11, 0.2)',
                  borderWidth: 0
                }
              ],
              abnormal: [
                {
                  type: 'box',
                  xMin: -3,
                  xMax: -2,
                  yMin: -1,
                  yMax: 1,
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                  borderWidth: 0
                },
                {
                  type: 'box',
                  xMin: 2,
                  xMax: 3,
                  yMin: -1,
                  yMax: 1,
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                  borderWidth: 0
                }
              ],
              label: {
                type: 'label',
                xValue: zScore,
                yValue: 0.2,
                content: `Z-Score: ${zScore}`,
                font: { size: 12 },
                color: Math.abs(zScore) > 2 ? 'rgb(239, 68, 68)' : Math.abs(zScore) > 1.5 ? 'rgb(245, 158, 11)' : 'rgb(34, 197, 94)'
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

    if (metrica === 'zScore') {
      if (!m || !ig || ig < 18 || ig > 34) {
        setResultado({
          erro: 'Por favor, insira valores válidos. Idade gestacional deve estar entre 18 e 34 semanas.'
        });
        return;
      }
      const resultado = calcularZScore(estrutura, m, ig, comprimentoFemur ? parseFloat(comprimentoFemur) : null);
      setResultado(resultado);
    } else if (metrica === 'modMPI') {
      const resultadoEsquerdo = ictEsquerdo && irtEsquerdo && etEsquerdo
        ? calcularModMPI(parseFloat(ictEsquerdo), parseFloat(irtEsquerdo), parseFloat(etEsquerdo), 'esquerdo')
        : null;
      const resultadoDireito = ictDireito && irtDireito && etDireito
        ? calcularModMPI(parseFloat(ictDireito), parseFloat(irtDireito), parseFloat(etDireito), 'direito')
        : null;
      if (!resultadoEsquerdo && !resultadoDireito) {
        setResultado({ erro: 'Por favor, insira pelo menos os valores para um ventrículo.' });
        return;
      }
      setResultado({ esquerdo: resultadoEsquerdo, direito: resultadoDireito });
    } else if (metrica === 'fs') {
      const resultadoEsquerdo = diastolicoEsquerdo && sistolicoEsquerdo
        ? calcularFS(parseFloat(diastolicoEsquerdo), parseFloat(sistolicoEsquerdo), 'esquerdo')
        : null;
      const resultadoDireito = diastolicoDireito && sistolicoDireito
        ? calcularFS(parseFloat(diastolicoDireito), parseFloat(sistolicoDireito), 'direito')
        : null;
      if (!resultadoEsquerdo && !resultadoDireito) {
        setResultado({ erro: 'Por favor, insira pelo menos os valores para um ventrículo.' });
        return;
      }
      setResultado({ esquerdo: resultadoEsquerdo, direito: resultadoDireito });
    } else if (metrica === 'excursao') {
      const resultadoTapse = tapse ? calcularExcursao(parseFloat(tapse), 'TAPSE', ig) : null;
      const resultadoMapse = mapse ? calcularExcursao(parseFloat(mapse), 'MAPSE', ig) : null;
      if (!resultadoTapse && !resultadoMapse) {
        setResultado({ erro: 'Por favor, insira pelo menos um valor para TAPSE ou MAPSE.' });
        return;
      }
      if (!ig || ig < 18 || ig > 34) {
        setResultado({ erro: 'Por favor, selecione uma idade gestacional válida.' });
        return;
      }
      setResultado({ tapse: resultadoTapse, mapse: resultadoMapse });
    }
  };

  useEffect(() => {
    if (metrica === 'zScore' && resultado && !resultado.erro && chartRef.current) {
      criarGrafico(parseFloat(resultado.zScore));
    }
  }, [resultado, metrica]);

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
          Calculadora de Z-Score e Função Cardíaca Fetal
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Tipo de Métrica</label>
              <select
                value={metrica}
                onChange={(e) => setMetrica(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="zScore">Z-Score (Anatômico)</option>
                <option value="modMPI">Mod-MPI (Função)</option>
                <option value="fs">Fração de Encurtamento (FS)</option>
                <option value="excursao">Excursão do Plano Anular (TAPSE/MAPSE)</option>
              </select>
            </div>

            {metrica === 'zScore' && (
              <>
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
                    <option value="ventriculoDireito">Ventrículo Direito</option>
                    <option value="atrioEsquerdo">Átrio Esquerdo</option>
                    <option value="atrioDireito">Átrio Direito</option>
                    <option value="arcoAortico">Arco Aórtico</option>
                    <option value="arteriaPulmonar">Artéria Pulmonar Principal</option>
                    <option value="ductoArterioso">Ducto Arterioso</option>
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
              </>
            )}

            {(metrica === 'zScore' || metrica === 'excursao') && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Idade Gestacional (semanas)</label>
                <select
                  value={idadeGestacional}
                  onChange={(e) => setIdadeGestacional(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" disabled>Selecione</option>
                  {idadesGestacionais.map((idade) => (
                    <option key={idade} value={idade}>
                      {idade} semanas
                    </option>
                  ))}
                </select>
              </div>
            )}

            {metrica === 'zScore' && (
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
            )}

            {metrica === 'modMPI' && (
              <>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700">Ventrículo Esquerdo</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700">ICT (ms)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={ictEsquerdo}
                        onChange={(e) => setIctEsquerdo(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex.: 30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">IRT (ms)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={irtEsquerdo}
                        onChange={(e) => setIrtEsquerdo(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex.: 40"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">ET (ms)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={etEsquerdo}
                        onChange={(e) => setEtEsquerdo(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex.: 180"
                      />
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700">Ventrículo Direito</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700">ICT (ms)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={ictDireito}
                        onChange={(e) => setIctDireito(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex.: 35"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">IRT (ms)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={irtDireito}
                        onChange={(e) => setIrtDireito(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex.: 45"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">ET (ms)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={etDireito}
                        onChange={(e) => setEtDireito(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex.: 175"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {metrica === 'fs' && (
              <>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700">Ventrículo Esquerdo</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Diâmetro Diastólico (mm)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={diastolicoEsquerdo}
                        onChange={(e) => setDiastolicoEsquerdo(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex.: 10"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Diâmetro Sistólico (mm)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={sistolicoEsquerdo}
                        onChange={(e) => setSistolicoEsquerdo(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex.: 7"
                      />
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700">Ventrículo Direito</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Diâmetro Diastólico (mm)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={diastolicoDireito}
                        onChange={(e) => setDiastolicoDireito(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex.: 11"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Diâmetro Sistólico (mm)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={sistolicoDireito}
                        onChange={(e) => setSistolicoDireito(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex.: 8"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {metrica === 'excursao' && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700">Excursão do Plano Anular</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">TAPSE (mm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={tapse}
                      onChange={(e) => setTapse(e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex.: 5.2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">MAPSE (mm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={mapse}
                      onChange={(e) => setMapse(e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex.: 4.8"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleCalcular}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Calcular
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
                  {metrica === 'zScore' && (
                    <>
                      <p><strong>Z-Score:</strong> <span className={resultado.cor}>{resultado.zScore}</span></p>
                      <p><strong>Interpretação:</strong> <span className={resultado.cor}>{resultado.interpretacao}</span></p>
                      <p><strong>Média Esperada:</strong> {resultado.media} mm</p>
                      <p><strong>Desvio Padrão:</strong> {resultado.desvioPadrao} mm</p>
                      <div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Visualização do Z-Score</h3>
                        <canvas ref={chartRef} className="max-h-48"></canvas>
                      </div>
                    </>
                  )}
                  {metrica === 'modMPI' && (
                    <>
                      {resultado.esquerdo && (
                        <>
                          <p><strong>Mod-MPI (Ventrículo Esquerdo):</strong> <span className={resultado.esquerdo.cor}>{resultado.esquerdo.mpi}</span></p>
                          <p><strong>Interpretação:</strong> <span className={resultado.esquerdo.cor}>{resultado.esquerdo.interpretacao}</span></p>
                        </>
                      )}
                      {resultado.direito && (
                        <>
                          <p><strong>Mod-MPI (Ventrículo Direito):</strong> <span className={resultado.direito.cor}>{resultado.direito.mpi}</span></p>
                          <p><strong>Interpretação:</strong> <span className={resultado.direito.cor}>{resultado.direito.interpretacao}</span></p>
                        </>
                      )}
                    </>
                  )}
                  {metrica === 'fs' && (
                    <>
                      {resultado.esquerdo && (
                        <>
                          <p><strong>FS (Ventrículo Esquerdo):</strong> <span className={resultado.esquerdo.cor}>{resultado.esquerdo.fs}%</span></p>
                          <p><strong>Interpretação:</strong> <span className={resultado.esquerdo.cor}>{resultado.esquerdo.interpretacao}</span></p>
                        </>
                      )}
                      {resultado.direito && (
                        <>
                          <p><strong>FS (Ventrículo Direito):</strong> <span className={resultado.direito.cor}>{resultado.direito.fs}%</span></p>
                          <p><strong>Interpretação:</strong> <span className={resultado.direito.cor}>{resultado.direito.interpretacao}</span></p>
                        </>
                      )}
                    </>
                  )}
                  {metrica === 'excursao' && (
                    <>
                      {resultado.tapse && (
                        <>
                          <p><strong>TAPSE:</strong> <span className={resultado.tapse.cor}>{resultado.tapse.deslocamento} mm</span></p>
                          <p><strong>Interpretação:</strong> <span className={resultado.tapse.cor}>{resultado.tapse.interpretacao}</span></p>
                        </>
                      )}
                      {resultado.mapse && (
                        <>
                          <p><strong>MAPSE:</strong> <span className={resultado.mapse.cor}>{resultado.mapse.deslocamento} mm</span></p>
                          <p><strong>Interpretação:</strong> <span className={resultado.mapse.cor}>{resultado.mapse.interpretacao}</span></p>
                        </>
                      )}
                    </>
                  )}
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