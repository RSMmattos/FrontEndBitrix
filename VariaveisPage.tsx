import React, { useState } from 'react';
import VariaveisTable from './components/VariaveisTable';
import ExecutadasTable from './components/ExecutadasTable';
import AcumuladasTable from './components/AcumuladasTable';

const VariaveisPage: React.FC = () => {
  const [ano, setAno] = useState<number>(new Date().getFullYear());
  const [tab, setTab] = useState<'programadas' | 'executadas' | 'acumuladas'>('programadas');
  return (
    <div className="p-6">
      <div className="flex items-center mb-4">
        <label className="mr-2 font-semibold">Ano:</label>
        <input
          type="number"
          className="border rounded px-2 py-1 w-24"
          value={ano}
          min={2000}
          max={2100}
          onChange={e => setAno(Number(e.target.value))}
        />
      </div>
      <div className="mb-6 flex gap-2 border-b">
        <button
          className={`px-4 py-2 font-bold border-b-2 transition-colors ${tab === 'programadas' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-emerald-700'}`}
          onClick={() => setTab('programadas')}
        >
          Programadas
        </button>
        <button
          className={`px-4 py-2 font-bold border-b-2 transition-colors ${tab === 'executadas' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-emerald-700'}`}
          onClick={() => setTab('executadas')}
        >
          Executadas
        </button>
        <button
          className={`px-4 py-2 font-bold border-b-2 transition-colors ${tab === 'acumuladas' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-emerald-700'}`}
          onClick={() => setTab('acumuladas')}
        >
          Acumuladas
        </button>
      </div>
      {tab === 'programadas' && (
        <>
          <h1 className="text-2xl font-black text-slate-900 mb-4">Programadas</h1>
          <VariaveisTable ano={ano} />
        </>
      )}
      {tab === 'executadas' && (
        <>
          <h1 className="text-2xl font-black text-slate-900 mb-4">Executadas</h1>
          <ExecutadasTable ano={ano} />
        </>
      )}
      {tab === 'acumuladas' && (
        <>
          <h1 className="text-2xl font-black text-slate-900 mb-4">Acumuladas</h1>
          <AcumuladasTable ano={ano} />
        </>
      )}
    </div>
  );
};

export default VariaveisPage;
