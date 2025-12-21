
import React, { useEffect, useState } from 'react';
import { GroupLink, CostCenter } from '../types';
import { fetchTasks } from '../services/bitrixService';
import { format, subDays } from 'date-fns';

// Componente customizado para exibir grupos e quantidade de tarefas Bitrix

export const VisaoGroupLinkList: React.FC = () => {
  const [groupLinks, setGroupLinks] = useState<GroupLink[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [bitrixGroups, setBitrixGroups] = useState<any[]>([]);
  const [taskCounts, setTaskCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Mesmo range de datas da Tabela Atividades (últimos 30 dias)
  const dateFrom = format(subDays(new Date(), 30), 'yyyy-MM-dd');
  const dateTo = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch('http://localhost:3000/api/bgcatividade').then(r => r.json()),
      fetch('http://localhost:3000/api/gccusto').then(r => r.json()),
      fetch('https://agroserra.bitrix24.com.br/rest/187/wdalwcekbog0ke1r/sonet_group.get').then(r => r.json()).then(data => Array.isArray(data) ? data : data.result || [])
    ]).then(async ([links, centers, groups]) => {
      setGroupLinks(links);
      setCostCenters(centers);
      setBitrixGroups(groups);
      try {
        const allTasks = await fetchTasks(dateFrom, dateTo);
        const counts: Record<number, number> = {};
        links.forEach(link => {
          const idGrupo = link.id_grupo ?? link.idgrupobitrix;
          counts[idGrupo] = allTasks.filter((t: any) => {
            // Garante comparação como string
            return t.GROUP_ID?.toString?.() === idGrupo?.toString?.();
          }).length;
        });
        setTaskCounts(counts);
      } catch (err: any) {
        setError('Erro ao buscar tarefas do Bitrix: ' + (err?.message || err?.toString() || 'Erro desconhecido'));
      }
      setLoading(false);
    }).catch((err) => {
      setError('Erro ao buscar dados: ' + (err?.message || err?.toString() || 'Erro desconhecido'));
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando...</div>;
  if (error) return <div className="p-8 text-center text-rose-600 font-bold">{error}</div>;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Centro de Custo</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Nome</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">ID Grupo</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Nome Grupo</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Qtd. Tarefas</th>
          </tr>
        </thead>
        <tbody>
          {groupLinks.map(link => {
            const costCenter = costCenters.find(cc => cc.codccusto === link.codccusto);
            // Compatível com ambos os campos: id_grupo (novo) ou idgrupobitrix (antigo)
            const idGrupoStr = (link.id_grupo ?? link.idgrupobitrix)?.toString?.() ?? String(link.id_grupo ?? link.idgrupobitrix);
            const bitrixGroup = Array.isArray(bitrixGroups) ? bitrixGroups.find(bg => bg && (bg.ID?.toString?.() === idGrupoStr)) : undefined;
            return (
              <tr key={link.codccusto} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">{link.codccusto}</td>
                <td className="px-6 py-4 text-sm">{costCenter?.nome || '-'}</td>
                <td className="px-6 py-4 text-sm">{idGrupoStr}</td>
                <td className="px-6 py-4 text-sm">
                  {bitrixGroup?.NAME
                    ? `${bitrixGroup.NAME} (ID: ${bitrixGroup.ID})`
                    : `Grupo não encontrado (ID: ${idGrupoStr})`}
                </td>
                <td className="px-6 py-4 text-sm text-center font-bold">{taskCounts[link.id_grupo ?? link.idgrupobitrix] ?? 0}</td>
              </tr>
            );
          })}
          {groupLinks.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                Nenhum vínculo encontrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
