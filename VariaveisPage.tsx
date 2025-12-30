import React, { useState } from 'react';
import VariaveisTable from './components/VariaveisTable';

const VariaveisPage: React.FC = () => {
  const [ano, setAno] = useState<number>(new Date().getFullYear());
  return (
    <div className="p-6">
      <h1 className="text-2xl font-black text-slate-900 mb-4">Relatório de Variáveis</h1>
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
      <VariaveisTable ano={ano} />
    </div>
  );
};

export default VariaveisPage;
