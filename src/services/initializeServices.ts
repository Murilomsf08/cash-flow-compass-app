
import { initializeExpensesTable } from './expensesService';
import { initializeProductsTable } from './productsService';
import { initializeSellersTable } from './sellersService';

export const initializeAllServices = () => {
  // Inicializar todas as tabelas e verificar conexão com o Supabase
  initializeExpensesTable();
  initializeProductsTable();
  initializeSellersTable();
};
