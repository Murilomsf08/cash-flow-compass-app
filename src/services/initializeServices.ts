
import { initializeExpensesTable } from './expensesService';
import { initializeProductsTable } from './productsService';
import { initializeSellersTable } from './sellersService';
import { initializeServicesTable } from './servicesService';

export const initializeAllServices = () => {
  // Inicializar todas as tabelas e verificar conexão com o Supabase
  initializeExpensesTable();
  initializeProductsTable();
  initializeSellersTable();
  initializeServicesTable(); // Adicionado inicialização da tabela de serviços
};
