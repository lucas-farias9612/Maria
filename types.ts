
export type CategorySale = 'Bolo' | 'Docinhos' | 'Salgados' | 'Encomenda' | 'Outros';
export type CategoryExpense = 'Ingredientes' | 'Embalagens' | 'Gás' | 'Energia' | 'Aluguel' | 'Transporte' | 'Marketing' | 'Outros';
export type PaymentMethod = 'Pix' | 'Cartão' | 'Dinheiro' | 'Outro';
export type ExpenseType = 'Fixa' | 'Variável';

export interface Sale {
  id: string;
  data: string; // YYYY-MM-DD
  descricao: string;
  categoria: CategorySale;
  quantidade: number;
  valorTotal: number;
  formaPagamento: PaymentMethod;
  observacao?: string;
}

export interface Expense {
  id: string;
  data: string; // YYYY-MM-DD
  descricao: string;
  categoria: CategoryExpense;
  valor: number;
  tipo: ExpenseType;
  observacao?: string;
}

export interface AppConfig {
  metaLucroMensal: number;
}

export interface FinancialData {
  vendas: Sale[];
  despesas: Expense[];
  config: AppConfig;
}

export type AppView = 'dashboard' | 'vendas' | 'despesas' | 'relatorios';
