import { examRoutes } from '@/Api/Routes/Exam/index.route';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

interface Exam {
    id: number;
    nome: string;
    descricao: string;
    preco: number;
    categoria: string;
    prazo_dias: number;
    status: string;
}

export function useExams() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            setIsLoading(true);
            const response = useQuery({
                queryKey: ['exams'],
                queryFn: async () => {
                    const res = await examRoutes.getExamTypes();
                    return res.data;
                },
            })

            if (response.data.length === 0) {
                throw new Error('Erro ao carregar tipos de exame');
            }

            const data = await response.data;
            setExams(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        exams,
        isLoading,
        error,
        refetch: fetchExams
    };
}