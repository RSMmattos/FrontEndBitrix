import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, RefreshCw, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { GroupLink, CostCenter, BitrixGroup } from '../types';
import { API_BASE_URL } from '../constants';

interface GroupLinkListProps {
	hideAddButton?: boolean;
}

export const GroupLinkList: React.FC<GroupLinkListProps> = ({ hideAddButton }) => {
	const [groupLinks, setGroupLinks] = useState<{ codccusto: string; idgrupobitrix: number }[]>([]);
	const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
	const [bitrixGroups, setBitrixGroups] = useState<BitrixGroup[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showModal, setShowModal] = useState(false);
	const [editingLink, setEditingLink] = useState<GroupLink | null>(null);
	const [formData, setFormData] = useState({ codccusto: '', idtask: '' });
	const [success, setSuccess] = useState<string | null>(null);

	// Carregar dados
	const loadAll = async () => {
		setLoading(true);
		setError(null);
		try {
			const [links, centers] = await Promise.all([
				fetch(`${API_BASE_URL}/api/bgcatividade`).then(r => r.json()),
				fetch(`${API_BASE_URL}/api/gccusto`).then(r => r.json())
			]);
			setGroupLinks(links);
			setCostCenters(centers.filter((cc: CostCenter) => cc.ativo));
			// Bitrix groups não bloqueia
			fetch('https://agroserra.bitrix24.com.br/rest/187/wdalwcekbog0ke1r/sonet_group.get')
				.then(r => r.json())
				.then(data => {
					if (data.result && Array.isArray(data.result)) {
						setBitrixGroups(data.result.map((g: any) => ({ ...g, ID: g.ID?.toString?.() })));
					} else {
						setBitrixGroups([]);
					}
				})
				.catch(() => setBitrixGroups([]));
		} catch (err: any) {
			setError('Erro ao carregar dados: ' + (err.message || err.toString()));
		}
		setLoading(false);
	};
	useEffect(() => { loadAll(); }, []);

	// Salvar vínculo

	const handleSave = async () => {
		// Validação 1-para-1
		const grupoSelecionado = formData.idtask ? parseInt(formData.idtask) : null;
		const centroSelecionado = formData.codccusto;
		// Se for novo vínculo
		if (!editingLink) {
			if (groupLinks.some(link => link.codccusto === centroSelecionado)) {
				setError('Este Centro de Custo já está vinculado a um Grupo.');
				return;
			}
			if (groupLinks.some(link => link.idgrupobitrix === grupoSelecionado)) {
				setError('Este Grupo já está vinculado a um Centro de Custo.');
				return;
			}
		} else {
			// Se for edição, permitir manter o mesmo vínculo, mas não permitir duplicidade
			if (groupLinks.some(link => link.codccusto === centroSelecionado && link.codccusto !== editingLink.codccusto)) {
				setError('Este Centro de Custo já está vinculado a um Grupo.');
				return;
			}
			if (groupLinks.some(link => link.idgrupobitrix === grupoSelecionado && link.codccusto !== editingLink.codccusto)) {
				setError('Este Grupo já está vinculado a um Centro de Custo.');
				return;
			}
		}
		try {
			const payload = {
				codccusto: formData.codccusto,
				idgrupobitrix: grupoSelecionado
			};
			const url = editingLink
				? `${API_BASE_URL}/api/bgcatividade/${editingLink.codccusto}`
				: `${API_BASE_URL}/api/bgcatividade`;
			const method = editingLink ? 'PUT' : 'POST';
			const response = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			if (!response.ok) throw new Error('Erro ao salvar');
			setShowModal(false);
			setEditingLink(null);
			setFormData({ codccusto: '', idtask: '' });
			setSuccess(editingLink ? 'Vínculo editado com sucesso!' : 'Vínculo criado com sucesso!');
			setTimeout(() => setSuccess(null), 3000);
			// Atualiza lista
			const links = await fetch(`${API_BASE_URL}/api/bgcatividade`).then(r => r.json());
			setGroupLinks(links);
		} catch (err: any) {
			setError('Erro ao salvar: ' + (err.message || err.toString()));
		}
	};

	// Excluir vínculo
	const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; codccusto: string | null }>({ open: false, codccusto: null });

	const handleDelete = async (codccusto: string) => {
		setConfirmDelete({ open: true, codccusto });
	};

	const confirmDeleteAction = async () => {
		if (!confirmDelete.codccusto) return;
		try {
			const response = await fetch(`${API_BASE_URL}/api/bgcatividade/${confirmDelete.codccusto}`, { method: 'DELETE' });
			if (!response.ok) throw new Error('Erro ao excluir');
			setSuccess('Vínculo excluído com sucesso!');
			setTimeout(() => setSuccess(null), 3000);
			// Atualiza lista após exclusão
			const links = await fetch(`${API_BASE_URL}/api/bgcatividade`).then(r => r.json());
			setGroupLinks(links);
		} catch (err: any) {
			setError('Erro ao excluir: ' + (err.message || err.toString()));
		}
		setConfirmDelete({ open: false, codccusto: null });
	};

	const cancelDeleteAction = () => {
		setConfirmDelete({ open: false, codccusto: null });
	};
			{/* Modal de confirmação de exclusão */}
			{confirmDelete.open && (
				<div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full mx-4">
						<h3 className="text-lg font-bold mb-4 text-rose-700 flex items-center gap-2"><Trash2 size={20}/> Confirmar Exclusão</h3>
						<p className="mb-6 text-gray-700">Tem certeza que deseja <span className='font-bold text-rose-600'>excluir</span> este vínculo? Esta ação não poderá ser desfeita.</p>
						<div className="flex gap-2 mt-4">
							<button onClick={confirmDeleteAction} className="bg-rose-600 text-white px-4 py-2 rounded-lg flex-1 font-bold hover:bg-rose-700">Excluir</button>
							<button onClick={cancelDeleteAction} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex-1 font-bold hover:bg-gray-300">Cancelar</button>
						</div>
					</div>
				</div>
			)}

	// Editar vínculo
	const startEdit = (link: GroupLink) => {
		setEditingLink(link);
		setFormData({ codccusto: link.codccusto, idtask: link.idtask?.toString() });
		setShowModal(true);
	};

	// Resetar formulário
	const resetForm = () => {
		setShowModal(false);
		setEditingLink(null);
		setFormData({ codccusto: '', idtask: '' });
	};

	if (loading) {
		return <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-emerald-500" size={32} /></div>;
	}
	if (error) {
		return <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-3 m-8"><AlertCircle size={20} />{error}<button onClick={() => setError(null)} className="ml-auto"><X size={16} /></button></div>;
	}

	return (
		<>
			{confirmDelete.open && (
				<div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full mx-4">
						<h3 className="text-lg font-bold mb-4 text-rose-700 flex items-center gap-2"><Trash2 size={20}/> Confirmar Exclusão</h3>
						<p className="mb-6 text-gray-700">Tem certeza que deseja <span className='font-bold text-rose-600'>excluir</span> este vínculo? Esta ação não poderá ser desfeita.</p>
						<div className="flex gap-2 mt-4">
							<button onClick={confirmDeleteAction} className="bg-rose-600 text-white px-4 py-2 rounded-lg flex-1 font-bold hover:bg-rose-700">Excluir</button>
							<button onClick={cancelDeleteAction} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex-1 font-bold hover:bg-gray-300">Cancelar</button>
						</div>
					</div>
				</div>
			)}
			<div className="space-y-4">
				{success && <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-sm font-bold flex items-center gap-3"><Save size={20} />{success}</div>}
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-black text-slate-900">Vínculos Grupo</h2>
					<div className="flex gap-2">
						<button onClick={loadAll} className="bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-700 flex items-center gap-2"><RefreshCw size={16} />Atualizar</button>
						{!hideAddButton && <button onClick={() => setShowModal(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 flex items-center gap-2"><Plus size={16} />Novo Vínculo</button>}
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
										<select value={formData.codccusto} onChange={e => setFormData({ ...formData, codccusto: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
											<option value="">Selecione...</option>
											{costCenters.map(cc => <option key={cc.codccusto} value={cc.codccusto}>{cc.codccusto} - {cc.nome}</option>)}
										</select>
									)}
								</div>
								<div>
									<label className="block text-sm font-medium mb-2">Grupo Bitrix</label>
									<select value={formData.idtask} onChange={e => setFormData({ ...formData, idtask: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
										<option value="">Selecione...</option>
										{bitrixGroups.length > 0 ? (
											bitrixGroups.map((group, idx) => (
												<option key={group.ID || idx} value={group.ID}>{group.ID} - {group.NAME}</option>
											))
										) : (
											<option disabled value="">Nenhum grupo encontrado</option>
										)}
									</select>
								</div>
							</div>
							<div className="flex gap-2 mt-6">
								<button onClick={handleSave} className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 flex-1 justify-center"><Save size={16} />Salvar</button>
								<button onClick={resetForm} className="bg-gray-500 text-white px-4 py-2 rounded-lg flex-1">Cancelar</button>
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
								const idGrupoStr = link.idgrupobitrix !== undefined && link.idgrupobitrix !== null ? link.idgrupobitrix.toString() : '';
								const bitrixGroup = Array.isArray(bitrixGroups) ? bitrixGroups.find(bg => bg && bg.ID?.toString() === idGrupoStr) : undefined;
								return (
									<tr key={link.codccusto} className="border-t hover:bg-gray-50">
										<td className="px-6 py-4 text-sm">{link.codccusto}</td>
										<td className="px-6 py-4 text-sm">{costCenter?.nome || 'N/A'}</td>
										<td className="px-6 py-4 text-sm">{idGrupoStr} <span style={{color:'#aaa',fontSize:'10px'}}>({bitrixGroup?.ID || 'N/A'})</span></td>
										<td className="px-6 py-4 text-sm">{bitrixGroup?.NAME || 'N/A'}</td>
										<td className="px-6 py-4 text-sm text-right">
											<button onClick={() => startEdit(link)} className="text-blue-600 hover:text-blue-800 mr-2"><Edit size={16} /></button>
											<button onClick={() => handleDelete(link.codccusto)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
										</td>
									</tr>
								);
							})}
							{groupLinks.length === 0 && (
								<tr>
									<td colSpan={5} className="px-6 py-12 text-center text-gray-500">Nenhum vínculo encontrado</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</>
	);
};
