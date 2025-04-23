
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

export type ProductDB = {
  id: number;
  name: string;
  type: string; // "Produto" | "Serviço"
  price: number;
  description?: string;
};

// Mock data para teste quando o Supabase não está disponível
const mockProducts: ProductDB[] = [
  { id: 1, name: "Consultoria", type: "Serviço", price: 200, description: "Consultoria hora/hora" },
  { id: 2, name: "Desenvolvimento de Site", type: "Serviço", price: 5000, description: "Desenvolvimento de site responsivo" },
  { id: 3, name: "Mouse", type: "Produto", price: 80, description: "Mouse sem fio" },
  { id: 4, name: "Suporte Técnico", type: "Serviço", price: 150, description: "Suporte técnico hora/hora" },
  { id: 5, name: "Teclado", type: "Produto", price: 120, description: "Teclado mecânico" },
];

// Verificar conexão com Supabase e criar tabela se não existir
export const initializeProductsTable = async () => {
  if (!isSupabaseConfigured) return;

  try {
    // Verificar se a tabela products existe
    const { error: tableCheckError } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    // Se houver um erro específico de tabela não existente, tente criar (isso exigiria permissões adequadas)
    if (tableCheckError && tableCheckError.message.includes('relation "products" does not exist')) {
      console.warn('Tabela "products" não existe. Certifique-se de que ela seja criada no painel do Supabase.');
    }
  } catch (error) {
    console.error('Erro ao inicializar tabela products:', error);
  }
};

// Inicializar tabela
initializeProductsTable();

export async function getProducts() {
  if (!isSupabaseConfigured) {
    console.warn('Usando dados simulados para produtos. Conecte-se ao Supabase para dados reais.');
    return mockProducts;
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log('Nenhum produto encontrado no banco de dados.');
      // Se não houver dados reais, use os dados simulados na primeira vez
      await seedInitialProducts();
      const { data: seededData } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });
        
      return seededData || [];
    }
    
    return data as ProductDB[];
  } catch (error) {
    console.error('Erro ao buscar produtos, usando dados mock:', error);
    // Se houver erro de conexão, use os dados simulados
    return mockProducts;
  }
}

// Função para popular o banco de dados com dados iniciais se estiver vazio
async function seedInitialProducts() {
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
      } else {
        console.log('Produtos iniciais inseridos com sucesso!');
      }
    }
  } catch (error) {
    console.error('Erro ao verificar/popular dados iniciais de produtos:', error);
  }
}

export async function addProduct(product: Omit<ProductDB, 'id'>) {
  if (!isSupabaseConfigured) {
    console.warn('Usando dados simulados. Conecte-se ao Supabase para dados reais.');
    const newProduct: ProductDB = {
      id: mockProducts.length + 1,
      ...product,
    };
    mockProducts.push(newProduct);
    return newProduct;
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select();
    
    if (error) {
      console.error('Erro ao adicionar produto:', error);
      throw error;
    }
    
    return data?.[0] as ProductDB;
  } catch (error) {
    console.error('Erro ao adicionar produto:', error);
    throw error;
  }
}

export async function updateProduct(
  id: number,
  product: Partial<Omit<ProductDB, 'id'>>
) {
  if (!isSupabaseConfigured) {
    console.warn('Usando dados simulados. Conecte-se ao Supabase para dados reais.');
    const index = mockProducts.findIndex(p => p.id === id);
    if (index >= 0) {
      mockProducts[index] = { ...mockProducts[index], ...product };
      return mockProducts[index];
    }
    throw new Error('Produto não encontrado');
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
    
    return data as ProductDB;
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    throw error;
  }
}

export async function deleteProduct(id: number) {
  if (!isSupabaseConfigured) {
    console.warn('Usando dados simulados. Conecte-se ao Supabase para dados reais.');
    const index = mockProducts.findIndex(p => p.id === id);
    if (index >= 0) {
      mockProducts.splice(index, 1);
      return;
    }
    throw new Error('Produto não encontrado');
  }

  try {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error('Erro ao deletar produto:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    throw error;
  }
}
