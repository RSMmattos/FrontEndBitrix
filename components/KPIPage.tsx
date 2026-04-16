import React, { useEffect, useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';

interface KpiData {
  codccusto_nome: string;
  grupo_nome: string;
  idgrupobitrix: number;
  perc_execucao: number;
  indicador: string;
}

interface TaskData {
  codccusto_nome: string;
  grupo_nome: string;
  id: number;
  idtask: number;
  title: string;
  responsavel: string;
  comentario: string;
  prioridade: boolean;
  dataprazofinal: string;
  dataconclusao: string | null;
  status?: string;
}

interface KpiApiResponse {
  kpi: KpiData[];
  concluidas: TaskData[];
  pendentes: TaskData[];
}

function formatDateBR(dateStr?: string | null) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.slice(0, 10).split('-');
  if (!y || !m || !d) return dateStr;
  return `${d}/${m}/${y}`;
}

const KPIPage: React.FC = () => {
  const [data, setData] = useState<KpiApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Filtros
  const [anoBase, setAnoBase] = useState('2025');
  const [mes, setMes] = useState('12');
  const [grupo, setGrupo] = useState('153');
  const [codCusto, setCodCusto] = useState('02.20.06.10');

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get(`http://10.0.0.6:3001/api/diretoranalisea?AnoBase=${anoBase}&Mes=${mes}&Grupo=${grupo}&CodCusto=${codCusto}`)
      .then(res => setData(res.data))
      .catch(() => setError('Erro ao buscar dados da API'))
      .finally(() => setLoading(false));
  }, [anoBase, mes, grupo, codCusto]);

  const reportRef = useRef<HTMLDivElement>(null);

  const handleGeneratePDF = async () => {
    if (!reportRef.current) return;
    const element = reportRef.current;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 40;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
    pdf.save('relatorio_kpi.pdf');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Relatório KPI</h2>
        <button
          onClick={handleGeneratePDF}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Gerar PDF
        </button>
      </div>
      <div ref={reportRef}>
      <div className="flex gap-4 mb-4">
        <div className="flex flex-col">
          <label className="text-xs font-semibold mb-1" htmlFor="anoBase">ANO BASE</label>
          <input id="anoBase" type="number" value={anoBase} onChange={e => setAnoBase(e.target.value.replace(/\D/g, ''))} className="border p-2 rounded" placeholder="ANO BASE" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-semibold mb-1" htmlFor="mes">MÊS</label>
          <input id="mes" type="number" value={mes} onChange={e => setMes(e.target.value.replace(/\D/g, ''))} className="border p-2 rounded" placeholder="MÊS" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-semibold mb-1" htmlFor="grupo">GRUPO</label>
          <input id="grupo" type="number" value={grupo} onChange={e => setGrupo(e.target.value.replace(/\D/g, ''))} className="border p-2 rounded" placeholder="GRUPO" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-semibold mb-1" htmlFor="codCusto">COD. CUSTO</label>
          <input id="codCusto" value={codCusto} onChange={e => setCodCusto(e.target.value)} className="border p-2 rounded" placeholder="COD. CUSTO" />
        </div>
      </div>
      {loading && <div>Carregando...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {data && (
        <div>
          <h3 className="text-lg font-semibold mb-2">KPI</h3>
          <table className="min-w-full mb-6 border">
            <thead>
              <tr>
                <th className="border px-2 py-1">Centro de Custo</th>
                <th className="border px-2 py-1">Grupo</th>
                <th className="border px-2 py-1">% Execução</th>
                <th className="border px-2 py-1">Indicador</th>
              </tr>
            </thead>
            <tbody>
              {data.kpi.map((k, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{k.codccusto_nome}</td>
                  <td className="border px-2 py-1">{k.grupo_nome}</td>
                  <td className="border px-2 py-1">{k.perc_execucao}%</td>
                  <td className="border px-2 py-1">{k.indicador}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3 className="text-lg font-semibold mb-2">Tarefas Concluídas</h3>
          <table className="min-w-full mb-6 border">
            <thead>
              <tr>
                <th className="border px-2 py-1">idtask</th>
                <th className="border px-2 py-1">Título</th>
                <th className="border px-2 py-1">Responsável</th>
                <th className="border px-2 py-1">Comentário</th>
                <th className="border px-2 py-1">Prazo Final</th>
                <th className="border px-2 py-1">Conclusão</th>
              </tr>
            </thead>
            <tbody>
              {data.concluidas.map((t, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{t.idtask}</td>
                  <td className="border px-2 py-1">{t.title}</td>
                  <td className="border px-2 py-1">{t.responsavel}</td>
                  <td className="border px-2 py-1">{t.comentario}</td>
                  <td className="border px-2 py-1">{formatDateBR(t.dataprazofinal)}</td>
                  <td className="border px-2 py-1">{formatDateBR(t.dataconclusao)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3 className="text-lg font-semibold mb-2">Tarefas Pendentes</h3>
          <table className="min-w-full border">
            <thead>
              <tr>
                <th className="border px-2 py-1">idtask</th>
                <th className="border px-2 py-1">Título</th>
                <th className="border px-2 py-1">Responsável</th>
                <th className="border px-2 py-1">Comentário</th>
                <th className="border px-2 py-1">Prazo Final</th>
                <th className="border px-2 py-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.pendentes.map((t, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{t.idtask}</td>
                  <td className="border px-2 py-1">{t.title}</td>
                  <td className="border px-2 py-1">{t.responsavel}</td>
                  <td className="border px-2 py-1">{t.comentario}</td>
                  <td className="border px-2 py-1">{formatDateBR(t.dataprazofinal)}</td>
                  <td className="border px-2 py-1">{t.status || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </div>
  );
};

export default KPIPage;
