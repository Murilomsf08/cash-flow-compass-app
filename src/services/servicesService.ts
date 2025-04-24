
import { supabase, isSupabaseConfigured } from './config/supabaseConfig';
import { ServiceDB, mockServices } from './types/serviceTypes';
import { initializeServicesTable, seedInitialServices } from './database/initializeDb';

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
      console.error('Erro ao buscar serviços:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log('Nenhum serviço encontrado no banco de dados.');
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
    return { ...newService };
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
      return { ...mockServices[index] };
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
