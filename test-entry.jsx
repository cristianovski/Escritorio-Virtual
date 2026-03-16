import React from 'react';
import ReactDOM from 'react-dom/client';
import { AnalysisPage } from './src/pages/analysis/AnalysisPage';

// Minimal mock environment
const MockClient = {
  id: 1,
  nome: 'João da Silva',
  cpf: '123.456.789-00',
  sexo: 'Masculino',
  data_nascimento: '1960-01-01',
  profissao: 'Agricultor',
};

// Override hook for the test
jest.mock('./src/hooks/useBenefitAnalysis', () => ({
  useBenefitAnalysis: () => ({
    loading: false,
    der: '2025-02-18',
    setDer: jest.fn(),
    selectedBenefit: 'Aposentadoria por Idade Rural',
    setSelectedBenefit: jest.fn(),
    periodos: [
      { id: '1', inicio: '1980-01-01', fim: '1995-01-01', tipo: 'rural', obs: 'Roça do pai' }
    ],
    documentos: [],
    extraParams: { data_dii: '', is_acidente: false, data_obito: '', data_casamento: '', idade_conjuge_obito: 0 },
    setExtraParams: jest.fn(),
    analiseJuridica: { viable: true, status: 'aprovado', messages: ['✅ Requisito Etário Cumprido.'] },
    totalRural: 180,
    totalHibrido: 180,
    handleSavePeriod: jest.fn(),
    handleRemovePeriod: jest.fn(),
    handleSave: jest.fn(),
  })
}));


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AnalysisPage cliente={MockClient} onBack={() => {}} />);
