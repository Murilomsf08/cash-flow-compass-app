
import { supabase, isSupabaseConfigured } from '../config/supabaseConfig';
import { mockServices, ServiceDB } from '../types/serviceTypes';
import { toast } from "@/hooks/use-toast";

// Verificar conexão com Supabase e criar tabela se não existir
export const initializeServicesTable = async () => {
  if (!isSupabaseConfigured) {
    console.warn('Supabase não configurado. A tabela de serviços não será inicializada.');
    return;
  }

  try {
    // Verificar se a tabela services existe
    const { error: tableCheckError } = await supabase
      .from('services')
      .select('id')
      .limit(1);

    // Se houver um erro específico de tabela não existente, notificar o usuário
    if (tableCheckError && tableCheckError.message.includes('relation "services" does not exist')) {
      console.warn('Tabela "services" não existe no Supabase. Por favor, crie a tabela no painel do Supabase com os seguintes campos:');
      console.warn('- id: integer (chave primária)',
                   '- client: string',
                   '- date: string (formato data)',
                   '- seller: string',
                   '- service: string',
                   '- value: numeric',
                   '- status: string');
      
      toast({
        title: "Tabela serviços não encontrada",
        description: "A tabela de serviços não existe no Supabase. Por favor, crie a tabela no painel do Supabase.",
        variant: "destructive",
      });
    }
  } catch (error) {
    console.error('Erro ao inicializar tabela services:', error);
  }
};

// Função para popular o banco de dados com dados iniciais se estiver vazio
export const seedInitialServices = async () => {
  if (!isSupabaseConfigured) return;
  
  try {
    const { count, error: countError } = await supabase
      .from('services')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error('Erro ao verificar se há dados em services:', countError);
      return;
    }
    
    if (count === 0) {
      console.log('Populando banco de dados com serviços iniciais...');
      const { error: insertError } = await supabase
        .from('services')
        .insert(mockServices);
        
      if (insertError) {
        console.error('Erro ao popular dados iniciais de serviços:', insertError);
        toast({
          title: "Erro",
          description: "Não foi possível inserir os dados iniciais. Verifique as permissões do banco.",
          variant: "destructive",
        });
      } else {
        console.log('Serviços iniciais inseridos com sucesso!');
        toast({
          title: "Dados iniciais",
          description: "Serviços de exemplo foram inseridos no banco de dados.",
        });
      }
    }
  } catch (error) {
    console.error('Erro ao verificar/popular dados iniciais de serviços:', error);
  }
};
