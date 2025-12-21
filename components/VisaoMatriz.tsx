import React, { useEffect, useState } from 'react';
import { GroupLink, BitrixGroup, BitrixTask } from '../types';
import { format, parseISO } from 'date-fns';

interface VisaoMatrizProps {
  groupLinks: GroupLink[];
  bitrixGroups: BitrixGroup[];
  tasks: BitrixTask[];
}

// Gera os meses do ano atual (ou de 2025, se preferir)
function getMonths(year: number) {
  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date(year, i, 1);
    return {
      key: format(date, 'yyyy-MM'),
      label: format(date, 'MMM/yy', { locale: undefined })
    };
  });
}

export const VisaoMatriz: React.FC<VisaoMatrizProps> = ({ groupLinks, bitrixGroups, tasks }) => {
  // Use 2025 como ano base
  const months = getMonths(2025);

  // Mapeia cada grupo para a contagem de tarefas por mês
  const data = groupLinks.map(link => {
    const grupo = bitrixGroups.find(bg => bg.ID === link.id_grupo.toString());
    const row: any = {
      id_grupo: link.id_grupo,
      nome_grupo: grupo?.NAME || link.id_grupo,
      counts: {} as Record<string, number>
    };
    months.forEach(m => {
      row.counts[m.key] = tasks.filter(t => {
        // Considera tasks do grupo e do mês
        const taskMonth = t.CREATED_DATE ? format(parseISO(t.CREATED_DATE), 'yyyy-MM') : '';
        return t.GROUP_NAME === grupo?.NAME && taskMonth === m.key;
      }).length;
    });
    return row;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">ID Grupo</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Nome Grupo</th>
            {months.map(m => (
              <th key={m.key} className="px-4 py-4 text-xs font-bold text-gray-500 uppercase text-center">{m.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.id_grupo} className="border-t hover:bg-gray-50">
              <td className="px-6 py-4 text-sm">{row.id_grupo}</td>
              <td className="px-6 py-4 text-sm">{row.nome_grupo}</td>
              {months.map(m => (
                <td key={m.key} className="px-4 py-4 text-sm text-center">{row.counts[m.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
