
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Receipt, 
  BarChart3, 
  Plus, 
  Menu, 
  X,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { FinancialData, Sale, Expense, AppView } from './types';
import { getStoredData, saveToStorage } from './services/storageService';
import Dashboard from './components/Dashboard';
import SalesView from './components/SalesView';
import ExpensesView from './components/ExpensesView';
import ReportsView from './components/ReportsView';

const App: React.FC = () => {
  const [data, setData] = useState<FinancialData>(() => getStoredData());
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    saveToStorage(data);
  }, [data]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const addSale = (sale: Sale) => {
    setData(prev => ({ ...prev, vendas: [sale, ...prev.vendas] }));
    showNotification('Venda cadastrada com sucesso!');
  };

  const updateSale = (updatedSale: Sale) => {
    setData(prev => ({
      ...prev,
      vendas: prev.vendas.map(s => s.id === updatedSale.id ? updatedSale : s)
    }));
    showNotification('Venda atualizada!');
  };

  const deleteSale = (id: string) => {
    setData(prev => ({ ...prev, vendas: prev.vendas.filter(s => s.id !== id) }));
    showNotification('Venda excluída!');
  };

  const addExpense = (expense: Expense) => {
    setData(prev => ({ ...prev, despesas: [expense, ...prev.despesas] }));
    showNotification('Despesa cadastrada!');
  };

  const updateExpense = (updatedExpense: Expense) => {
    setData(prev => ({
      ...prev,
      despesas: prev.despesas.map(e => e.id === updatedExpense.id ? updatedExpense : e)
    }));
    showNotification('Despesa atualizada!');
  };

  const deleteExpense = (id: string) => {
    setData(prev => ({ ...prev, despesas: prev.despesas.filter(e => e.id !== id) }));
    showNotification('Despesa excluída!');
  };

  const updateConfig = (meta: number) => {
    setData(prev => ({ ...prev, config: { ...prev.config, metaLucroMensal: meta } }));
    showNotification('Meta atualizada!');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'vendas', label: 'Vendas', icon: ShoppingBag },
    { id: 'despesas', label: 'Despesas', icon: Receipt },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-pink-500 p-2 rounded-lg">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">Delícias das Maria's</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-0 z-40 bg-slate-900 text-white w-64 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-800 hidden md:flex items-center gap-3">
            <div className="bg-pink-500 p-2 rounded-xl shadow-lg shadow-pink-500/20 shrink-0">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div className="overflow-hidden">
              <h1 className="font-bold text-lg leading-tight">Delícias das Maria's</h1>
              <p className="text-slate-400 text-xs mt-0.5">Confeitaria Artística</p>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id as AppView);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${currentView === item.id ? 'bg-pink-500 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <div className="bg-slate-800/50 p-4 rounded-xl">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Meta Mensal</p>
              <div className="flex items-end justify-between">
                <span className="text-lg font-bold">R$ {data.config.metaLucroMensal.toLocaleString()}</span>
                <TrendingUp className="text-emerald-400 w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {notification && (
            <div className={`fixed top-4 right-4 z-[60] flex items-center gap-2 px-6 py-3 rounded-xl shadow-2xl animate-bounce 
              ${notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
              <AlertCircle size={20} />
              <span className="font-medium">{notification.message}</span>
            </div>
          )}

          {currentView === 'dashboard' && (
            <Dashboard data={data} updateConfig={updateConfig} />
          )}
          {currentView === 'vendas' && (
            <SalesView 
              vendas={data.vendas} 
              onAdd={addSale} 
              onUpdate={updateSale} 
              onDelete={deleteSale} 
            />
          )}
          {currentView === 'despesas' && (
            <ExpensesView 
              despesas={data.despesas} 
              onAdd={addExpense} 
              onUpdate={updateExpense} 
              onDelete={deleteExpense} 
            />
          )}
          {currentView === 'relatorios' && (
            <ReportsView data={data} setData={setData} showNotification={showNotification} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
