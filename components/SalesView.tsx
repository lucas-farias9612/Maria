
import React, { useState } from 'react';
import { Sale, CategorySale, PaymentMethod } from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit2, 
  X,
  ShoppingBag,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { SALE_CATEGORIES, PAYMENT_METHODS } from '../constants';
import { formatCurrency, formatDateBR, generateId } from '../utils';

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

  const [formData, setFormData] = useState<Partial<Sale>>({
    data: new Date().toISOString().split('T')[0],
    descricao: '',
    categoria: 'Bolo',
    quantidade: 1,
    valorTotal: 0,
    formaPagamento: 'Pix',
    observacao: ''
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
    setFormData({
      data: new Date().toISOString().split('T')[0],
      descricao: '',
      categoria: 'Bolo',
      quantidade: 1,
      valorTotal: 0,
      formaPagamento: 'Pix',
      observacao: ''
    });
  };

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale);
    setFormData(sale);
    setIsModalOpen(true);
  };

  const filteredVendas = vendas.filter(v => {
    const matchesSearch = v.descricao.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'all' || v.categoria === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingBag className="text-pink-500" />
            Minhas Vendas
          </h2>
          <p className="text-slate-500">Gerencie todos os pedidos e saídas da confeitaria.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-pink-500/20 flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus size={20} />
          Lançar Venda
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por descrição..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-pink-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-pink-500 appearance-none"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">Todas as Categorias</option>
            {SALE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Pagamento</th>
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredVendas.map(venda => (
                <tr key={venda.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{formatDateBR(venda.data)}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{venda.descricao}</div>
                    {venda.observacao && <div className="text-xs text-slate-400 truncate max-w-xs">{venda.observacao}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                      {venda.categoria}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{venda.formaPagamento}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(venda.valorTotal)}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => handleEdit(venda)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => { if(confirm('Excluir venda?')) onDelete(venda.id) }} 
                      className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredVendas.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Nenhuma venda encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-xl">{editingSale ? 'Editar Venda' : 'Nova Venda'}</h3>
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
                      className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-pink-500"
                      value={formData.data}
                      onChange={(e) => setFormData({...formData, data: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-600">Categoria</label>
                  <select 
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-pink-500"
                    value={formData.categoria}
                    onChange={(e) => setFormData({...formData, categoria: e.target.value as CategorySale})}
                  >
                    {SALE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-600">Descrição *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Bolo de Chocolate 2kg"
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-pink-500"
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-600">Quantidade</label>
                  <input 
                    type="number" 
                    min="1"
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-pink-500"
                    value={formData.quantidade}
                    onChange={(e) => setFormData({...formData, quantidade: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-600">Valor Total (R$) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-pink-500 font-bold"
                    value={formData.valorTotal}
                    onChange={(e) => setFormData({...formData, valorTotal: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-600">Forma de Pagamento</label>
                <select 
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-pink-500"
                  value={formData.formaPagamento}
                  onChange={(e) => setFormData({...formData, formaPagamento: e.target.value as PaymentMethod})}
                >
                  {PAYMENT_METHODS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-600">Observações (opcional)</label>
                <textarea 
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-pink-500 min-h-[80px]"
                  value={formData.observacao}
                  onChange={(e) => setFormData({...formData, observacao: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all"
              >
                {editingSale ? 'Salvar Alterações' : 'Confirmar Venda'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesView;
