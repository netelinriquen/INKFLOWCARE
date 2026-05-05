import { useState, useEffect } from 'react';
import api from '../services/api';

type ChecklistItem = {
  id: number;
  periodo: 'MANHA' | 'TARDE' | 'NOITE';
  ordem: number;
  descricao: string;
  concluido: boolean;
  dataMarcacao?: string;
};

export function useChecklist(cicatrizacaoId: number | null, numeroDia: number) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cicatrizacaoId) {
      fetchChecklist();
    }
  }, [cicatrizacaoId, numeroDia]);

  async function fetchChecklist() {
    if (!cicatrizacaoId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/cicatrizacao/${cicatrizacaoId}/checklist/dia/${numeroDia}`);
      setChecklist(response.data);
    } catch (err: any) {
      console.error('Erro ao buscar checklist:', err);
      setError(err.response?.data?.message || 'Erro ao carregar checklist');
      setChecklist([]);
    } finally {
      setLoading(false);
    }
  }

  async function toggleItem(itemId: number) {
    if (!cicatrizacaoId) return;
    
    try {
      // Atualiza otimisticamente
      setChecklist(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, concluido: !item.concluido } 
            : item
        )
      );

      await api.patch(`/cicatrizacao/${cicatrizacaoId}/checklist/${itemId}/toggle`);
      
      // Refetch para garantir sincronização (XP e estrelas atualizados)
      await fetchChecklist();
    } catch (err: any) {
      console.error('Erro ao toggle item:', err);
      // Reverte em caso de erro
      await fetchChecklist();
    }
  }

  return { checklist, loading, error, toggleItem, refetch: fetchChecklist };
}
