import { useState, useEffect } from 'react';
import { _axios } from '@/Api/axios.config';
import { toast } from 'sonner';

export interface Patient {
  id: number;
  nome_completo: string;
  numero_identificacao?: string;
  data_nascimento?: string;
  genero?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  criado_aos: string;
  actualizado_aos: string;
}

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await _axios.get('/pacients');
      setPatients(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao buscar pacientes';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Erro ao buscar pacientes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const refetch = () => {
    fetchPatients();
  };

  return {
    patients,
    isLoading,
    error,
    refetch,
  };
}