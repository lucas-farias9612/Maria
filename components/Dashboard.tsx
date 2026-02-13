
import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { FinancialData } from '../types';
import { formatCurrency, getCurrentMonthYear } from '../utils';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Calculator,
  BarChart3
} from 'lucide-react';

interface Props {
  data: FinancialData;
  updateConfig: (meta: number) => void;
}

const Dashboard: React.FC<Props> = ({ data, updateConfig }) => {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthYear());
  const [showGoalEditor, setShowGoalEditor] = useState(false);
  const [tempGoal, setTempGoal] = useState(data.config.metaLucroMensal.toString());

  // Filter data for the selected month
  const monthData = useMemo(() => {
    const [year, month] = selectedMonth.split('-');
    const sales = data.vendas.filter(s => s.data.startsWith(selectedMonth));
    const expenses = data.despesas.filter(e => e.data.startsWith(selectedMonth));
    
    const revenue = sales.reduce((acc, s) => acc + s.valorTotal, 0);
    const cost = expenses.reduce((acc, e) => acc + e.valor, 0);
    const profit = revenue - cost;

    return { sales, expenses, revenue, cost, profit };
  }, [data, selectedMonth]);

  // Daily statistics for charts
  const dailyData = useMemo(() => {
    const daysInMonth = new Date(
      parseInt(selectedMonth.split('-')[0]),
      parseInt(selectedMonth.split('-')[1]),
      0
    ).getDate();

    const chartData = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const dayStr = `${selectedMonth}-${String(i).padStart(2, '0')}`;
      const daySales = monthData.sales.filter(s => s.data === dayStr).reduce((acc, s) => acc + s.valorTotal, 0);
      const dayExpenses = monthData.expenses.filter(e => e.data === dayStr).reduce((acc, e) => acc + e.valor, 0);
      chartData.push({
        day: i,
        Receita: daySales,
        Despesa: dayExpenses,
        Lucro: daySales - dayExpenses
      });
    }
    return chartData;
  }, [monthData, selectedMonth]);

  // Derived metrics
  const daysInCurrentMonth = dailyData.length;
  const daysWithMovement = dailyData.filter(d => d.Receita > 0 || d.Despesa > 0).length;
  const profitPerMovementDay = daysWithMovement > 0 ? monthData.profit / daysWithMovement : 0;
  const profitPerTotalDay = monthData.profit / daysInCurrentMonth;

  const goalProgress = (monthData.profit / data.config.metaLucroMensal) * 100;

  const changeMonth = (offset: number) => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const date = new Date(y, m - 1 + offset, 1);
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(newMonth);
  };

  const handleUpdateGoal = () => {
    const val = parseFloat(tempGoal);
    if (!isNaN(val)) {
      updateConfig(val);
      setShowGoalEditor(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Painel de Controle</h2>
          <p className="text-slate-500">Acompanhe o desempenho da sua confeitaria.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronLeft size={20}/></button>
          <div className="flex items-center gap-2 px-4 font-semibold text-slate-700 min-w-[140px] justify-center">
            <Calendar size={18} className="text-pink-500" />
            {new Date(selectedMonth + '-02').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </div>
          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronRight size={20}/></button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-pink-200 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
              <TrendingUp size={24} />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Receita Mensal</p>
          <h3 className="text-2xl font-bold mt-1">{formatCurrency(monthData.revenue)}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-pink-200 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-rose-100 p-3 rounded-xl text-rose-600">
              <TrendingDown size={24} />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Despesa Mensal</p>
          <h3 className="text-2xl font-bold mt-1">{formatCurrency(monthData.cost)}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-pink-200 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${monthData.profit >= 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'}`}>
              <DollarSign size={24} />
            </div>
            {monthData.revenue > 0 && (
               <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-100">
                {((monthData.profit / monthData.revenue) * 100).toFixed(1)}% Margem
               </span>
            )}
          </div>
          <p className="text-slate-500 text-sm font-medium">Lucro Líquido</p>
          <h3 className={`text-2xl font-bold mt-1 ${monthData.profit < 0 ? 'text-rose-500' : 'text-slate-900'}`}>
            {formatCurrency(monthData.profit)}
          </h3>
        </div>
      </div>

      {/* Goal and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-slate-700 flex items-center gap-2">
              <BarChart3 size={18} className="text-pink-500" />
              Desempenho Diário
            </h4>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(v) => `R$${v}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                  formatter={(value: any) => [formatCurrency(value), '']}
                />
                <Legend />
                <Area type="monotone" dataKey="Lucro" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorLucro)" />
                <Bar dataKey="Receita" fill="#10b981" radius={[4, 4, 0, 0]} opacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-700 flex items-center gap-2">
                <Target size={18} className="text-pink-500" />
                Meta Mensal
              </h4>
              <button 
                onClick={() => setShowGoalEditor(!showGoalEditor)}
                className="text-xs text-pink-500 font-semibold hover:underline"
              >
                Editar
              </button>
            </div>
            
            {showGoalEditor ? (
              <div className="flex gap-2">
                <input 
                  type="number" 
                  value={tempGoal}
                  onChange={(e) => setTempGoal(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                />
                <button onClick={handleUpdateGoal} className="bg-pink-500 text-white px-3 py-2 rounded-lg font-bold">Salvar</button>
              </div>
            ) : (
              <>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-3xl font-black text-slate-800">{Math.max(0, goalProgress).toFixed(0)}%</span>
                  <span className="text-sm text-slate-500">de {formatCurrency(data.config.metaLucroMensal)}</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-pink-500 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, Math.max(0, goalProgress))}%` }}
                  ></div>
                </div>
                <p className="mt-4 text-xs text-slate-400 leading-relaxed italic">
                  {goalProgress >= 100 ? "🎉 Parabéns! Você atingiu sua meta de lucro!" : `Faltam ${formatCurrency(data.config.metaLucroMensal - monthData.profit)} para sua meta.`}
                </p>
              </>
            )}
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
             <h4 className="font-bold mb-4 flex items-center gap-2">
                <Calculator size={18} className="text-pink-400" />
                Médias Diárias
              </h4>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Lucro / Dia (Total)</p>
                  <p className="text-xl font-bold">{formatCurrency(profitPerTotalDay)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Lucro / Dia com Movimento</p>
                  <p className="text-xl font-bold">{formatCurrency(profitPerMovementDay)}</p>
                  <p className="text-[10px] text-slate-500 mt-1">* {daysWithMovement} dias com vendas ou despesas.</p>
                </div>
              </div>
          </div>
        </div>
      </div>

      {/* Daily Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b">
          <h4 className="font-bold text-slate-700">Resumo Diário</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Dia</th>
                <th className="px-6 py-4">Receitas</th>
                <th className="px-6 py-4">Despesas</th>
                <th className="px-6 py-4 text-right">Lucro</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {dailyData.filter(d => d.Receita > 0 || d.Despesa > 0).map(d => (
                <tr key={d.day} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium">{String(d.day).padStart(2, '0')}/{selectedMonth.split('-')[1]}</td>
                  <td className="px-6 py-4 text-emerald-600 font-medium">{formatCurrency(d.Receita)}</td>
                  <td className="px-6 py-4 text-rose-600 font-medium">{formatCurrency(d.Despesa)}</td>
                  <td className={`px-6 py-4 text-right font-bold ${d.Lucro >= 0 ? 'text-slate-700' : 'text-rose-500'}`}>
                    {formatCurrency(d.Lucro)}
                  </td>
                </tr>
              ))}
              {daysWithMovement === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-400 italic">
                    Sem movimentações registradas neste mês.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
