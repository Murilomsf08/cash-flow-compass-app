
import { supabase, isSupabaseConfigured } from '../config/supabaseConfig';
import { mockSellers } from '../types/sellerTypes';
import { toast } from "@/hooks/use-toast";

export const initializeSellersTable = async () => {
  // ... similar to initializeProductsTable but for sellers
  if (!isSupabaseConfigured) {
    console.warn('Supabase não configurado. A tabela de vendedores não será inicializada.');
    return;
  }

  try {
    const { error: tableCheckError } = await supabase
      .from('sellers')
      .select('id')
      .limit(1);

    if (tableCheckError && tableCheckError.message.includes('relation "sellers" does not exist')) {
      console.warn('Tabela "sellers" não existe no Supabase.');
      toast({
        title: "Tabela vendedores não encontrada",
        description: "A tabela de vendedores não existe no Supabase. Por favor, crie a tabela no painel do Supabase.",
        variant: "destructive",
      });
    }
  } catch (error) {
    console.error('Erro ao inicializar tabela sellers:', error);
  }
};

export const seedInitialSellers = async () => {
  if (!isSupabaseConfigured) return;
  
  try {
    const { count, error: countError } = await supabase
      .from('sellers')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error('Erro ao verificar se há dados em sellers:', countError);
      return;
    }
    
    if (count === 0) {
      const { error: insertError } = await supabase
        .from('sellers')
        .insert(mockSellers);
        
      if (insertError) {
        console.error('Erro ao popular dados iniciais de vendedores:', insertError);
        toast({
          title: "Erro",
          description: "Não foi possível inserir os dados iniciais. Verifique as permissões do banco.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Dados iniciais",
          description: "Vendedores de exemplo foram inseridos no banco de dados.",
        });
      }
    }
  } catch (error) {
    console.error('Erro ao verificar/popular dados iniciais de vendedores:', error);
  }
};
