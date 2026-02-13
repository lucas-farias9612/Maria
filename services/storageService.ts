
import { FinancialData } from '../types';
import { APP_STORAGE_KEY } from '../constants';

const initialData: FinancialData = {
  vendas: [],
  despesas: [],
  config: {
    metaLucroMensal: 3000
  }
};

export const getStoredData = (): FinancialData => {
  const stored = localStorage.getItem(APP_STORAGE_KEY);
  if (!stored) return initialData;
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Error parsing storage", e);
    return initialData;
  }
};

export const saveToStorage = (data: FinancialData): void => {
  localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(data));
};

export const clearAllData = (): void => {
  localStorage.removeItem(APP_STORAGE_KEY);
};
