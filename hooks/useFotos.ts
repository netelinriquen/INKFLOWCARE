import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '@/services/api';

export interface Foto {
  id: number;
  urlImagem: string;
  numeroDia: number;
  dataUpload: string;
  legenda?: string;
}

export function useFotos(cicatrizacaoId?: number) {
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchFotos();
  }, [cicatrizacaoId]);

  async function fetchFotos() {
    if (!cicatrizacaoId) {
      setFotos([]);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get(`/fotos/cicatrizacao/${cicatrizacaoId}`);
      if (response.data && response.data.length > 0) {
        setFotos(response.data);
      } else {
        setFotos([]);
      }
    } catch (error) {
      console.log('[FOTOS] Erro ao buscar fotos:', error);
      setFotos([]);
    } finally {
      setLoading(false);
    }
  }

  async function pickAndUpload(numeroDia: number, legenda?: string): Promise<boolean> {
    if (!cicatrizacaoId) return false;

    try {
      // Pedir permissão
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        console.log('[FOTOS] Permissão negada');
        return false;
      }

      // Abrir gallery
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7, // Compressão — max ~1MB
      });

      if (result.canceled || !result.assets[0]) return false;

      const asset = result.assets[0];
      setUploading(true);

      // Upload real para o backend
      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        type: 'image/jpeg',
        name: `dia_${numeroDia}_${Date.now()}.jpg`,
      } as any);
      formData.append('numeroDia', String(numeroDia));
      if (legenda) formData.append('legenda', legenda);

      await api.post(`/fotos/cicatrizacao/${cicatrizacaoId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await fetchFotos(); // Recarregar lista
      return true;
    } catch (error) {
      console.error('[FOTOS] Erro no upload:', error);
      return false;
    } finally {
      setUploading(false);
    }
  }

  async function deletarFoto(fotoId: number): Promise<boolean> {
    try {
      await api.delete(`/fotos/${fotoId}`);
      setFotos(prev => prev.filter(f => f.id !== fotoId));
      return true;
    } catch (error) {
      console.error('[FOTOS] Erro ao deletar:', error);
      return false;
    }
  }

  return {
    fotos,
    loading,
    uploading,
    pickAndUpload,
    deletarFoto,
    refresh: fetchFotos,
  };
}
