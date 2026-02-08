import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://10.0.0.6:3001/api/bbitrixtask';

const TaskOpenSmartPage: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get(API_URL)
      .then(res => setTasks(res.data))
      .catch(err => setError(err.message || 'Erro ao carregar dados'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center">Carregando...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!tasks || tasks.length === 0) return <div className="p-8 text-center">Nenhum dado encontrado.</div>;

  const columns = tasks[0] ? Object.keys(tasks[0]) : [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto p-4">
      <h2 className="text-lg font-bold mb-4">Task Open Smart</h2>
      <table className="w-full text-left">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(col => (
              <th key={col} className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tasks.map((row, idx) => (
            <tr key={idx} className="border-t hover:bg-gray-50">
              {columns.map(col => (
                <td key={col} className="px-4 py-2 text-sm">{String(row[col])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskOpenSmartPage;
