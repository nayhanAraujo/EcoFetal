import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function BiometriaFetalCalculator() {
  const percentisPeso = {
    18: { p10: 200, p50: 250, p90: 300 },
    19: { p10: 250, p50: 300, p90: 350 },
    20: { p10: 300, p50: 350, p90: 400 },
    21: { p10: 350, p50: 400, p90: 450 },
    22: { p10: 400, p50: 450, p90: 500 },
    23: { p10: 450, p50: 525, p90: 600 },
    24: { p10: 500, p50: 600, p90: 700 },
    25: { p10: 600, p50: 700, p90: 800 },
    26: { p10: 700, p50: 800, p90: 900 },
    27: { p10: 800, p50: 950, p90: 1100 },
    28: { p10: 900, p50: 1100, p90: 1300 },
    29: { p10: 1000, p50: 1200, p90: 1400 },
    30: { p10: 1100, p50: 1350, p90: 1600 },
    31: { p10: 1200, p50: 1500, p90: 1800 },
    32: { p10: 1400, p50: 1700, p90: 2000 },
    33: { p10: 1600, p50: 1900, p90: 2200 },
    34: { p10: 1800, p50: 2100, p90: 2400 },
    35: { p10: 2000, p50: 2300, p90: 2700 },
    36: { p10: 2200, p50: 2600, p90: 3000 },
    37: { p10: 2400, p50: 2800, p90: 3200 },
    38: { p10: 2600, p50: 3000, p90: 3400 },
    39: { p10: 2800, p50: 3200, p90: 3600 },
    40: { p10: 2900, p50: 3400, p90: 3900 }
  };

  const comprimentoFetalRef = {
    18: { min: 25, max: 30 },
    20: { min: 28, max: 33 },
    24: { min: 35, max: 40 },
    28: { min: 40, max: 45 },
    32: { min: 45, max: 50 },
    36: { min: 50, max: 55 },
    40: { min: 55, max: 60 }
  };

  const [dbp, setDbp] = useState('');
  const [dof, setDof] = useState('');
  const [cc, setCc] = useState('');
  const [ca, setCa] = useState('');
  const [comprimentoFemur, setComprimentoFemur] = useState('');
  const [comprimentoUmero, setComprimentoUmero] = useState('');
  const [idadeGestacional, setIdadeGestacional] = useState('');
  const [resultado, setResultado] = useState(null);

  // Lista de idades gestacionais para o dropdown
  const idadesGestacionais = Array.from({ length: 23 }, (_, i) => 18 + i); // 18 a 40 semanas

  const calcularBiometria = () => {
    const dbpNum = parseFloat(dbp);
    const dofNum = parseFloat(dof);
    const ccNum = parseFloat(cc);
    const caNum = parseFloat(ca);
    const cfNum = parseFloat(comprimentoFemur);
    const cuNum = comprimentoUmero ? parseFloat(comprimentoUmero) : null;
    const ig = parseFloat(idadeGestacional);

    // Validação de entrada
    if (!dbpNum || !dofNum || !ccNum || !caNum || !cfNum || !ig || ig < 18 || ig > 40) {
      setResultado({
        erro: 'Por favor, insira todas as medidas obrigatórias e uma idade gestacional válida (18-40 semanas).'
      });
      return;
    }

    // Validação de intervalos realistas
    if (dbpNum < 2 || dbpNum > 12) {
      setResultado({ erro: 'Diâmetro Biparietal deve estar entre 2 e 12 cm.' });
      return;
    }
    if (dofNum < 2 || dofNum > 15) {
      setResultado({ erro: 'Diâmetro Occipito-frontal deve estar entre 2 e 15 cm.' });
      return;
    }
    if (ccNum < 10 || ccNum > 40) {
      setResultado({ erro: 'Circunferência Cefálica deve estar entre 10 e 40 cm.' });
      return;
    }
    if (caNum < 10 || caNum > 40) {
      setResultado({ erro: 'Circunferência Abdominal deve estar entre 10 e 40 cm.' });
      return;
    }
    if (cfNum < 1 || cfNum > 8) {
      setResultado({ erro: 'Comprimento do Fêmur deve estar entre 1 e 8 cm.' });
      return;
    }
    if (cuNum && (cuNum < 1 || cuNum > 8)) {
      setResultado({ erro: 'Comprimento do Úmero deve estar entre 1 e 8 cm.' });
      return;
    }

    // Intervalos normais ajustados por idade gestacional
    const dbpDofMin = ig < 24 ? 77 : 78;
    const dbpDofMax = ig < 24 ? 81 : 82;
    const cfDbpMin = ig < 24 ? 21 : 20;
    const cfDbpMax = ig < 24 ? 26 : 25;
    const cfCaMin = ig < 24 ? 16 : ig < 32 ? 15 : 14;
    const cfCaMax = ig < 24 ? 21 : ig < 32 ? 20 : 19;
    const ccCaMin = ig < 24 ? 1.0 : 0.9;
    const ccCaMax = ig < 24 ? 1.2 : 1.1;

    // Relações Biométricas
    const dbpDof = (dbpNum / dofNum) * 100;
    const cfDbp = (cfNum / dbpNum) * 100;
    const cfCa = (cfNum / caNum) * 100;
    const ccCa = ccNum / caNum;

    // Interpretações
    const dbpDofInterpretacao = dbpDof >= dbpDofMin && dbpDof <= dbpDofMax
      ? 'Normal'
      : 'Fora do intervalo normal. Avaliação recomendada.';
    const cfDbpInterpretacao = cfDbp >= cfDbpMin && cfDbp <= cfDbpMax
      ? 'Normal'
      : 'Fora do intervalo normal. Avaliação recomendada.';
    const cfCaInterpretacao = cfCa >= cfCaMin && cfCa <= cfCaMax
      ? 'Normal'
      : 'Fora do intervalo normal. Avaliação recomendada.';
    const ccCaInterpretacao = ccCa >= ccCaMin && ccCa <= ccCaMax
      ? 'Normal'
      : 'Fora do intervalo normal. Avaliação recomendada.';

    const dbpDofCor = dbpDof >= dbpDofMin && dbpDof <= dbpDofMax ? 'text-green-600' : 'text-red-600';
    const cfDbpCor = cfDbp >= cfDbpMin && cfDbp <= cfDbpMax ? 'text-green-600' : 'text-red-600';
    const cfCaCor = cfCa >= cfCaMin && cfCa <= cfCaMax ? 'text-green-600' : 'text-red-600';
    const ccCaCor = ccCa >= ccCaMin && ccCa <= ccCaMax ? 'text-green-600' : 'text-red-600';

    // Estimativa de Peso Fetal (fórmula de Hadlock)
    const logPeso = 1.326 - 0.00326 * caNum * cfNum + 0.0107 * caNum + 0.0438 * dbpNum + 0.158 * cfNum;
    const pesoFetal = Math.pow(10, logPeso);

    // Percentil ajustado por idade gestacional
    const igAproximada = Math.round(ig);
    const percentilRef = percentisPeso[igAproximada] || percentisPeso[24]; // Fallback para 24 semanas
    let percentil;
    if (pesoFetal < percentilRef.p10) percentil = 10;
    else if (pesoFetal > percentilRef.p90) percentil = 90;
    else percentil = 50;

    const pesoInterpretacao = percentil >= 10 && percentil <= 90 ? 'Normal' : 'Fora do intervalo normal. Avaliação recomendada.';
    const pesoCor = percentil >= 10 && percentil <= 90 ? 'text-green-600' : 'text-red-600';

    // Estimativa de Comprimento Fetal (ajustado por tabela simplificada)
    // Encontrar a chave mais próxima em comprimentoFetalRef
    const chavesRef = Object.keys(comprimentoFetalRef).map(Number).sort((a, b) => a - b);
    let igRef = chavesRef[0]; // Default para a primeira chave
    for (let i = 0; i < chavesRef.length; i++) {
      if (igAproximada <= chavesRef[i]) {
        igRef = chavesRef[i];
        break;
      } else if (igAproximada > chavesRef[i] && i === chavesRef.length - 1) {
        igRef = chavesRef[i];
      } else if (igAproximada > chavesRef[i] && igAproximada < chavesRef[i + 1]) {
        igRef = Math.abs(igAproximada - chavesRef[i]) < Math.abs(igAproximada - chavesRef[i + 1])
          ? chavesRef[i]
          : chavesRef[i + 1];
      }
    }

    const comprimentoFetalBase = 6.5 * cfNum;
    const comprimentoFetalAjustado = ig < 24 ? comprimentoFetalBase * 0.9 : comprimentoFetalBase * 1.1;
    const comprimentoMin = comprimentoFetalRef[igRef].min;
    const comprimentoMax = comprimentoFetalRef[igRef].max;
    const comprimentoInterpretacao = comprimentoFetalAjustado >= comprimentoMin && comprimentoFetalAjustado <= comprimentoMax
      ? 'Normal'
      : 'Fora do intervalo esperado. Avaliação recomendada.';
    const comprimentoCor = comprimentoFetalAjustado >= comprimentoMin && comprimentoFetalAjustado <= comprimentoMax ? 'text-green-600' : 'text-red-600';

    setResultado({
      biometria: {
        dbp: dbpNum.toFixed(1),
        dof: dofNum.toFixed(1),
        cc: ccNum.toFixed(1),
        ca: caNum.toFixed(1),
        comprimentoFemur: cfNum.toFixed(1),
        comprimentoUmero: cuNum ? cuNum.toFixed(1) : 'Não informado'
      },
      relacoes: {
        dbpDof: dbpDof.toFixed(1),
        cfDbp: cfDbp.toFixed(1),
        cfCa: cfCa.toFixed(1),
        ccCa: ccCa.toFixed(2),
        dbpDofInterpretacao,
        cfDbpInterpretacao,
        cfCaInterpretacao,
        ccCaInterpretacao,
        dbpDofCor,
        cfDbpCor,
        cfCaCor,
        ccCaCor
      },
      estimativa: {
        peso: pesoFetal.toFixed(0),
        percentil,
        comprimento: comprimentoFetalAjustado.toFixed(1),
        pesoInterpretacao,
        comprimentoInterpretacao,
        pesoCor,
        comprimentoCor
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="container max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-blue-800 mb-6">
          Calculadora de Biometria Fetal
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Biometria Fetal</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Diâmetro Biparietal (cm)</label>
              <input
                type="number"
                step="0.1"
                value={dbp}
                onChange={(e) => setDbp(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex.: 5.8"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Diâmetro Occipito-frontal (cm)</label>
              <input
                type="number"
                step="0.1"
                value={dof}
                onChange={(e) => setDof(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex.: 7.2"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Circunferência Cefálica (cm)</label>
              <input
                type="number"
                step="0.1"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex.: 20.5"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Circunferência Abdominal (cm)</label>
              <input
                type="number"
                step="0.1"
                value={ca}
                onChange={(e) => setCa(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex.: 18.3"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Comprimento do Fêmur (cm)</label>
              <input
                type="number"
                step="0.1"
                value={comprimentoFemur}
                onChange={(e) => setComprimentoFemur(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex.: 4.5"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Comprimento do Úmero (cm, opcional)</label>
              <input
                type="number"
                step="0.1"
                value={comprimentoUmero}
                onChange={(e) => setComprimentoUmero(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex.: 4.2"
              />
            </div>
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

            <button
              onClick={calcularBiometria}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Calcular Biometria
            </button>
          </div>

          {/* Resultados */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            {resultado ? (
              resultado.erro ? (
                <p className="text-red-600">{resultado.erro}</p>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800">Resultados</h2>
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Biometria Fetal</h3>
                    <p><strong>Diâmetro Biparietal:</strong> {resultado.biometria.dbp} cm</p>
                    <p><strong>Diâmetro Occipito-frontal:</strong> {resultado.biometria.dof} cm</p>
                    <p><strong>Circunferência Cefálica:</strong> {resultado.biometria.cc} cm</p>
                    <p><strong>Circunferência Abdominal:</strong> {resultado.biometria.ca} cm</p>
                    <p><strong>Comprimento do Fêmur:</strong> {resultado.biometria.comprimentoFemur} cm</p>
                    <p><strong>Comprimento do Úmero:</strong> {resultado.biometria.comprimentoUmero} cm</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Relações Biométricas</h3>
                    <p><strong>DBP/DOF:</strong> <span className={resultado.relacoes.dbpDofCor}>{resultado.relacoes.dbpDof}%</span></p>
                    <p><strong>Interpretação:</strong> <span className={resultado.relacoes.dbpDofCor}>{resultado.relacoes.dbpDofInterpretacao}</span></p>
                    <p><strong>CF/DBP:</strong> <span className={resultado.relacoes.cfDbpCor}>{resultado.relacoes.cfDbp}%</span></p>
                    <p><strong>Interpretação:</strong> <span className={resultado.relacoes.cfDbpCor}>{resultado.relacoes.cfDbpInterpretacao}</span></p>
                    <p><strong>CF/CA:</strong> <span className={resultado.relacoes.cfCaCor}>{resultado.relacoes.cfCa}%</span></p>
                    <p><strong>Interpretação:</strong> <span className={resultado.relacoes.cfCaCor}>{resultado.relacoes.cfCaInterpretacao}</span></p>
                    <p><strong>CC/CA:</strong> <span className={resultado.relacoes.ccCaCor}>{resultado.relacoes.ccCa}</span></p>
                    <p><strong>Interpretação:</strong> <span className={resultado.relacoes.ccCaCor}>{resultado.relacoes.ccCaInterpretacao}</span></p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Estimativa de Peso e Comprimento Fetal</h3>
                    <p><strong>Peso Fetal (média):</strong> <span className={resultado.estimativa.pesoCor}>{resultado.estimativa.peso} g</span></p>
                    <p><strong>Peso Fetal no Percentil:</strong> <span className={resultado.estimativa.pesoCor}>{resultado.estimativa.percentil}</span></p>
                    <p><strong>Interpretação:</strong> <span className={resultado.estimativa.pesoCor}>{resultado.estimativa.pesoInterpretacao}</span></p>
                    <p><strong>Comprimento Fetal:</strong> <span className={resultado.estimativa.comprimentoCor}>{resultado.estimativa.comprimento} cm</span></p>
                    <p><strong>Interpretação:</strong> <span className={resultado.estimativa.comprimentoCor}>{resultado.estimativa.comprimentoInterpretacao}</span></p>
                  </div>
                </div>
              )
            ) : (
              <p className="text-gray-600">Insira os dados e clique em "Calcular Biometria" para ver os resultados.</p>
            )}
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-600 text-center space-y-2">
          <p>Esta ferramenta é informativa e não substitui a avaliação de um médico.</p>
          <p>
            <Link to="/" className="text-blue-600 hover:underline">
              Voltar para Calculadora de Z-Score
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}