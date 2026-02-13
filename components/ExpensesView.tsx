
import React, { useState } from 'react';
import { Expense, CategoryExpense, ExpenseType } from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit2, 
  X,
  Receipt,
  Calendar
} from 'lucide-react';
import { EXPENSE_CATEGORIES, EXPENSE_TYPES } from '../constants';
import { formatCurrency, formatDateBR, generateId } from '../utils';

interface Props {
  despesas: Expense[];
  onAdd: (expense: Expense) => void;
  onUpdate: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

const ExpensesView: React.FC<Props> = ({ despesas, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const [formData, setFormData] = useState<Partial<Expense>>({
    data: new Date().toISOString().split('T')[0],
    descricao: '',
    categoria: 'Ingredientes',
    valor: 0,
    tipo: 'Variável',
    observacao: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.data || (formData.valor || 0) <= 0) return;

    if (editingExpense) {
      onUpdate({ ...editingExpense, ...formData } as Expense);
    } else {
      onAdd({ ...formData, id: generateId() } as Expense);
    }
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
    setFormData({
      data: new Date().toISOString().split('T')[0],
      descricao: '',
      categoria: 'Ingredientes',
      valor: 0,
      tipo: 'Variável',
      observacao: ''
    });
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData(expense);
    setIsModalOpen(true);
  };

  const filteredDespesas = despesas.filter(e => {
    const matchesSearch = e.descricao.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'all' || e.categoria === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Receipt className="text-rose-500" />
            Minhas Despesas
          </h2>
          <p className="text-slate-500">Controle todos os gastos e custos da sua produção.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-rose-500/20 flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus size={20} />
          Lançar Despesa
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por descrição..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-500 appearance-none"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">Todas as Categorias</option>
            {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredDespesas.map(expense => (
                <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{formatDateBR(expense.data)}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{expense.descricao}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                      {expense.categoria}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{expense.tipo}</td>
                  <td className="px-6 py-4 font-bold text-rose-600">{formatCurrency(expense.valor)}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => handleEdit(expense)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => { if(confirm('Excluir despesa?')) onDelete(expense.id) }} 
                      className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredDespesas.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Nenhuma despesa encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-xl">{editingExpense ? 'Editar Despesa' : 'Nova Despesa'}</h3>
              <button onClick={closeModal} className="p-2 hover:bg-white rounded-lg transition-colors"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-600">Data *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="date" 
                      required
                      className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
                      value={formData.data}
                      onChange={(e) => setFormData({...formData, data: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-600">Categoria</label>
                  <select 
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
                    value={formData.categoria}
                    onChange={(e) => setFormData({...formData, categoria: e.target.value as CategoryExpense})}
                  >
                    {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-600">Descrição *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Compra de farinha 10kg"
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-600">Tipo</label>
                  <select 
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
                    value={formData.tipo}
                    onChange={(e) => setFormData({...formData, tipo: e.target.value as ExpenseType})}
                  >
                    {EXPENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-600">Valor (R$) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-rose-500 font-bold"
                    value={formData.valor}
                    onChange={(e) => setFormData({...formData, valor: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-600">Observações (opcional)</label>
                <textarea 
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-rose-500 min-h-[80px]"
                  value={formData.observacao}
                  onChange={(e) => setFormData({...formData, observacao: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all"
              >
                {editingExpense ? 'Salvar Alterações' : 'Confirmar Despesa'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesView;
