import { useState, useEffect } from 'react';
import api from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Badge {
  id: number;
  nome: string;
  descricao: string;
  icone: string;
  categoria: 'STREAK' | 'XP' | 'CONCLUSAO' | 'ESPECIAL';
  desbloqueado: boolean;
  dataDesbloqueio?: string;
  progresso?: number;
}

export function useBadges(usuarioId?: number) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [novasBadges, setNovasBadges] = useState<Badge[]>([]);

  useEffect(() => {
    fetchBadges();
  }, [usuarioId]);

  async function fetchBadges() {
    if (!usuarioId) {
      setBadges([]);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get(`/badges/usuario/${usuarioId}`);
      if (response.data && response.data.length > 0) {
        // Verificar se há novas badges desbloqueadas
        const storedKey = `@inkflow:badges_seen_${usuarioId}`;
        const seenIds = JSON.parse(await AsyncStorage.getItem(storedKey) || '[]');
        
        const novas = response.data.filter(
          (b: Badge) => b.desbloqueado && !seenIds.includes(b.id)
        );
        
        if (novas.length > 0) {
          setNovasBadges(novas);
          const allSeenIds = [...seenIds, ...novas.map((b: Badge) => b.id)];
          await AsyncStorage.setItem(storedKey, JSON.stringify(allSeenIds));
        }

        setBadges(response.data);
      } else {
        setBadges([]);
      }
    } catch (error) {
      console.log('[BADGES] Erro ao buscar badges:', error);
      setBadges([]);
    } finally {
      setLoading(false);
    }
  }

  function limparNovasBadges() {
    setNovasBadges([]);
  }

  const desbloqueadas = badges.filter(b => b.desbloqueado).length;
  const totalBadges = badges.length;

  return {
    badges,
    loading,
    novasBadges,
    limparNovasBadges,
    desbloqueadas,
    totalBadges,
    refresh: fetchBadges,
  };
}
