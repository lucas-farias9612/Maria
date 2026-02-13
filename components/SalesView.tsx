
import React, { useState } from 'react';
import { Sale, CategorySale, PaymentMethod } from '../types';
import { Plus, Search, Trash2, Edit2, X } from 'lucide-react';
import { SALE_CATEGORIES, PAYMENT_METHODS } from '../constants';
import { formatCurrency, formatDateTimeBR, generateId, parseBRLToNumber, getCurrentDateTimeLocal } from '../utils';

interface Props {
  vendas: Sale[];
  onAdd: (sale: Sale) => void;
  onUpdate: (sale: Sale) => void;
  onDelete: (id: string) => void;
}

const SalesView: React.FC<Props> = ({ vendas, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [displayValue, setDisplayValue] = useState('');

  const [formData, setFormData] = useState<Partial<Sale>>({
    data: getCurrentDateTimeLocal(),
    descricao: '',
    categoria: 'Bolo',
    quantidade: 1,
    valorTotal: 0,
    formaPagamento: 'Pix',
    observacao: ''
  });

  const filteredVendas = vendas.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).filter(v => {
    const matchesSearch = v.descricao.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'all' || v.categoria === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.data || (formData.valorTotal || 0) <= 0) return;

    if (editingSale) {
      onUpdate({ ...editingSale, ...formData } as Sale);
    } else {
      onAdd({ ...formData, id: generateId() } as Sale);
    }
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSale(null);
    setDisplayValue('');
    setFormData({
      data: getCurrentDateTimeLocal(),
      descricao: '',
      categoria: 'Bolo',
      quantidade: 1,
      valorTotal: 0,
      formaPagamento: 'Pix',
      observacao: ''
    });
  };

  const openEdit = (sale: Sale) => {
    setEditingSale(sale);
    setFormData(sale);
    setDisplayValue(sale.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
    setIsModalOpen(true);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDisplayValue(value);
    setFormData(prev => ({ ...prev, valorTotal: parseBRLToNumber(value) }));
  };

  const handleDelete = (id: string) => {
    // Adiciona um confirm mais robusto
    if (window.confirm('Tem certeza que deseja excluir esta venda?')) {
      onDelete(id);
    }
  };

  return (
    <section className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="sticky top-0 bg-slate-50 pt-2 pb-4 z-10 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar venda..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-pink-500 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-pink-500 text-white p-3 rounded-xl shadow-md shadow-pink-200 active:scale-95 transition-transform"
          >
            <Plus size={24} />
          </button>
        </div>
        
        {/* Chips Filtros */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button 
             onClick={() => setFilterCategory('all')}
             className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors
             ${filterCategory === 'all' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200'}`}
          >
            Todos
          </button>
          {SALE_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors
              ${filterCategory === cat ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-slate-600 border-slate-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Cards (HTML Semântico) */}
      <div className="space-y-3">
        {filteredVendas.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <p>Nenhuma venda encontrada.</p>
          </div>
        ) : (
          filteredVendas.map((venda) => (
            <article key={venda.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-slate-400 font-medium">{formatDateTimeBR(venda.data)}</span>
                  <span className="px-2 py-0.5 rounded-md bg-pink-50 text-pink-700 text-[10px] font-bold uppercase tracking-wide">
                    {venda.categoria}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-base">{venda.descricao}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{venda.quantidade}x • {venda.formaPagamento}</p>
                {venda.observacao && <p className="text-xs text-slate-400 mt-2 italic bg-slate-50 p-1.5 rounded">"{venda.observacao}"</p>}
              </div>
              
              <div className="flex flex-col items-end gap-3 ml-2">
                <span className="font-bold text-lg text-slate-900">{formatCurrency(venda.valorTotal)}</span>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(venda)} className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-50 rounded-lg">
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(venda.id); }} 
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

      {/* Modal/Bottom Sheet */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl animate-in slide-in-from-bottom-10 duration-200">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-bold text-lg">{editingSale ? 'Editar Venda' : 'Nova Venda'}</h2>
              <button onClick={closeModal} className="p-2 bg-slate-100 rounded-full"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Data e Hora</label>
                  <input type="datetime-local" required className="w-full p-3 bg-slate-50 rounded-xl border-0 focus:ring-2 focus:ring-pink-500"
                    value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Valor Total (R$)</label>
                  <input 
                    type="text" 
                    inputMode="decimal"
                    required 
                    placeholder="0,00" 
                    className="w-full p-3 bg-slate-50 rounded-xl border-0 focus:ring-2 focus:ring-pink-500 font-bold text-lg"
                    value={displayValue} 
                    onChange={handleValueChange} 
                  />
                  {formData.valorTotal !== undefined && formData.valorTotal > 0 && (
                     <p className="text-[10px] text-slate-400 text-right px-1">
                       Confirmado: {formatCurrency(formData.valorTotal)}
                     </p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Descrição</label>
                <input type="text" required placeholder="O que foi vendido?" className="w-full p-3 bg-slate-50 rounded-xl border-0 focus:ring-2 focus:ring-pink-500"
                  value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Categoria</label>
                  <select className="w-full p-3 bg-slate-50 rounded-xl border-0 focus:ring-2 focus:ring-pink-500"
                    value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value as CategorySale})}>
                    {SALE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Pagamento</label>
                  <select className="w-full p-3 bg-slate-50 rounded-xl border-0 focus:ring-2 focus:ring-pink-500"
                    value={formData.formaPagamento} onChange={e => setFormData({...formData, formaPagamento: e.target.value as PaymentMethod})}>
                    {PAYMENT_METHODS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Observação</label>
                <textarea rows={2} className="w-full p-3 bg-slate-50 rounded-xl border-0 focus:ring-2 focus:ring-pink-500"
                  value={formData.observacao} onChange={e => setFormData({...formData, observacao: e.target.value})}></textarea>
              </div>

              <button type="submit" className="w-full bg-pink-500 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform mt-2">
                {editingSale ? 'Salvar Alterações' : 'Confirmar Venda'}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default SalesView;
