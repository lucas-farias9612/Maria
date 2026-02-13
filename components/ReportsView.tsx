
import React, { useMemo } from 'react';
import { FinancialData } from '../types';
import { formatCurrency, formatDateTimeBR } from '../utils';
import { 
  FileText, 
  Trash, 
  Table as TableIcon, 
  AlertTriangle,
  Clock
} from 'lucide-react';
import { clearAllData } from '../services/storageService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Props {
  data: FinancialData;
  setData: (data: FinancialData) => void;
  showNotification: (m: string, t?: 'success' | 'error') => void;
}

const ReportsView: React.FC<Props> = ({ data, setData, showNotification }) => {
  const currentDateTime = formatDateTimeBR(new Date().toISOString());

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

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const currentDate = new Date();

    // === PÁGINA 1: RESUMO MENSAL ===
    
    // Cabeçalho
    doc.setFontSize(22);
    doc.setTextColor(236, 72, 153); // Pink-500
    doc.text("Delícias das Maria's", 14, 20);
    
    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text("Relatório Financeiro - Resumo", 14, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Gerado em: ${currentDate.toLocaleDateString('pt-BR')} às ${currentDate.toLocaleTimeString('pt-BR')}`, 14, 38);

    // Dados da Tabela Resumo
    const summaryTableData = monthlySummary.map(item => [
      new Date(item.month + '-02').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
      formatCurrency(item.revenue),
      formatCurrency(item.expense),
      formatCurrency(item.profit)
    ]);

    const totalRevenue = monthlySummary.reduce((acc, curr) => acc + curr.revenue, 0);
    const totalExpense = monthlySummary.reduce((acc, curr) => acc + curr.expense, 0);
    const totalProfit = totalRevenue - totalExpense;

    autoTable(doc, {
      head: [['Mês', 'Receitas', 'Despesas', 'Lucro']],
      body: summaryTableData,
      startY: 45,
      styles: { fontSize: 11, cellPadding: 5 },
      headStyles: { fillColor: [236, 72, 153], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [253, 242, 248] },
      columnStyles: {
        0: { cellWidth: 'auto', fontStyle: 'bold' },
        1: { halign: 'right', textColor: [16, 185, 129] },
        2: { halign: 'right', textColor: [225, 29, 72] },
        3: { halign: 'right', fontStyle: 'bold' }
      },
      foot: [['TOTAL GERAL', formatCurrency(totalRevenue), formatCurrency(totalExpense), formatCurrency(totalProfit)]],
      footStyles: { fillColor: [241, 245, 249], textColor: 50, fontStyle: 'bold' }
    });

    // === PÁGINA 2: DETALHAMENTO COMPLETO ===
    doc.addPage();
    doc.setFontSize(16);
    doc.setTextColor(100);
    doc.text("Detalhamento de Movimentações", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("Lista completa de vendas e despesas por data e hora", 14, 26);

    // Prepara dados detalhados
    const allTransactions = [
      ...data.vendas.map(v => ({
        date: v.data,
        desc: v.descricao,
        cat: v.categoria,
        type: 'Venda',
        value: v.valorTotal
      })),
      ...data.despesas.map(d => ({
        date: d.data,
        desc: d.descricao,
        cat: d.categoria,
        type: 'Despesa',
        value: d.valor
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const detailsTableData = allTransactions.map(item => [
      formatDateTimeBR(item.date),
      item.desc,
      item.cat,
      item.type,
      formatCurrency(item.value)
    ]);

    autoTable(doc, {
      head: [['Data e Hora', 'Descrição', 'Categoria', 'Tipo', 'Valor']],
      body: detailsTableData,
      startY: 35,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [71, 85, 105], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 35 }, // Data
        3: { fontStyle: 'bold' }, // Tipo
        4: { halign: 'right' } // Valor
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 3) {
            if (data.cell.raw === 'Venda') {
                data.cell.styles.textColor = [16, 185, 129]; // Emerald
            } else {
                data.cell.styles.textColor = [225, 29, 72]; // Rose
            }
        }
      }
    });

    doc.save(`relatorio_completo_${currentDate.toISOString().split('T')[0]}.pdf`);
    showNotification('Relatório completo (PDF) gerado!');
  };

  const handleReset = () => {
    if (confirm('ATENÇÃO: Isso apagará TODOS os dados do sistema permanentemente.')) {
      if (confirm('Tem certeza? Essa ação não pode ser desfeita.')) {
        clearAllData();
        window.location.reload();
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Relatórios</h2>
          <p className="text-slate-500">Visualize o desempenho e exporte os dados.</p>
        </div>
        <div className="text-right hidden sm:block">
           <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-500">
             <Clock size={12} />
             Atualizado: {currentDateTime}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Monthly Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TableIcon className="text-pink-500" size={20} />
              <h4 className="font-bold text-slate-700">Resumo por Mês</h4>
            </div>
            <span className="sm:hidden text-[10px] text-slate-400 font-medium">{currentDateTime}</span>
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
                    <td className="px-6 py-4 font-bold capitalize text-slate-700">
                      {new Date(item.month + '-02').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-emerald-600 font-medium">{formatCurrency(item.revenue)}</td>
                    <td className="px-6 py-4 text-rose-600 font-medium">{formatCurrency(item.expense)}</td>
                    <td className={`px-6 py-4 text-right font-black ${item.profit >= 0 ? 'text-slate-700' : 'text-rose-600'}`}>
                      {formatCurrency(item.profit)}
                    </td>
                  </tr>
                ))}
                {monthlySummary.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400 italic">Nenhum dado registrado ainda.</td>
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
              <FileText className="text-pink-500" size={20} />
              Relatório Completo
            </h4>
            <p className="text-slate-500 text-sm mb-4">
              Gere um PDF contendo o resumo mensal E a lista detalhada de todas as vendas e despesas com <strong>data e hora</strong>.
            </p>
            
            <button 
              onClick={handleExportPDF}
              className="w-full flex items-center justify-between px-4 py-4 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-all group active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="bg-pink-100 p-2 rounded-lg text-pink-600 group-hover:bg-pink-200 transition-colors">
                   <FileText size={20} />
                </div>
                <div className="text-left">
                  <p className="font-bold leading-none text-slate-800">Baixar PDF Detalhado</p>
                  <p className="text-xs text-slate-400 mt-1">Inclui data e hora de cada item</p>
                </div>
              </div>
            </button>
          </div>

          <div className="bg-rose-50 p-6 rounded-2xl shadow-sm border border-rose-100">
            <h4 className="font-bold mb-2 flex items-center gap-2 text-rose-700">
              <AlertTriangle size={20} />
              Zona de Perigo
            </h4>
            <p className="text-rose-600 text-sm mb-4">
              Deseja recomeçar do zero? Esta ação irá apagar todas as vendas e despesas registradas.
            </p>
            <button 
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white font-bold rounded-xl transition-colors"
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
