import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import ZScoreCalculator from './ZScoreCalculator';
import BiometriaFetalCalculator from './BiometriaFetalCalculator';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Menu de navegação */}
        <nav className="bg-blue-800 p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <div className="text-white font-bold text-xl">Calculadoras Médicas</div>
            <div className="space-x-4">
              <Link to="/" className="text-white hover:text-blue-200 transition-colors">
                Calculadora de Z-Score
              </Link>
              <Link to="/biometria-fetal" className="text-white hover:text-blue-200 transition-colors">
                Calculadora de Biometria Fetal
              </Link>
            </div>
          </div>
        </nav>

        {/* Definição das rotas */}
        <Routes>
          <Route path="/" element={<ZScoreCalculator />} />
          <Route path="/biometria-fetal" element={<BiometriaFetalCalculator />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;