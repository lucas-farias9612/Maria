
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Receipt, 
  BarChart3, 
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
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    saveToStorage(data);
  }, [data]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Funções CRUD simplificadas
  const addSale = (sale: Sale) => {
    setData(prev => ({ ...prev, vendas: [sale, ...prev.vendas] }));
    showNotification('Venda adicionada!');
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
    showNotification('Venda removida!');
  };

  const addExpense = (expense: Expense) => {
    setData(prev => ({ ...prev, despesas: [expense, ...prev.despesas] }));
    showNotification('Despesa adicionada!');
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
    showNotification('Despesa removida!');
  };

  const updateConfig = (meta: number) => {
    setData(prev => ({ ...prev, config: { ...prev.config, metaLucroMensal: meta } }));
    showNotification('Meta atualizada!');
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto bg-slate-50 md:max-w-full md:border-x md:border-slate-200">
      
      {/* Header Mobile Fixo */}
      <header className="bg-white px-4 py-3 border-b shadow-sm sticky top-0 z-30 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-pink-500 p-1.5 rounded-lg">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-lg text-slate-800">Delícias das Maria's</h1>
        </div>
      </header>

      {/* Notificação Flutuante */}
      {notification && (
        <div className={`fixed top-16 left-4 right-4 z-50 p-3 rounded-lg shadow-xl text-center text-sm font-bold animate-bounce
          ${notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
          {notification.message}
        </div>
      )}

      {/* Conteúdo Principal com Scroll */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-24 scroll-smooth">
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
      </main>

      {/* Navegação Inferior (App Style) */}
      <nav className="bg-white border-t border-slate-200 fixed bottom-0 w-full max-w-md md:max-w-full pb-safe z-40">
        <ul className="flex justify-around items-center h-16">
          <NavItem 
            id="dashboard" 
            icon={LayoutDashboard} 
            label="Início" 
            isActive={currentView === 'dashboard'} 
            onClick={() => setCurrentView('dashboard')} 
          />
          <NavItem 
            id="vendas" 
            icon={ShoppingBag} 
            label="Vendas" 
            isActive={currentView === 'vendas'} 
            onClick={() => setCurrentView('vendas')} 
          />
          <NavItem 
            id="despesas" 
            icon={Receipt} 
            label="Despesas" 
            isActive={currentView === 'despesas'} 
            onClick={() => setCurrentView('despesas')} 
          />
          <NavItem 
            id="relatorios" 
            icon={BarChart3} 
            label="Relatórios" 
            isActive={currentView === 'relatorios'} 
            onClick={() => setCurrentView('relatorios')} 
          />
        </ul>
      </nav>
    </div>
  );
};

// Componente Helper para Item de Navegação
const NavItem = ({ id, icon: Icon, label, isActive, onClick }: any) => (
  <li className="flex-1">
    <button 
      onClick={onClick}
      className={`w-full flex flex-col items-center justify-center h-full gap-1 pt-1
        ${isActive ? 'text-pink-500' : 'text-slate-400 hover:text-slate-600'}`}
    >
      <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  </li>
);

export default App;
