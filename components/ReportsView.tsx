
import React, { useMemo } from 'react';
import { FinancialData } from '../types';
import { formatCurrency, formatDateBR } from '../utils';
import { 
  Download, 
  Upload, 
  Trash, 
  Table as TableIcon, 
  PieChart as PieIcon,
  AlertTriangle
} from 'lucide-react';
import { clearAllData } from '../services/storageService';

interface Props {
  data: FinancialData;
  setData: (data: FinancialData) => void;
  showNotification: (m: string, t?: 'success' | 'error') => void;
}

const ReportsView: React.FC<Props> = ({ data, setData, showNotification }) => {
  const monthlySummary = useMemo(() => {
    const summary: Record<string, { revenue: number, expense: number }> = {};
    
    data.vendas.forEach(v => {
      const monthKey = v.data.substring(0, 7);
      if (!summary[monthKey]) summary[monthKey] = { revenue: 0, expense: 0 };
      summary[monthKey].revenue += v.valorTotal;
    });

    data.despesas.forEach(e => {
      const monthKey = e.data.substring(0, 7);
      if (!summary[monthKey]) summary[monthKey] = { revenue: 0, expense: 0 };
      summary[monthKey].expense += e.valor;
    });

    return Object.entries(summary)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([month, totals]) => ({
        month,
        ...totals,
        profit: totals.revenue - totals.expense
      }));
  }, [data]);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_delicias_das_marias_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Backup exportado com sucesso!');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported.vendas && imported.despesas && imported.config) {
          setData(imported);
          showNotification('Dados importados com sucesso!');
        } else {
          showNotification('Arquivo inválido!', 'error');
        }
      } catch (err) {
        showNotification('Erro ao ler arquivo!', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('ATENÇÃO: Isso apagará TODOS os dados permanentemente. Você tem um backup?')) {
      if (confirm('TEM CERTEZA ABSOLUTA? Clique em OK para confirmar a exclusão total.')) {
        clearAllData();
        window.location.reload();
      }
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Relatórios e Ferramentas</h2>
        <p className="text-slate-500">Resumo histórico e utilitários do sistema.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Monthly Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b flex items-center gap-2">
            <TableIcon className="text-indigo-500" size={20} />
            <h4 className="font-bold">Resumo por Mês</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">Mês</th>
                  <th className="px-6 py-4">Receitas</th>
                  <th className="px-6 py-4">Despesas</th>
                  <th className="px-6 py-4 text-right">Lucro</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {monthlySummary.map(item => (
                  <tr key={item.month} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold capitalize">
                      {new Date(item.month + '-02').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-emerald-600">{formatCurrency(item.revenue)}</td>
                    <td className="px-6 py-4 text-rose-600">{formatCurrency(item.expense)}</td>
                    <td className={`px-6 py-4 text-right font-black ${item.profit >= 0 ? 'text-slate-700' : 'text-rose-600'}`}>
                      {formatCurrency(item.profit)}
                    </td>
                  </tr>
                ))}
                {monthlySummary.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400 italic">Sem histórico.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Management */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h4 className="font-bold mb-4 flex items-center gap-2 text-slate-700">
              <Download className="text-blue-500" size={20} />
              Backup e Dados
            </h4>
            <div className="space-y-4">
              <button 
                onClick={handleExport}
                className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Download size={18} />
                  <div className="text-left">
                    <p className="font-bold leading-none">Exportar JSON</p>
                    <p className="text-xs opacity-70">Salvar backup do sistema</p>
                  </div>
                </div>
              </button>

              <label className="w-full flex items-center justify-between px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <Upload size={18} />
                  <div className="text-left">
                    <p className="font-bold leading-none">Importar JSON</p>
                    <p className="text-xs opacity-70">Restaurar dados de backup</p>
                  </div>
                </div>
                <input type="file" accept=".json" className="hidden" onChange={handleImport} />
              </label>
            </div>
          </div>

          <div className="bg-rose-50 p-6 rounded-2xl shadow-sm border border-rose-100">
            <h4 className="font-bold mb-2 flex items-center gap-2 text-rose-700">
              <AlertTriangle size={20} />
              Zona de Perigo
            </h4>
            <p className="text-rose-600 text-sm mb-4">
              A limpeza de dados removerá permanentemente todas as suas vendas e despesas do navegador.
            </p>
            <button 
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-rose-600/20"
            >
              <Trash size={18} />
              Limpar Todos os Dados
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
