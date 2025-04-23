
import { createClient } from '@supabase/supabase-js';

// Certifique-se de que as variáveis de ambiente estão sendo acessadas corretamente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Verificar se as credenciais do Supabase estão presentes
const isSupabaseConfigured = 
  supabaseUrl !== 'https://your-supabase-url.supabase.co' && 
  supabaseAnonKey !== 'your-anon-key';

if (!isSupabaseConfigured) {
  console.error('Variáveis de ambiente do Supabase não encontradas ou usando valores padrão. Para funcionalidade completa, conecte-se à Supabase através da integração Lovable.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type ServiceDB = {
  id: number;
  name: string;
  client: string;
  value: number;
  date: string;
  commission: number;
  status: string;
  seller?: string; // Optional
};

// Mock data para teste quando o Supabase não está disponível
export const mockServices: ServiceDB[] = [
  { id: 1, name: "Consultoria", client: "Empresa A", value: 2500, date: "2025-03-15", commission: 250, status: "Pending", seller: "Carlos Silva" },
  { id: 2, name: "Desenvolvimento Web", client: "Empresa B", value: 5000, date: "2025-03-20", commission: 500, status: "Completed", seller: "Ana Martins" },
  { id: 3, name: "Design Gráfico", client: "Pessoa C", value: 1200, date: "2025-03-25", commission: 120, status: "Cancelled", seller: "João Santos" },
  { id: 4, name: "Suporte Técnico", client: "Empresa A", value: 800, date: "2025-04-01", commission: 80, status: "Pending", seller: "Maria Souza" },
  { id: 5, name: "Consultoria", client: "Pessoa D", value: 3000, date: "2025-04-02", commission: 300, status: "Completed", seller: "Carlos Silva" },
];

// Verificar conexão com Supabase e criar tabela se não existir
export const initializeServicesTable = async () => {
  if (!isSupabaseConfigured) return;

  try {
    // Verificar se a tabela services existe
    const { error: tableCheckError } = await supabase
      .from('services')
      .select('id')
      .limit(1);

    // Se houver um erro específico de tabela não existente, tente criar (isso exigiria permissões adequadas)
    if (tableCheckError && tableCheckError.message.includes('relation "services" does not exist')) {
      console.warn('Tabela "services" não existe. Certifique-se de que ela seja criada no painel do Supabase.');
    }
  } catch (error) {
    console.error('Erro ao inicializar tabela services:', error);
  }
};

// Inicializar tabela
initializeServicesTable();

export async function getServices(): Promise<ServiceDB[]> {
  if (!isSupabaseConfigured) {
    console.warn('Usando dados simulados para serviços. Conecte-se ao Supabase para dados reais.');
    return [...mockServices]; // Return a copy to avoid mutation issues
  }

  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar serviços:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log('Nenhum serviço encontrado no banco de dados.');
      // Se não houver dados reais, use os dados simulados na primeira vez
      await seedInitialServices();
      const { data: seededData } = await supabase
        .from('services')
        .select('*')
        .order('date', { ascending: false });
        
      return seededData || [];
    }
    
    return data as ServiceDB[];
  } catch (error) {
    console.error('Erro ao buscar serviços, usando dados mock:', error);
    // Se houver erro de conexão, use os dados simulados
    return [...mockServices]; // Return a copy to avoid mutation issues
  }
}

// Função para popular o banco de dados com dados iniciais se estiver vazio
async function seedInitialServices() {
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

export async function addService(service: Omit<ServiceDB, 'id'>): Promise<ServiceDB> {
  if (!isSupabaseConfigured) {
    console.warn('Usando dados simulados. Conecte-se ao Supabase para dados reais.');
    const newService: ServiceDB = {
      id: mockServices.length + 1,
      ...service,
    };
    mockServices.push(newService);
    return { ...newService }; // Return a copy to avoid mutation issues
  }

  try {
    const { data, error } = await supabase
      .from('services')
      .insert([service])
      .select();
    
    if (error) {
      console.error('Erro ao adicionar serviço:', error);
      throw error;
    }
    
    return data?.[0] as ServiceDB;
  } catch (error) {
    console.error('Erro ao adicionar serviço:', error);
    throw error;
  }
}

export async function updateService(
  id: number,
  service: Partial<Omit<ServiceDB, 'id'>>
): Promise<ServiceDB> {
  if (!isSupabaseConfigured) {
    console.warn('Usando dados simulados. Conecte-se ao Supabase para dados reais.');
    const index = mockServices.findIndex(p => p.id === id);
    if (index >= 0) {
      mockServices[index] = { ...mockServices[index], ...service };
      return { ...mockServices[index] }; // Return a copy to avoid mutation issues
    }
    throw new Error('Serviço não encontrado');
  }

  try {
    const { data, error } = await supabase
      .from('services')
      .update(service)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao atualizar serviço:', error);
      throw error;
    }
    
    return data as ServiceDB;
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    throw error;
  }
}

export async function deleteService(id: number): Promise<void> {
  if (!isSupabaseConfigured) {
    console.warn('Usando dados simulados. Conecte-se ao Supabase para dados reais.');
    const index = mockServices.findIndex(p => p.id === id);
    if (index >= 0) {
      mockServices.splice(index, 1);
      return;
    }
    throw new Error('Serviço não encontrado');
  }

  try {
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) {
      console.error('Erro ao deletar serviço:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao deletar serviço:', error);
    throw error;
  }
}

export async function toggleServiceStatus(id: number, newStatus: string): Promise<ServiceDB> {
  return updateService(id, { status: newStatus });
}
