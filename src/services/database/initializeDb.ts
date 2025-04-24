
import { supabase, isSupabaseConfigured } from '../config/supabaseConfig';
import { mockServices } from '../types/serviceTypes';

export const initializeServicesTable = async () => {
  if (!isSupabaseConfigured) return;

  try {
    const { error: tableCheckError } = await supabase
      .from('services')
      .select('id')
      .limit(1);

    if (tableCheckError && tableCheckError.message.includes('relation "services" does not exist')) {
      console.warn('Tabela "services" não existe. Certifique-se de que ela seja criada no painel do Supabase.');
    }
  } catch (error) {
    console.error('Erro ao inicializar tabela services:', error);
  }
};

export async function seedInitialServices() {
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
      } else {
        console.log('Serviços iniciais inseridos com sucesso!');
      }
    }
  } catch (error) {
    console.error('Erro ao verificar/popular dados iniciais de serviços:', error);
  }
}
