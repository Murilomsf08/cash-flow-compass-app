
import { initializeExpensesTable } from './database/initializeExpensesDb';
import { initializeProductsTable } from './database/initializeProductsDb';
import { initializeSellersTable } from './database/initializeSellersDb';
import { initializeServicesTable } from './database/initializeDb';
import { validateSupabaseConnection } from './config/supabaseConfig';
import { toast } from "@/hooks/use-toast";

export const initializeAllServices = async () => {
  // Verificar conexão com o Supabase
  const isConnected = await validateSupabaseConnection();
  
  if (!isConnected) {
    toast({
      title: "Conexão com Supabase",
      description: "Funcionando em modo offline com dados simulados. Conecte ao Supabase para funcionalidade completa.",
      variant: "destructive",
    });
  } else {
    toast({
      title: "Conexão com Supabase estabelecida",
      description: "Sistema conectado ao banco de dados.",
    });
  }
  
  // Inicializar todas as tabelas
  await initializeExpensesTable();
  await initializeProductsTable();
  await initializeSellersTable();
  await initializeServicesTable();
};
