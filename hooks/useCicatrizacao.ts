import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/auth';

type Cicatrizacao = {
  id: number;
  agendamento: {
    id: number;
    dataHora: string;
    regiao: string;
    artista: { nome: string };
  };
  dataInicio: string;
  dataFim: string;
  periodoTotalDias: number;
  status: 'ATIVA' | 'CONCLUIDA' | 'ABANDONADA';
  xpTotal: number;
  diaAtual: number;
  faseAtual: 'FASE_1_PRIMEIRAS_24H' | 'FASE_2_INICIAL' | 'FASE_3_DESCAMACAO' | 'FASE_4_PROFUNDA';
};

export function useCicatrizacao() {
  const { user } = useAuth();
  const [cicatrizacao, setCicatrizacao] = useState<Cicatrizacao | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchCicatrizacao();
    }
  }, [user?.id]);

  async function fetchCicatrizacao() {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/cicatrizacao/ativa/${user?.id}`);
      
      if (response.status === 204) {
        setCicatrizacao(null);
      } else {
        setCicatrizacao(response.data);
      }
    } catch (err: any) {
      console.error('Erro ao buscar cicatrização:', err);
      setError(err.response?.data?.message || 'Erro ao carregar dados');
      setCicatrizacao(null);
    } finally {
      setLoading(false);
    }
  }

  return { cicatrizacao, loading, error, refetch: fetchCicatrizacao };
}
