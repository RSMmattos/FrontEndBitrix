import React, { useEffect, useState } from 'react';
import { GroupLink, CostCenter, BitrixGroup, BitrixTask } from '../types';

interface MesAno {
  label: string;
  ano: number;
  mes: number;
}

const meses: MesAno[] = [
  { label: 'Mai/25', ano: 2025, mes: 5 },
  { label: 'Jun/25', ano: 2025, mes: 6 },
  { label: 'Jul/25', ano: 2025, mes: 7 },
  { label: 'Ago/25', ano: 2025, mes: 8 },
  { label: 'Set/25', ano: 2025, mes: 9 },
  { label: 'Out/25', ano: 2025, mes: 10 },
  { label: 'Nov/25', ano: 2025, mes: 11 },
  { label: 'Dez/25', ano: 2025, mes: 12 },
  { label: 'Jan/26', ano: 2026, mes: 1 },
  { label: 'Fev/26', ano: 2026, mes: 2 },
  { label: 'Mar/26', ano: 2026, mes: 3 },
  { label: 'Abr/26', ano: 2026, mes: 4 },
];

export const Gestao: React.FC<{ tasks: BitrixTask[]; costCenters: CostCenter[]; groupLinks: GroupLink[]; bitrixGroups: BitrixGroup[] }>
  = ({ tasks, costCenters, groupLinks, bitrixGroups }) => {
  // Mapeia centro de custo para grupos vinculados
  function getGruposVinculados(codccusto: string) {
    return groupLinks.filter(gl => gl.codccusto === codccusto).map(gl => {
      const grupo = bitrixGroups.find(bg => String(bg.ID) === String(gl.id_grupo));
      return grupo ? grupo.NAME : gl.id_grupo;
    }).join(', ');
  }

  // Conta tarefas por centro de custo e mês
  function getTarefasPorMes(codccusto: string, ano: number, mes: number) {
    return tasks.filter(t => {
      // Supondo que o centro de custo está em t.GROUP_NAME ou similar
      const grupo = groupLinks.find(gl => gl.codccusto === codccusto && String(gl.id_grupo) === String(t.GROUP_NAME));
      if (!grupo) return false;
      if (!t.CREATED_DATE) return false;
      const dt = new Date(t.CREATED_DATE);
      return dt.getFullYear() === ano && dt.getMonth() + 1 === mes;
    }).length;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 overflow-x-auto">
      <h2 className="text-2xl font-black text-emerald-700 mb-6">Gestão de Centros de Custo e Grupos</h2>
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50/50">
          <tr>
            <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase">Centro de Custo</th>
            <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase">Grupos Vinculados</th>
            {meses.map(m => (
              <th key={m.label} className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase text-center">{m.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {costCenters.map(cc => (
            <tr key={cc.codccusto} className="border-b border-slate-100">
              <td className="px-4 py-3 text-sm font-bold text-slate-800">{cc.nome}</td>
              <td className="px-4 py-3 text-sm text-slate-700">{getGruposVinculados(cc.codccusto)}</td>
              {meses.map(m => (
                <td key={m.label} className="px-4 py-3 text-sm text-center font-mono text-slate-600">{getTarefasPorMes(cc.codccusto, m.ano, m.mes)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
