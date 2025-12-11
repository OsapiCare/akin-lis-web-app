import { useState, useEffect } from 'react';
import { _axios } from '@/Api/axios.config';
import { toast } from 'sonner';

export interface Exam {
  id: number;
  nome: string;
  descricao?: string;
  preco: number;
  duracao_estimada?: number;
  status: string;
  criado_aos: string;
  actualizado_aos: string;
}

export function useExams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExams = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await _axios.get('/exams');
      setExams(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao buscar exames';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Erro ao buscar exames:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const refetch = () => {
    fetchExams();
  };

  return {
    exams,
    isLoading,
    error,
    refetch,
  };
}