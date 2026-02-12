import React, { useEffect, useState } from 'react';
import axios from 'axios';
// ...existing code...
import { User as UserIcon } from 'lucide-react';
import { API_BASE_URL } from '../constants';

interface DetalhesAtividadesModalProps {
  open: boolean;
  onClose: () => void;
  idgrupobitrix: string | number | null;
  grupoNome?: string;
  mes?: string | null;
  contexto?: 'programadas' | 'executadas' | 'saldo';
  apiModal?: string;
}

const DetalhesAtividadesModal: React.FC<DetalhesAtividadesModalProps> = ({ open, onClose, idgrupobitrix, grupoNome, mes, contexto, apiModal }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registros, setRegistros] = useState<any[]>([]);
  const [tasksMap, setTasksMap] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!open || !idgrupobitrix) return;
    setLoading(true);
    setError(null);
    // Busca atividades do grupo (apenas API interna)
    const url = apiModal ? (apiModal.includes('://') ? apiModal : `${API_BASE_URL}${apiModal}`) : `${API_BASE_URL}/api/batividadeg/grupo/${idgrupobitrix}`;
    fetch(url)
      .then(res => res.json())
      .then(json => {
        let regs = json.registros || json.atividades || [];
        if (mes && contexto === 'programadas') {
          regs = regs.filter((r: any) => {
            if (!r.dataprazofinal) return false;
            const dataPrazo = new Date(r.dataprazofinal);
            const mesAnoPrazo = `${dataPrazo.getFullYear()}-${String(dataPrazo.getMonth() + 1).padStart(2, '0')}`;
            return mesAnoPrazo === mes;
          });
        } else if (mes && contexto === 'saldo') {
          regs = regs.filter((r: any) => {
            if (!r.dataprazofinal) return false;
            const dataPrazo = new Date(r.dataprazofinal);
            const mesAnoPrazo = `${dataPrazo.getFullYear()}-${String(dataPrazo.getMonth() + 1).padStart(2, '0')}`;
            if (mesAnoPrazo > mes) return false;
            if (!r.dataconclusao) return true;
            const dataConclusao = new Date(r.dataconclusao);
            const mesAnoConclusao = `${dataConclusao.getFullYear()}-${String(dataConclusao.getMonth() + 1).padStart(2, '0')}`;
            return mesAnoConclusao > mes;
          });
        } else if (mes && contexto === 'executadas') {
          regs = regs.filter((r: any) => {
            if (!r.dataconclusao) return false;
            const dataConclusao = new Date(r.dataconclusao);
            const mesAnoConclusao = `${dataConclusao.getFullYear()}-${String(dataConclusao.getMonth() + 1).padStart(2, '0')}`;
            return mesAnoConclusao === mes;
          });
        }
        setRegistros(regs);
        setTasksMap({}); // Não usa mais Bitrix
      })
      .catch(err => setError(err.message || 'Erro ao buscar detalhes.'))
      .finally(() => setLoading(false));
  }, [open, idgrupobitrix, mes, contexto]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 text-xl font-bold">×</button>
        <h3 className="text-lg font-black mb-2 text-emerald-700">
          Detalhes das Atividades do Grupo {idgrupobitrix}{grupoNome ? ` - ${grupoNome}` : ''}
          {mes ? <span className="ml-2 text-xs text-indigo-700">({mes})</span> : null}
        </h3>
        {loading ? (
          <div className="text-center py-8">Carregando...</div>
        ) : error ? (
          <div className="text-center text-red-600 py-8">{error}</div>
        ) : registros.length === 0 ? (
          <div className="text-center text-slate-500 py-8">Nenhuma atividade encontrada para este grupo.</div>
        ) : (
          <div className="overflow-x-auto max-h-[60vh]">
            <table className="w-full text-left border">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-xs font-bold text-gray-500 uppercase">ID Task</th>
                  <th className="px-3 py-2 text-xs font-bold text-gray-500 uppercase">Descrição</th>
                  <th className="px-3 py-2 text-xs font-bold text-gray-500 uppercase">Responsável</th>
                  <th className="px-3 py-2 text-xs font-bold text-gray-500 uppercase">Prazo Final</th>
                  <th className="px-3 py-2 text-xs font-bold text-gray-500 uppercase">Data Conclusão</th>
                </tr>
              </thead>
              <tbody>
                {(() => { console.log('DEBUG tasksMap', tasksMap, 'registros', registros); return null; })()}
                {registros.map((r, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-3 py-2 text-sm">{r.idtask}</td>
                    <td className="px-3 py-2 text-sm">
                      <TituloTask idtask={r.idtask} />
                    </td>
                    <td className="px-3 py-2 text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 shrink-0">
                          <UserIcon size={14} />
                        </span>
                        <span>{r.responsavel_nome || r.responsavel || <span className="text-slate-400">-</span>}</span>
                      </span>
                    </td>

                    <td className="px-3 py-2 text-sm">{r.dataprazofinal ? new Date(r.dataprazofinal).toLocaleDateString() : '-'}</td>
                    <td className="px-3 py-2 text-sm">{r.dataconclusao ? new Date(r.dataconclusao).toLocaleDateString() : '-'}</td>
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

// Componente para buscar e exibir o título da task pela API /api/bbitrixtask/{id}
function TituloTask({ idtask }: { idtask: number }) {
  const [titulo, setTitulo] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!idtask) return;
    axios.get(`${API_BASE_URL}/api/bbitrixtask/${idtask}`)
      .then(res => setTitulo(res.data?.title || null))
      .catch(() => setTitulo(null));
  }, [idtask]);
  return <>{titulo ? titulo : <span className="text-slate-400">-</span>}</>;
}

export default DetalhesAtividadesModal;
