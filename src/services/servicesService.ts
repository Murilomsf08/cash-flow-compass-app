
import { supabase, isSupabaseConfigured, handleSupabaseError } from './config/supabaseConfig';
import { ServiceDB, mockServices } from './types/serviceTypes';
import { initializeServicesTable, seedInitialServices } from './database/initializeDb';
import { toast } from "@/hooks/use-toast";

// Initialize the database
initializeServicesTable();

export async function getServices(): Promise<ServiceDB[]> {
  if (!isSupabaseConfigured) {
    console.warn('Usando dados simulados para serviços. Conecte-se ao Supabase para dados reais.');
    return [...mockServices];
  }

  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      return handleSupabaseError(error, 'buscar serviços');
    }
    
    if (!data || data.length === 0) {
      console.log('Nenhum serviço encontrado no banco de dados.');
      await seedInitialServices();
      const { data: seededData, error: seedError } = await supabase
        .from('services')
        .select('*')
        .order('date', { ascending: false });
      
      if (seedError) {
        return handleSupabaseError(seedError, 'buscar serviços iniciais');
      }
        
      return seededData || [];
    }
    
    return data as ServiceDB[];
  } catch (error) {
    console.error('Erro ao buscar serviços, usando dados mock:', error);
    toast({
      title: "Erro ao carregar serviços",
      description: "Usando dados locais temporariamente. Por favor, verifique sua conexão.",
      variant: "destructive",
    });
    return [...mockServices];
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
    toast({
      title: "Serviço adicionado (modo simulado)",
      description: "O serviço foi salvo localmente, mas não no banco de dados.",
      variant: "default",
    });
    return { ...newService };
  }

  try {
    const { data, error } = await supabase
      .from('services')
      .insert([service])
      .select();
    
    if (error) {
      return handleSupabaseError(error, 'adicionar serviço');
    }
    
    toast({
      title: "Serviço adicionado",
      description: "O serviço foi cadastrado com sucesso.",
    });
    
    return data?.[0] as ServiceDB;
  } catch (error) {
    return handleSupabaseError(error, 'adicionar serviço');
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
      toast({
        title: "Serviço atualizado (modo simulado)",
        description: "O serviço foi atualizado localmente, mas não no banco de dados.",
      });
      return { ...mockServices[index] };
    }
    toast({
      title: "Erro",
      description: "Serviço não encontrado.",
      variant: "destructive",
    });
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
      return handleSupabaseError(error, 'atualizar serviço');
    }
    
    toast({
      title: "Serviço atualizado",
      description: "O serviço foi atualizado com sucesso.",
    });
    
    return data as ServiceDB;
  } catch (error) {
    return handleSupabaseError(error, 'atualizar serviço');
  }
}

export async function deleteService(id: number): Promise<void> {
  if (!isSupabaseConfigured) {
    console.warn('Usando dados simulados. Conecte-se ao Supabase para dados reais.');
    const index = mockServices.findIndex(p => p.id === id);
    if (index >= 0) {
      mockServices.splice(index, 1);
      toast({
        title: "Serviço removido (modo simulado)",
        description: "O serviço foi removido localmente, mas não no banco de dados.",
      });
      return;
    }
    toast({
      title: "Erro",
      description: "Serviço não encontrado.",
      variant: "destructive",
    });
    throw new Error('Serviço não encontrado');
  }

  try {
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) {
      handleSupabaseError(error, 'deletar serviço');
      return;
    }
    
    toast({
      title: "Serviço removido",
      description: "O serviço foi removido com sucesso.",
    });
  } catch (error) {
    handleSupabaseError(error, 'deletar serviço');
  }
}

export async function toggleServiceStatus(id: number, newStatus: string): Promise<ServiceDB> {
  return updateService(id, { status: newStatus });
}
