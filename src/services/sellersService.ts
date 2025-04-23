
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

export type SellerDB = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  commission: number;
};

// Mock data para teste quando o Supabase não está disponível
const mockSellers: SellerDB[] = [
  { id: 1, name: "João Silva", email: "joao@empresa.com", phone: "(11) 98765-4321", commission: 10 },
  { id: 2, name: "Maria Oliveira", email: "maria@empresa.com", phone: "(11) 91234-5678", commission: 12 },
  { id: 3, name: "Pedro Santos", email: "pedro@empresa.com", phone: "(11) 99876-5432", commission: 8 },
];

// Verificar conexão com Supabase e criar tabela se não existir
export const initializeSellersTable = async () => {
  if (!isSupabaseConfigured) return;

  try {
    // Verificar se a tabela sellers existe
    const { error: tableCheckError } = await supabase
      .from('sellers')
      .select('id')
      .limit(1);

    // Se houver um erro específico de tabela não existente, tente criar (isso exigiria permissões adequadas)
    if (tableCheckError && tableCheckError.message.includes('relation "sellers" does not exist')) {
      console.warn('Tabela "sellers" não existe. Certifique-se de que ela seja criada no painel do Supabase.');
    }
  } catch (error) {
    console.error('Erro ao inicializar tabela sellers:', error);
  }
};

// Inicializar tabela
initializeSellersTable();

export async function getSellers() {
  if (!isSupabaseConfigured) {
    console.warn('Usando dados simulados para vendedores. Conecte-se ao Supabase para dados reais.');
    return mockSellers;
  }

  try {
    const { data, error } = await supabase
      .from('sellers')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Erro ao buscar vendedores:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log('Nenhum vendedor encontrado no banco de dados.');
      // Se não houver dados reais, use os dados simulados na primeira vez
      await seedInitialSellers();
      const { data: seededData } = await supabase
        .from('sellers')
        .select('*')
        .order('name', { ascending: true });
        
      return seededData || [];
    }
    
    return data as SellerDB[];
  } catch (error) {
    console.error('Erro ao buscar vendedores, usando dados mock:', error);
    // Se houver erro de conexão, use os dados simulados
    return mockSellers;
  }
}

// Função para popular o banco de dados com dados iniciais se estiver vazio
async function seedInitialSellers() {
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
      console.log('Populando banco de dados com vendedores iniciais...');
      const { error: insertError } = await supabase
        .from('sellers')
        .insert(mockSellers);
        
      if (insertError) {
        console.error('Erro ao popular dados iniciais de vendedores:', insertError);
      } else {
        console.log('Vendedores iniciais inseridos com sucesso!');
      }
    }
  } catch (error) {
    console.error('Erro ao verificar/popular dados iniciais de vendedores:', error);
  }
}

export async function addSeller(seller: Omit<SellerDB, 'id'>) {
  if (!isSupabaseConfigured) {
    console.warn('Usando dados simulados. Conecte-se ao Supabase para dados reais.');
    const newSeller: SellerDB = {
      id: mockSellers.length + 1,
      ...seller,
    };
    mockSellers.push(newSeller);
    return newSeller;
  }

  try {
    const { data, error } = await supabase
      .from('sellers')
      .insert([seller])
      .select();
    
    if (error) {
      console.error('Erro ao adicionar vendedor:', error);
      throw error;
    }
    
    return data?.[0] as SellerDB;
  } catch (error) {
    console.error('Erro ao adicionar vendedor:', error);
    throw error;
  }
}

export async function updateSeller(
  id: number,
  seller: Partial<Omit<SellerDB, 'id'>>
) {
  if (!isSupabaseConfigured) {
    console.warn('Usando dados simulados. Conecte-se ao Supabase para dados reais.');
    const index = mockSellers.findIndex(s => s.id === id);
    if (index >= 0) {
      mockSellers[index] = { ...mockSellers[index], ...seller };
      return mockSellers[index];
    }
    throw new Error('Vendedor não encontrado');
  }

  try {
    const { data, error } = await supabase
      .from('sellers')
      .update(seller)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao atualizar vendedor:', error);
      throw error;
    }
    
    return data as SellerDB;
  } catch (error) {
    console.error('Erro ao atualizar vendedor:', error);
    throw error;
  }
}

export async function deleteSeller(id: number) {
  if (!isSupabaseConfigured) {
    console.warn('Usando dados simulados. Conecte-se ao Supabase para dados reais.');
    const index = mockSellers.findIndex(s => s.id === id);
    if (index >= 0) {
      mockSellers.splice(index, 1);
      return;
    }
    throw new Error('Vendedor não encontrado');
  }

  try {
    const { error } = await supabase.from('sellers').delete().eq('id', id);
    if (error) {
      console.error('Erro ao deletar vendedor:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao deletar vendedor:', error);
    throw error;
  }
}
