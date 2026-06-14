import { useState, useEffect } from 'react';
import api from '@/services/api';

export interface Estatisticas {
  xpPorDia: { dia: number; xp: number }[];
  streakAtual: number;
  melhorStreak: number;
  diasCompletos: number;
  totalDias: number;
  taxaConclusao: number;
}

const EMPTY_STATS: Estatisticas = {
  xpPorDia: [],
  streakAtual: 0,
  melhorStreak: 0,
  diasCompletos: 0,
  totalDias: 0,
  taxaConclusao: 0,
};

export function useEstatisticas(cicatrizacaoId?: number) {
  const [stats, setStats] = useState<Estatisticas>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [cicatrizacaoId]);

  async function fetchStats() {
    if (!cicatrizacaoId) {
      setStats(EMPTY_STATS);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get(`/estatisticas/cicatrizacao/${cicatrizacaoId}`);
      if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.log('[STATS] Erro ao buscar estatísticas:', error);
      setStats(EMPTY_STATS);
    } finally {
      setLoading(false);
    }
  }

  const xpTotal = stats.xpPorDia.reduce((sum, d) => sum + d.xp, 0);
  const xpMedio = stats.xpPorDia.length > 0
    ? Math.round(xpTotal / stats.xpPorDia.length)
    : 0;

  return {
    stats,
    loading,
    xpTotal,
    xpMedio,
    refresh: fetchStats,
  };
}
