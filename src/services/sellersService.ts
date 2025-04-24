
import { supabase, isSupabaseConfigured, handleSupabaseError } from './config/supabaseConfig';
import { SellerDB, mockSellers } from './types/sellerTypes';
import { initializeSellersTable, seedInitialSellers } from './database/initializeSellersDb';
import { toast } from "@/hooks/use-toast";

// Initialize the database
initializeSellersTable();

// Funções de CRUD
export async function getSellers(): Promise<SellerDB[]> {
  if (!isSupabaseConfigured) {
    console.warn('Usando dados simulados para vendedores. Conecte-se ao Supabase para dados reais.');
    return [...mockSellers];
  }

  try {
    const { data, error } = await supabase
      .from('sellers')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      return handleSupabaseError(error, 'buscar vendedores');
    }
    
    if (!data || data.length === 0) {
      await seedInitialSellers();
      const { data: seededData } = await supabase
        .from('sellers')
        .select('*')
        .order('name', { ascending: true });
        
      return seededData || [];
    }
    
    return data as SellerDB[];
  } catch (error) {
    console.error('Erro ao buscar vendedores:', error);
    toast({
      title: "Erro ao carregar vendedores",
      description: "Usando dados locais temporariamente. Por favor, verifique sua conexão.",
      variant: "destructive",
    });
    return [...mockSellers];
  }
}

export async function addSeller(seller: Omit<SellerDB, 'id'>): Promise<SellerDB> {
  if (!isSupabaseConfigured) {
    const newSeller: SellerDB = {
      id: mockSellers.length + 1,
      ...seller,
    };
    mockSellers.push(newSeller);
    toast({
      title: "Vendedor adicionado (modo simulado)",
      description: "O vendedor foi salvo localmente.",
    });
    return newSeller;
  }

  try {
    const { data, error } = await supabase
      .from('sellers')
      .insert([seller])
      .select();
    
    if (error) {
      return handleSupabaseError(error, 'adicionar vendedor');
    }
    
    toast({
      title: "Vendedor adicionado",
      description: "O vendedor foi cadastrado com sucesso.",
    });
    
    return data?.[0] as SellerDB;
  } catch (error) {
    return handleSupabaseError(error, 'adicionar vendedor');
  }
}

export async function updateSeller(
  id: number,
  seller: Partial<Omit<SellerDB, 'id'>>
): Promise<SellerDB> {
  if (!isSupabaseConfigured) {
    const index = mockSellers.findIndex(s => s.id === id);
    if (index >= 0) {
      mockSellers[index] = { ...mockSellers[index], ...seller };
      toast({
        title: "Vendedor atualizado (modo simulado)",
        description: "O vendedor foi atualizado localmente.",
      });
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
      return handleSupabaseError(error, 'atualizar vendedor');
    }
    
    toast({
      title: "Vendedor atualizado",
      description: "O vendedor foi atualizado com sucesso.",
    });
    
    return data as SellerDB;
  } catch (error) {
    return handleSupabaseError(error, 'atualizar vendedor');
  }
}

export async function deleteSeller(id: number): Promise<void> {
  if (!isSupabaseConfigured) {
    const index = mockSellers.findIndex(s => s.id === id);
    if (index >= 0) {
      mockSellers.splice(index, 1);
      toast({
        title: "Vendedor removido (modo simulado)",
        description: "O vendedor foi removido localmente.",
      });
      return;
    }
    throw new Error('Vendedor não encontrado');
  }

  try {
    const { error } = await supabase.from('sellers').delete().eq('id', id);
    if (error) {
      handleSupabaseError(error, 'deletar vendedor');
      return;
    }
    
    toast({
      title: "Vendedor removido",
      description: "O vendedor foi removido com sucesso.",
    });
  } catch (error) {
    handleSupabaseError(error, 'deletar vendedor');
  }
}
