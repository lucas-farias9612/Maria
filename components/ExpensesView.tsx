
import React, { useState } from 'react';
import { Expense, CategoryExpense, ExpenseType } from '../types';
import { Plus, Search, Trash2, Edit2, X } from 'lucide-react';
import { EXPENSE_CATEGORIES, EXPENSE_TYPES } from '../constants';
import { formatCurrency, formatDateTimeBR, generateId, parseBRLToNumber, getCurrentDateTimeLocal } from '../utils';

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
  const [displayValue, setDisplayValue] = useState('');

  const [formData, setFormData] = useState<Partial<Expense>>({
    data: getCurrentDateTimeLocal(),
    descricao: '',
    categoria: 'Ingredientes',
    valor: 0,
    tipo: 'Variável',
    observacao: ''
  });

  const filteredDespesas = despesas.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).filter(e => {
    const matchesSearch = e.descricao.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'all' || e.categoria === filterCategory;
    return matchesSearch && matchesCategory;
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
    setDisplayValue('');
    setFormData({
      data: getCurrentDateTimeLocal(),
      descricao: '',
      categoria: 'Ingredientes',
      valor: 0,
      tipo: 'Variável',
      observacao: ''
    });
  };

  const openEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData(expense);
    setDisplayValue(expense.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
    setIsModalOpen(true);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDisplayValue(value);
    setFormData(prev => ({ ...prev, valor: parseBRLToNumber(value) }));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
      onDelete(id);
    }
  };

  return (
    <section className="space-y-4">
      {/* Search Bar */}
      <div className="sticky top-0 bg-slate-50 pt-2 pb-4 z-10 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar despesa..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-rose-500 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-rose-500 text-white p-3 rounded-xl shadow-md shadow-rose-200 active:scale-95 transition-transform"
          >
            <Plus size={24} />
          </button>
        </div>

         <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button 
             onClick={() => setFilterCategory('all')}
             className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors
             ${filterCategory === 'all' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200'}`}
          >
            Todas
          </button>
          {EXPENSE_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors
              ${filterCategory === cat ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-slate-600 border-slate-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Lista Cards */}
      <div className="space-y-3">
        {filteredDespesas.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <p>Nenhuma despesa encontrada.</p>
          </div>
        ) : (
          filteredDespesas.map((expense) => (
            <article key={expense.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-start border-l-4 border-l-rose-400">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-slate-400 font-medium">{formatDateTimeBR(expense.data)}</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                    {expense.tipo}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-base">{expense.descricao}</h3>
                <p className="text-xs text-rose-500 font-medium mt-0.5">{expense.categoria}</p>
              </div>
              
              <div className="flex flex-col items-end gap-3 ml-2">
                <span className="font-bold text-lg text-rose-600">{formatCurrency(expense.valor)}</span>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(expense)} className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-50 rounded-lg">
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(expense.id); }} 
                    className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl animate-in slide-in-from-bottom-10 duration-200">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-bold text-lg">{editingExpense ? 'Editar Despesa' : 'Nova Despesa'}</h2>
              <button onClick={closeModal} className="p-2 bg-slate-100 rounded-full"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Data e Hora</label>
                  <input type="datetime-local" required className="w-full p-3 bg-slate-50 rounded-xl border-0 focus:ring-2 focus:ring-rose-500"
                    value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Valor (R$)</label>
                  <input 
                    type="text"
                    inputMode="decimal"
                    required 
                    placeholder="0,00" 
                    className="w-full p-3 bg-slate-50 rounded-xl border-0 focus:ring-2 focus:ring-rose-500 font-bold text-lg"
                    value={displayValue} 
                    onChange={handleValueChange} 
                  />
                  {formData.valor !== undefined && formData.valor > 0 && (
                     <p className="text-[10px] text-slate-400 text-right px-1">
                       Confirmado: {formatCurrency(formData.valor)}
                     </p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Descrição</label>
                <input type="text" required placeholder="Gasto com o quê?" className="w-full p-3 bg-slate-50 rounded-xl border-0 focus:ring-2 focus:ring-rose-500"
                  value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Categoria</label>
                  <select className="w-full p-3 bg-slate-50 rounded-xl border-0 focus:ring-2 focus:ring-rose-500"
                    value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value as CategoryExpense})}>
                    {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Tipo</label>
                  <select className="w-full p-3 bg-slate-50 rounded-xl border-0 focus:ring-2 focus:ring-rose-500"
                    value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value as ExpenseType})}>
                    {EXPENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full bg-rose-500 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform mt-2">
                {editingExpense ? 'Salvar Alterações' : 'Confirmar Despesa'}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default ExpensesView;
