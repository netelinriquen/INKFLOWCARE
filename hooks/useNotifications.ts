import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/services/api';

const NOTIF_PREFS_KEY = '@inkflow:notif_prefs';

export interface NotifPreferences {
  ativas: boolean;
  horarioManha: string;
  horarioTarde: string;
  horarioNoite: string;
}

const DEFAULT_PREFS: NotifPreferences = {
  ativas: true,
  horarioManha: '08:00',
  horarioTarde: '14:00',
  horarioNoite: '21:00',
};

export function useNotifications(usuarioId?: number) {
  const [permissao, setPermissao] = useState(Platform.OS === 'web');
  const [prefs, setPrefs] = useState<NotifPreferences>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarPrefs();
  }, [usuarioId]);

  async function carregarPrefs() {
    // Tentar carregar do backend primeiro
    if (usuarioId) {
      try {
        const response = await api.get(`/notificacoes/usuario/${usuarioId}`);
        if (response.data) {
          const backendPrefs: NotifPreferences = {
            ativas: response.data.notificacoesAtivas ?? true,
            horarioManha: response.data.horarioManha ?? '08:00',
            horarioTarde: response.data.horarioTarde ?? '14:00',
            horarioNoite: response.data.horarioNoite ?? '21:00',
          };
          setPrefs(backendPrefs);
          await AsyncStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(backendPrefs));
          setLoading(false);
          return;
        }
      } catch (e) {
        console.log('[NOTIF] Backend indisponível, usando cache local');
      }
    }

    // Fallback: AsyncStorage local
    try {
      const stored = await AsyncStorage.getItem(NOTIF_PREFS_KEY);
      if (stored) {
        setPrefs(JSON.parse(stored));
      }
    } catch (e) {
      console.error('[NOTIF] Erro ao carregar prefs:', e);
    } finally {
      setLoading(false);
    }
  }

  async function salvarPrefs(novasPrefs: NotifPreferences) {
    setPrefs(novasPrefs);
    await AsyncStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(novasPrefs));

    // Sincronizar com backend
    if (usuarioId) {
      try {
        await api.put(`/notificacoes/usuario/${usuarioId}`, {
          notificacoesAtivas: novasPrefs.ativas,
          horarioManha: novasPrefs.horarioManha,
          horarioTarde: novasPrefs.horarioTarde,
          horarioNoite: novasPrefs.horarioNoite,
        });
      } catch (e) {
        console.log('[NOTIF] Erro ao sincronizar com backend (salvo localmente)');
      }
    }
  }

  const toggleAtivas = useCallback(async () => {
    const novasPrefs = { ...prefs, ativas: !prefs.ativas };
    await salvarPrefs(novasPrefs);
  }, [prefs, usuarioId]);

  async function atualizarHorario(
    periodo: 'horarioManha' | 'horarioTarde' | 'horarioNoite',
    horario: string
  ) {
    const novasPrefs = { ...prefs, [periodo]: horario };
    await salvarPrefs(novasPrefs);
  }

  async function cancelarTodas() {
    console.log('[NOTIF] cancelarTodas (no-op na web)');
  }

  return {
    permissao,
    prefs,
    loading,
    toggleAtivas,
    atualizarHorario,
    cancelarTodas,
  };
}
