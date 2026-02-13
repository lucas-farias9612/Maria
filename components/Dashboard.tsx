
import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { FinancialData } from '../types';
import { formatCurrency, getCurrentMonthYear, formatDateTimeBR } from '../utils';
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight, Edit3, Clock } from 'lucide-react';

interface Props {
  data: FinancialData;
  updateConfig: (meta: number) => void;
}

const Dashboard: React.FC<Props> = ({ data, updateConfig }) => {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthYear());
  const [showGoalEditor, setShowGoalEditor] = useState(false);
  const [tempGoal, setTempGoal] = useState(data.config.metaLucroMensal.toString());

  const monthData = useMemo(() => {
    const [year, month] = selectedMonth.split('-');
    const sales = data.vendas.filter(s => s.data.startsWith(selectedMonth));
    const expenses = data.despesas.filter(e => e.data.startsWith(selectedMonth));
    
    const revenue = sales.reduce((acc, s) => acc + s.valorTotal, 0);
    const cost = expenses.reduce((acc, e) => acc + e.valor, 0);
    const profit = revenue - cost;

    return { sales, expenses, revenue, cost, profit };
  }, [data, selectedMonth]);

  const dailyData = useMemo(() => {
    const daysInMonth = new Date(parseInt(selectedMonth.split('-')[0]), parseInt(selectedMonth.split('-')[1]), 0).getDate();
    const chartData = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const dayStr = `${selectedMonth}-${String(i).padStart(2, '0')}`;
      const daySales = monthData.sales.filter(s => s.data.startsWith(dayStr)).reduce((acc, s) => acc + s.valorTotal, 0);
      const dayExpenses = monthData.expenses.filter(e => e.data.startsWith(dayStr)).reduce((acc, e) => acc + e.valor, 0);
      chartData.push({ day: i, profit: daySales - dayExpenses });
    }
    return chartData;
  }, [monthData, selectedMonth]);

  const recentTransactions = useMemo(() => {
    // Junta vendas e despesas do mês selecionado
    const all = [
      ...monthData.sales.map(s => ({ ...s, type: 'sale', value: s.valorTotal })),
      ...monthData.expenses.map(e => ({ ...e, type: 'expense', value: e.valor }))
    ];
    // Ordena por data (mais recente primeiro) e pega os 5
    return all.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).slice(0, 5);
  }, [monthData]);

  const goalProgress = (monthData.profit / data.config.metaLucroMensal) * 100;

  const changeMonth = (offset: number) => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const date = new Date(y, m - 1 + offset, 1);
    setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  return (
    <div className="space-y-6">
      {/* Month Selector */}
      <div className="flex items-center justify-between bg-white p-2 rounded-xl shadow-sm border border-slate-100">
        <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><ChevronLeft /></button>
        <span className="font-bold text-lg text-slate-700 capitalize">
          {new Date(selectedMonth + '-02').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </span>
        <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><ChevronRight /></button>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-3">
        <article className="bg-emerald-500 text-white p-4 rounded-2xl shadow-lg shadow-emerald-500/20">
          <div className="flex items-center gap-2 mb-1 opacity-90">
            <TrendingUp size={16} />
            <span className="text-xs font-bold uppercase">Entradas</span>
          </div>
          <p className="text-xl font-bold truncate">{formatCurrency(monthData.revenue)}</p>
        </article>
        
        <article className="bg-rose-500 text-white p-4 rounded-2xl shadow-lg shadow-rose-500/20">
          <div className="flex items-center gap-2 mb-1 opacity-90">
            <TrendingDown size={16} />
            <span className="text-xs font-bold uppercase">Saídas</span>
          </div>
          <p className="text-xl font-bold truncate">{formatCurrency(monthData.cost)}</p>
        </article>
      </div>

      {/* Net Profit Big Card */}
      <article className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 text-center">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Lucro Líquido</p>
        <h2 className={`text-4xl font-black ${monthData.profit >= 0 ? 'text-slate-800' : 'text-rose-500'}`}>
          {formatCurrency(monthData.profit)}
        </h2>
        {monthData.revenue > 0 && (
          <span className="inline-block mt-2 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
            Margem: {((monthData.profit / monthData.revenue) * 100).toFixed(0)}%
          </span>
        )}
      </article>

      {/* Goal */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-slate-700 text-sm">Meta Mensal</h3>
          <button onClick={() => setShowGoalEditor(!showGoalEditor)} className="text-pink-500">
             <Edit3 size={16} />
          </button>
        </div>

        {showGoalEditor ? (
          <div className="flex gap-2 mb-4">
            <input type="number" value={tempGoal} onChange={e => setTempGoal(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50" />
            <button onClick={() => { updateConfig(parseFloat(tempGoal)); setShowGoalEditor(false); }} className="bg-pink-500 text-white px-4 rounded-lg font-bold">OK</button>
          </div>
        ) : (
          <div className="relative pt-1">
             <div className="flex items-end justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">{Math.max(0, goalProgress).toFixed(0)}%</span>
                <span className="text-xs font-bold text-slate-400">{formatCurrency(data.config.metaLucroMensal)}</span>
             </div>
             <div className="overflow-hidden h-3 text-xs flex rounded-full bg-slate-100">
               <div style={{ width: `${Math.min(100, Math.max(0, goalProgress))}%` }} 
                 className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-pink-500 transition-all duration-1000"></div>
             </div>
          </div>
        )}
      </div>

      {/* Mini Chart */}
      <div className="h-32 w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-2 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dailyData}>
            <defs>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#ec4899' }}
              labelStyle={{ display: 'none' }}
              formatter={(value: any) => [formatCurrency(value), '']}
            />
            <Area type="monotone" dataKey="profit" stroke="#ec4899" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Activity List (Detailed) */}
      <div className="space-y-2">
        <h3 className="font-bold text-slate-700 px-1 text-sm">Últimas Movimentações</h3>
        {recentTransactions.length === 0 ? (
          <p className="text-center text-slate-400 text-xs py-4">Nenhuma movimentação este mês.</p>
        ) : (
          recentTransactions.map((item) => (
            <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shrink-0
                  ${item.type === 'sale' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                   {item.type === 'sale' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-slate-700 truncate">{item.descricao}</span>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Clock size={10} />
                    <span>{formatDateTimeBR(item.data)}</span>
                  </div>
                </div>
              </div>
              <span className={`font-bold text-sm whitespace-nowrap ml-2 ${item.type === 'sale' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {item.type === 'sale' ? '+' : '-'}{formatCurrency(item.value)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
