// src/ZScoreCalculator.jsx
import React, { useState } from 'react';

export default function ZScoreCalculator() {
  const [estrutura, setEstrutura] = useState('aortica');
  const [medida, setMedida] = useState('');
  const [idadeGestacional, setIdadeGestacional] = useState('');
  const [resultado, setResultado] = useState(null);

  const calcularZScore = (estrutura, medida, ig) => {
    let media, desvioPadrao;
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
      default:
        return null;
    }

    const z = (medida - media) / desvioPadrao;
    const interpretacao =
      Math.abs(z) > 2
        ? 'Atenção: Z-Score fora do intervalo normal. Consulte um cardiologista fetal.'
        : 'Z-Score dentro do intervalo normal.';

    return {
      zScore: z.toFixed(2),
      interpretacao,
      media: media.toFixed(2),
      desvioPadrao: desvioPadrao.toFixed(2),
    };
  };

  const handleCalcular = () => {
    const ig = parseFloat(idadeGestacional);
    const m = parseFloat(medida);
    if (!m || !ig || ig < 18 || ig > 34) {
      setResultado({
        erro:
          'Por favor, insira valores válidos. Idade gestacional deve estar entre 18 e 34 semanas.',
      });
      return;
    }
    setResultado(calcularZScore(estrutura, m, ig));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-center mb-4">
          Calculadora de Z-Score Fetal
        </h1>
        {/* formulário */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Estrutura Cardíaca
          </label>
          <select
            value={estrutura}
            onChange={(e) => setEstrutura(e.target.value)}
            className="mt-1 w-full border-gray-300 rounded"
          >
            <option value="aortica">Válvula Aórtica</option>
            <option value="mitral">Válvula Mitral</option>
            <option value="ventriculoEsquerdo">Ventrículo Esquerdo</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Medida Observada (mm)
          </label>
          <input
            type="number"
            step="0.1"
            value={medida}
            onChange={(e) => setMedida(e.target.value)}
            className="mt-1 w-full border-gray-300 rounded"
            placeholder="Ex.: 4.5"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Idade Gestacional (semanas)
          </label>
          <input
            type="number"
            step="0.1"
            value={idadeGestacional}
            onChange={(e) => setIdadeGestacional(e.target.value)}
            className="mt-1 w-full border-gray-300 rounded"
            placeholder="Ex.: 24"
          />
        </div>
        <button
          onClick={handleCalcular}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
        >
          Calcular Z-Score
        </button>

        {resultado && (
          <div className="mt-6 p-4 bg-gray-50 rounded">
            {resultado.erro ? (
              <p className="text-red-600">{resultado.erro}</p>
            ) : (
              <React.Fragment>
                <p>
                  <strong>Z-Score:</strong> {resultado.zScore}
                </p>
                <p>
                  <strong>Interpretação:</strong> {resultado.interpretacao}
                </p>
                <p>
                  <strong>Média Esperada:</strong> {resultado.media} mm
                </p>
                <p>
                  <strong>Desvio Padrão:</strong> {resultado.desvioPadrao} mm
                </p>
              </React.Fragment>
            )}
          </div>
        )}

        <p className="mt-4 text-sm text-center text-gray-600">
          Esta ferramenta é informativa. Baseado em Schneider et al. (2005).
        </p>
      </div>
    </div>
  );
}
