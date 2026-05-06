import { useState, useEffect } from 'react';
import api from '@/services/api';

export interface QuizQuestion {
  id: number;
  pergunta: string;
  opcoes: string[];
  respostaCorreta: number; // índice 0-3
  explicacao: string;
  xpBonus: number;
}

export function useQuiz(checkpointDiaId?: number) {
  const [perguntas, setPerguntas] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [respostas, setRespostas] = useState<Record<number, number>>({});
  const [respondido, setRespondido] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [checkpointDiaId]);

  async function fetchQuiz() {
    if (!checkpointDiaId) {
      setPerguntas([]);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get(`/quiz/dia/${checkpointDiaId}`);
      if (response.data && response.data.length > 0) {
        setPerguntas(response.data);
      } else {
        setPerguntas([]);
      }
    } catch (error) {
      console.log('[QUIZ] Erro ao buscar quiz:', error);
      setPerguntas([]);
    } finally {
      setLoading(false);
    }
  }

  function responder(perguntaId: number, opcaoIndex: number) {
    setRespostas(prev => ({ ...prev, [perguntaId]: opcaoIndex }));
  }

  function verificarResposta(perguntaId: number): 'correta' | 'incorreta' | null {
    const resposta = respostas[perguntaId];
    if (resposta === undefined) return null;

    const pergunta = perguntas.find(p => p.id === perguntaId);
    if (!pergunta) return null;

    return resposta === pergunta.respostaCorreta ? 'correta' : 'incorreta';
  }

  async function enviarRespostas() {
    try {
      await api.post('/quiz/responder', { respostas });
    } catch (error) {
      console.log('[QUIZ] Erro ao enviar respostas (usando modo offline)');
    }
    setRespondido(true);
  }

  const acertos = perguntas.filter(p => respostas[p.id] === p.respostaCorreta).length;
  const xpGanho = perguntas
    .filter(p => respostas[p.id] === p.respostaCorreta)
    .reduce((sum, p) => sum + p.xpBonus, 0);
  const todasRespondidas = perguntas.length > 0 && perguntas.every(p => respostas[p.id] !== undefined);

  return {
    perguntas,
    loading,
    respostas,
    respondido,
    responder,
    verificarResposta,
    enviarRespostas,
    acertos,
    xpGanho,
    todasRespondidas,
    totalPerguntas: perguntas.length,
  };
}
