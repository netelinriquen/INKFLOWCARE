import { useState, useEffect } from 'react';
import api from '../services/api';

type CheckpointDia = {
  id: number;
  numeroDia: number;
  fase: 'FASE_1_PRIMEIRAS_24H' | 'FASE_2_INICIAL' | 'FASE_3_DESCAMACAO' | 'FASE_4_PROFUNDA';
  statusDia: 'BLOQUEADO' | 'DISPONIVEL' | 'COMPLETO' | 'PARCIAL' | 'PERDIDO';
  xpGanho: number;
  estrelas: 0 | 1 | 2 | 3;
  temQuiz: boolean;
  data: string;
};

export function useCaminho(cicatrizacaoId: number | null) {
  const [caminho, setCaminho] = useState<CheckpointDia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cicatrizacaoId) {
      fetchCaminho();
    }
  }, [cicatrizacaoId]);

  async function fetchCaminho() {
    if (!cicatrizacaoId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/cicatrizacao/${cicatrizacaoId}/caminho`);
      setCaminho(response.data);
    } catch (err: any) {
      console.error('Erro ao buscar caminho:', err);
      setError(err.response?.data?.message || 'Erro ao carregar caminho');
      setCaminho([]);
    } finally {
      setLoading(false);
    }
  }

  return { caminho, loading, error, refetch: fetchCaminho };
}
