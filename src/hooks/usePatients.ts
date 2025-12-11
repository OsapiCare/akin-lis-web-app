import { patientRoutes } from '@/Api/Routes/patients';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Patient {
    id: number;
    nome_completo: string;
    numero_identificacao: string;
    data_nascimento: string;
    telefone: string;
    email: string;
    endereco: string;
    historico_medico: string;
    observacoes: string;
}

export function usePatients() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            setIsLoading(true);
            const { data: pacientes } = useQuery({
                queryKey: ['patient'],
                queryFn: async () => {
                    const response = await patientRoutes.getAllPacients();
                    return response.data;
                },
            })
            console.log(pacientes);

            if (!pacientes || pacientes.length === 0) {
                toast.error('Nenhum paciente encontrado.');
                throw new Error('Erro ao carregar pacientes');
            }

            const data = pacientes;
            setPatients(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        patients,
        isLoading,
        error,
        refetch: fetchPatients
    };
}