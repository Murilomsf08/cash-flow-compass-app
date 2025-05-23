import { supabase, isSupabaseConfigured, handleSupabaseError } from './config/supabaseConfig';
import { ProductDB, mockProducts } from './types/productTypes';
import { toast } from "@/hooks/use-toast";

export async function getProducts(): Promise<ProductDB[]> {
  if (!isSupabaseConfigured) {
    console.warn('Usando dados simulados para produtos. Conecte-se ao Supabase para dados reais.');
    return [...mockProducts];
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      return handleSupabaseError(error, 'buscar produtos');
    }
    
    return (data || []) as ProductDB[];
  } catch (error) {
    console.error('Erro ao buscar produtos, usando dados mock:', error);
    toast({
      title: "Erro ao carregar produtos",
      description: "Usando dados locais temporariamente. Por favor, verifique sua conexão.",
      variant: "destructive",
    });
    return [...mockProducts];
  }
}

export async function addProduct(product: Omit<ProductDB, 'id'>): Promise<ProductDB> {
  if (!isSupabaseConfigured) {
    console.warn('Usando dados simulados. Conecte-se ao Supabase para dados reais.');
    const newProduct: ProductDB = {
      id: mockProducts.length + 1,
      ...product,
    };
    mockProducts.push(newProduct);
    toast({
      title: "Produto adicionado (modo simulado)",
      description: "O produto foi salvo localmente, mas não no banco de dados.",
      variant: "default",
    });
    return { ...newProduct };
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select();
    
    if (error) {
      return handleSupabaseError(error, 'adicionar produto');
    }
    
    toast({
      title: "Produto adicionado",
      description: "O produto foi cadastrado com sucesso.",
    });
    
    return data?.[0] as ProductDB;
  } catch (error) {
    return handleSupabaseError(error, 'adicionar produto');
  }
}

export async function updateProduct(
  id: number,
  product: Partial<Omit<ProductDB, 'id'>>
): Promise<ProductDB> {
  if (!isSupabaseConfigured) {
    console.warn('Usando dados simulados. Conecte-se ao Supabase para dados reais.');
    const index = mockProducts.findIndex(p => p.id === id);
    if (index >= 0) {
      mockProducts[index] = { ...mockProducts[index], ...product };
      toast({
        title: "Produto atualizado (modo simulado)",
        description: "O produto foi atualizado localmente, mas não no banco de dados.",
      });
      return { ...mockProducts[index] };
    }
    toast({
      title: "Erro",
      description: "Produto não encontrado.",
      variant: "destructive",
    });
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
      return handleSupabaseError(error, 'atualizar produto');
    }
    
    toast({
      title: "Produto atualizado",
      description: "O produto foi atualizado com sucesso.",
    });
    
    return data as ProductDB;
  } catch (error) {
    return handleSupabaseError(error, 'atualizar produto');
  }
}

export async function deleteProduct(id: number): Promise<void> {
  if (!isSupabaseConfigured) {
    console.warn('Usando dados simulados. Conecte-se ao Supabase para dados reais.');
    const index = mockProducts.findIndex(p => p.id === id);
    if (index >= 0) {
      mockProducts.splice(index, 1);
      toast({
        title: "Produto removido (modo simulado)",
        description: "O produto foi removido localmente, mas não no banco de dados.",
      });
      return;
    }
    toast({
      title: "Erro",
      description: "Produto não encontrado.",
      variant: "destructive",
    });
    throw new Error('Produto não encontrado');
  }

  try {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      handleSupabaseError(error, 'deletar produto');
      return;
    }
    
    toast({
      title: "Produto removido",
      description: "O produto foi removido com sucesso.",
    });
  } catch (error) {
    handleSupabaseError(error, 'deletar produto');
  }
}
