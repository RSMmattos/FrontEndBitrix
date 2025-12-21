// ...existing code...
// ...existing code...
// ...existing code...
import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, RefreshCw, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { GroupLink, CostCenter, BitrixGroup } from '../types';



interface GroupLinkListProps {
  hideAddButton?: boolean;
}

export const GroupLinkList: React.FC<GroupLinkListProps> = ({ hideAddButton }) => {
  const [success, setSuccess] = useState<string | null>(null);
  const [groupLinks, setGroupLinks] = useState<GroupLink[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [bitrixGroups, setBitrixGroups] = useState<BitrixGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingLink, setEditingLink] = useState<GroupLink | null>(null);
  const [formData, setFormData] = useState({ codccusto: '', id_grupo: '' });

  const fetchGroupLinks = async () => {
    const response = await fetch('http://localhost:3000/api/bgcatividade');
    if (!response.ok) throw new Error('Erro ao carregar vínculos');
    return await response.json();
  };

  const fetchCostCenters = async () => {
    const response = await fetch('http://localhost:3000/api/gccusto');
    if (!response.ok) throw new Error('Erro ao carregar centros de custo');
    const data = await response.json();
    return data.filter((cc: CostCenter) => cc.ativo);
  };

  const fetchBitrixGroups = async () => {
    try {
      console.log('Fetching Bitrix groups...');
      const response = await fetch('https://agroserra.bitrix24.com.br/rest/187/wdalwcekbog0ke1r/sonet_group.get');
      console.log('Response status:', response.status);
      if (!response.ok) {
        setError(`Erro ao carregar grupos do Bitrix: ${response.status}`);
        return [];
      }
      let data;
      try {
        data = await response.json();
      } catch (jsonErr) {
        setError('Erro ao interpretar resposta da API do Bitrix. Resposta não é JSON válido.');
        return [];
      }
      console.log('Response data:', data);
      // Exibe a resposta bruta na tela para debug
      if (!data || (!data.result && !Array.isArray(data))) {
        setError('Formato inesperado da resposta da API do Bitrix. Veja o console para detalhes. Resposta bruta: ' + JSON.stringify(data));
        return [];
      }
      if (data.result && Array.isArray(data.result)) {
        // Normaliza IDs para string
        return data.result.map((g: any) => ({ ...g, ID: g.ID?.toString?.() }));
      } else if (Array.isArray(data)) {
        return data.map((g: any) => ({ ...g, ID: g.ID?.toString?.() }));
      } else {
        setError('Formato inesperado da resposta da API do Bitrix. Veja o console para detalhes. Resposta bruta: ' + JSON.stringify(data));
        return [];
      }
    } catch (err: any) {
      setError(`Erro ao carregar grupos do Bitrix: ${err.message || err}`);
      return [];
    }
  };

  // Função movida para cima para garantir visibilidade no useEffect
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [links, centers] = await Promise.all([
        fetchGroupLinks(),
        fetchCostCenters()
      ]);
      setGroupLinks(links);
      setCostCenters(centers);

      // Fetch bitrix groups separadamente
      try {
        const groups = await fetchBitrixGroups();
        setBitrixGroups(groups);
      } catch (err: any) {
        console.warn('Aviso ao carregar grupos do Bitrix:', err);
        setError(`Aviso: Não foi possível carregar grupos do Bitrix. Você poderá criar vínculos manualmente. Erro: ${err.message}`);
        setBitrixGroups([]);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (codccusto: string) => {
    if (window.confirm('Tem certeza que deseja excluir este vínculo? Esta ação não poderá ser desfeita.')) {
      try {
        const response = await fetch(`http://localhost:3000/api/bgcatividade/${codccusto}`, {
          method: 'DELETE'
        });
        if (!response.ok) {
          const msg = await response.text();
          throw new Error('Erro ao excluir: ' + msg);
        }
        await loadData();
        setSuccess('Vínculo excluído com sucesso!');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err: any) {
        setError('Erro ao excluir: ' + (err.message || err.toString()));
      }
    }
  };

  const startEdit = (link: GroupLink) => {
    setEditingLink(link);
    setFormData({ codccusto: link.codccusto, id_grupo: link.id_grupo?.toString() });
    setShowModal(true);
  };


  const handleSave = async () => {
    try {
      const payload = {
        codccusto: formData.codccusto,
        id_grupo: formData.id_grupo ? parseInt(formData.id_grupo) : null
      };
      const url = editingLink
        ? `http://localhost:3000/api/bgcatividade/${editingLink.codccusto}`
        : 'http://localhost:3000/api/bgcatividade';
      const method = editingLink ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const msg = await response.text();
        throw new Error('Erro ao salvar: ' + msg);
      }
      await loadData();
      setShowModal(false);
      setEditingLink(null);
      setFormData({ codccusto: '', id_grupo: '' });
      setSuccess(editingLink ? 'Vínculo editado com sucesso!' : 'Vínculo criado com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError('Erro ao salvar: ' + (err.message || err.toString()));
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingLink(null);
    setFormData({ codccusto: '', id_grupo: '' });
  };

  try {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-emerald-500" size={32} />
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-3 m-8">
          <AlertCircle size={20} />
          {error}
          <button onClick={() => setError(null)} className="ml-auto">
            <X size={16} />
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-sm font-bold flex items-center gap-3">
            <Save size={20} />
            {success}
          </div>
        )}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900">Vínculos Grupo</h2>
          <div className="flex gap-2">
            <button onClick={loadData} className="bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-700 flex items-center gap-2">
              <RefreshCw size={16} />
              Atualizar
            </button>
            {!hideAddButton && (
              <button onClick={() => setShowModal(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 flex items-center gap-2">
                <Plus size={16} />
                Novo Vínculo
              </button>
            )}
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full mx-4">
              <h3 className="text-lg font-bold mb-4">{editingLink ? 'Editar Vínculo' : 'Novo Vínculo'}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Centro de Custo</label>
                  {editingLink ? (
                    <input value={formData.codccusto} disabled className="w-full px-3 py-2 border rounded-lg bg-gray-100" />
                  ) : (
                    <select
                      value={formData.codccusto}
                      onChange={(e) => setFormData({ ...formData, codccusto: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="">Selecione...</option>
                      {costCenters.map(cc => (
                        <option key={cc.codccusto} value={cc.codccusto}>
                          {cc.codccusto} - {cc.nome}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Grupo Bitrix</label>
                  <select
                    value={formData.id_grupo}
                    onChange={(e) => setFormData({ ...formData, id_grupo: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Selecione...</option>
                    {bitrixGroups.length > 0 ? (
                      bitrixGroups.map((group, idx) => {
                        if (group && typeof group === 'object' && group.ID && group.NAME) {
                          return (
                            <option key={group.ID} value={group.ID}>
                              {group.ID} - {group.NAME}
                            </option>
                          );
                        } else {
                          // fallback para debug
                          return (
                            <option key={idx} value={group?.ID || idx}>
                              {group?.ID || idx} - {group?.NAME || JSON.stringify(group)}
                            </option>
                          );
                        }
                      })
                    ) : (
                      <option disabled value="">Nenhum grupo encontrado</option>
                    )}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button onClick={handleSave} className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 flex-1 justify-center">
                  <Save size={16} />
                  Salvar
                </button>
                <button onClick={resetForm} className="bg-gray-500 text-white px-4 py-2 rounded-lg flex-1">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Centro de Custo</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">ID Grupo</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Nome Grupo</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {groupLinks.map(link => {
                const costCenter = costCenters.find(cc => cc.codccusto === link.codccusto);
                const idGrupoStr = link.id_grupo !== undefined && link.id_grupo !== null ? link.id_grupo.toString() : '';
                const bitrixGroup = Array.isArray(bitrixGroups) ? bitrixGroups.find(bg => bg && bg.ID?.toString() === idGrupoStr) : undefined;
                return (
                  <tr key={link.codccusto} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{link.codccusto}</td>
                    <td className="px-6 py-4 text-sm">{costCenter?.nome || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm">{idGrupoStr} <span style={{color:'#aaa',fontSize:'10px'}}>({bitrixGroup?.ID || 'N/A'})</span></td>
                    <td className="px-6 py-4 text-sm">{bitrixGroup?.NAME || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-right">
                      <button onClick={() => startEdit(link)} className="text-blue-600 hover:text-blue-800 mr-2">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(link.codccusto)} className="text-red-600 hover:text-red-800">
                        <Trash2 size={16} />
                      </button>
                    </td>
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
      </div>
    );
  } catch (e: any) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-3 m-8">
        <AlertCircle size={20} />
        Erro crítico ao renderizar: {e?.message || e?.toString()}
      </div>
    );
  }
}