
import { createClient } from '@supabase/supabase-js';
import { toast } from "@/hooks/use-toast";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const isSupabaseConfigured = 
  supabaseUrl !== 'https://your-supabase-url.supabase.co' && 
  supabaseAnonKey !== 'your-anon-key';

if (!isSupabaseConfigured) {
  console.error('Variáveis de ambiente do Supabase não encontradas ou usando valores padrão. Para funcionalidade completa, conecte-se à Supabase através da integração Lovable.');
}

// Criar uma única instância do cliente Supabase para toda a aplicação
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função auxiliar para lidar com erros do Supabase
export const handleSupabaseError = (error: any, operation: string) => {
  console.error(`Erro ao ${operation}:`, error);
  toast({
    title: "Erro",
    description: `Ocorreu um erro ao ${operation}. Por favor, tente novamente.`,
    variant: "destructive",
  });
  return error;
};

// Função para validar a conexão com o Supabase
export const validateSupabaseConnection = async () => {
  if (!isSupabaseConfigured) {
    return false;
  }

  try {
    const { data, error } = await supabase.from('services').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('Erro ao conectar com o Supabase:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Erro ao testar conexão com Supabase:', error);
    return false;
  }
};
