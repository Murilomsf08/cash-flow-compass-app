
import { supabase, isSupabaseConfigured } from '../config/supabaseConfig';
import { mockProducts } from '../types/productTypes';
import { toast } from "@/hooks/use-toast";

export const initializeProductsTable = async () => {
  if (!isSupabaseConfigured) {
    console.warn('Supabase não configurado. A tabela de produtos não será inicializada.');
    return;
  }

  try {
    const { error: tableCheckError } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    if (tableCheckError && tableCheckError.message.includes('relation "products" does not exist')) {
      console.warn('Tabela "products" não existe no Supabase.');
      toast({
        title: "Tabela produtos não encontrada",
        description: "A tabela de produtos não existe no Supabase. Por favor, crie a tabela no painel do Supabase.",
        variant: "destructive",
      });
    }
  } catch (error) {
    console.error('Erro ao inicializar tabela products:', error);
  }
};

export const seedInitialProducts = async () => {
  if (!isSupabaseConfigured) return;
  
  try {
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error('Erro ao verificar se há dados em products:', countError);
      return;
    }
    
    if (count === 0) {
      console.log('Populando banco de dados com produtos iniciais...');
      const { error: insertError } = await supabase
        .from('products')
        .insert(mockProducts);
        
      if (insertError) {
        console.error('Erro ao popular dados iniciais de produtos:', insertError);
        toast({
          title: "Erro",
          description: "Não foi possível inserir os dados iniciais. Verifique as permissões do banco.",
          variant: "destructive",
        });
      } else {
        console.log('Produtos iniciais inseridos com sucesso!');
        toast({
          title: "Dados iniciais",
          description: "Produtos de exemplo foram inseridos no banco de dados.",
        });
      }
    }
  } catch (error) {
    console.error('Erro ao verificar/popular dados iniciais de produtos:', error);
  }
};
