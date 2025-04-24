
import { supabase, isSupabaseConfigured } from '../config/supabaseConfig';
import { mockExpenses } from '../types/expenseTypes';
import { toast } from "@/hooks/use-toast";

export const initializeExpensesTable = async () => {
  if (!isSupabaseConfigured) {
    console.warn('Supabase não configurado. A tabela de despesas não será inicializada.');
    return;
  }

  try {
    const { error: tableCheckError } = await supabase
      .from('expenses')
      .select('id')
      .limit(1);

    if (tableCheckError && tableCheckError.message.includes('relation "expenses" does not exist')) {
      console.warn('Tabela "expenses" não existe no Supabase.');
      toast({
        title: "Tabela despesas não encontrada",
        description: "A tabela de despesas não existe no Supabase. Por favor, crie a tabela no painel do Supabase.",
        variant: "destructive",
      });
    }
  } catch (error) {
    console.error('Erro ao inicializar tabela expenses:', error);
  }
};

export const seedInitialExpenses = async () => {
  if (!isSupabaseConfigured) return;
  
  try {
    const { count, error: countError } = await supabase
      .from('expenses')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error('Erro ao verificar se há dados em expenses:', countError);
      return;
    }
    
    if (count === 0) {
      const { error: insertError } = await supabase
        .from('expenses')
        .insert(mockExpenses);
        
      if (insertError) {
        console.error('Erro ao popular dados iniciais de despesas:', insertError);
        toast({
          title: "Erro",
          description: "Não foi possível inserir os dados iniciais. Verifique as permissões do banco.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Dados iniciais",
          description: "Despesas de exemplo foram inseridas no banco de dados.",
        });
      }
    }
  } catch (error) {
    console.error('Erro ao verificar/popular dados iniciais de despesas:', error);
  }
};
