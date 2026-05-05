# 📋 REFERÊNCIA RÁPIDA - Endpoints

Tabela de consulta rápida para todos os endpoints.

---

## ✅ ENDPOINTS FUNCIONANDO

| Método | Endpoint | Usado em | Status |
|--------|----------|----------|--------|
| POST | `/auth/login` | context/auth.tsx | ✅ OK |
| GET | `/cicatrizacao/usuario/{id}/ativa` | hooks/useCicatrizacao.ts | ✅ OK |
| GET | `/checklist/cicatrizacao/{id}/dia/{dia}` | hooks/useChecklist.ts | ✅ OK |
| PATCH | `/checklist/item/{id}/toggle` | hooks/useChecklist.ts | ✅ OK |
| GET | `/checkpoint-dias/cicatrizacao/{id}` | hooks/useCaminho.ts | ✅ OK |

---

## 🚧 ENDPOINTS PENDENTES

### 🔴 PRIORIDADE ALTA

| Método | Endpoint | Request | Response | Usado em | Tempo |
|--------|----------|---------|----------|----------|-------|
| GET | `/badges/usuario/{id}` | - | Array<Badge> | hooks/useBadges.ts | 3h |
| GET | `/estatisticas/cicatrizacao/{id}` | - | Estatisticas | hooks/useEstatisticas.ts | 2h |
| GET | `/dicas/dia/{numero}` | - | Array<Dica> | app/dia/[numero].tsx | 1h |

**Total Fase 1**: 6h

---

### 🟡 PRIORIDADE MÉDIA

| Método | Endpoint | Request | Response | Usado em | Tempo |
|--------|----------|---------|----------|----------|-------|
| POST | `/fotos/cicatrizacao/{id}` | multipart/form-data | Foto | hooks/useFotos.ts | 3h |
| GET | `/fotos/cicatrizacao/{id}` | - | Array<Foto> | hooks/useFotos.ts | 1h |
| DELETE | `/fotos/{id}` | - | 204 No Content | hooks/useFotos.ts | 1h |
| GET | `/quiz/dia/{id}` | - | Array<QuizPergunta> | hooks/useQuiz.ts | 2h |
| POST | `/quiz/responder` | QuizResposta | QuizResultado | hooks/useQuiz.ts | 1h |

**Total Fase 2+3**: 8h

---

### 🟢 PRIORIDADE BAIXA

| Método | Endpoint | Request | Response | Usado em | Tempo |
|--------|----------|---------|----------|----------|-------|
| GET | `/notificacoes/usuario/{id}` | - | NotifPreferencia | hooks/useNotifications.ts | 1h |
| PUT | `/notificacoes/usuario/{id}` | NotifPreferencia | NotifPreferencia | hooks/useNotifications.ts | 1h |
| GET | `/guia/categorias` | - | Array<Categoria> | app/(tabs)/explore.tsx | 1h |
| GET | `/guia/categoria/{id}` | - | Array<Artigo> | app/(tabs)/explore.tsx | 1h |

**Total Fase 4**: 4h

---

## 📊 ESTRUTURAS DE DADOS

### Badge
```typescript
{
  id: number;
  nome: string;
  descricao: string;
  icone: string;
  categoria: "STREAK" | "XP" | "CONCLUSAO" | "ESPECIAL";
  desbloqueado: boolean;
  dataDesbloqueio?: string;
  progresso?: number;
}
```

### Estatisticas
```typescript
{
  xpPorDia: { dia: number; xp: number }[];
  streakAtual: number;
  melhorStreak: number;
  diasCompletos: number;
  totalDias: number;
  taxaConclusao: number;
}
```

### Dica
```typescript
{
  id: number;
  titulo: string;
  descricao: string;
  icone: string;
}
```

### Foto
```typescript
{
  id: number;
  urlImagem: string;
  numeroDia: number;
  dataUpload: string;
  legenda?: string;
}
```

### QuizPergunta
```typescript
{
  id: number;
  pergunta: string;
  opcoes: string[];
  respostaCorreta: number;
  explicacao: string;
  xpBonus: number;
}
```

### QuizResposta (Request)
```typescript
{
  checkpointDiaId: number;
  usuarioId: number;
  respostas: { [perguntaId: number]: number };
}
```

### QuizResultado (Response)
```typescript
{
  acertos: number;
  totalPerguntas: number;
  xpGanho: number;
  percentualAcerto: number;
}
```

### NotifPreferencia
```typescript
{
  id: number;
  usuario: { id: number };
  horarioManha: string;
  horarioTarde: string;
  horarioNoite: string;
  notificacoesAtivas: boolean;
}
```

---

## 🧪 TESTES CURL

### Badges
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://inkflowbackend-4w1g.onrender.com/api/badges/usuario/1
```

### Estatísticas
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://inkflowbackend-4w1g.onrender.com/api/estatisticas/cicatrizacao/1
```

### Dicas
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://inkflowbackend-4w1g.onrender.com/api/dicas/dia/18
```

### Upload Foto
```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@foto.jpg" \
  -F "numeroDia=18" \
  -F "legenda=Teste" \
  https://inkflowbackend-4w1g.onrender.com/api/fotos/cicatrizacao/1
```

### Listar Fotos
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://inkflowbackend-4w1g.onrender.com/api/fotos/cicatrizacao/1
```

### Deletar Foto
```bash
curl -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  https://inkflowbackend-4w1g.onrender.com/api/fotos/123
```

### Quiz - Perguntas
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://inkflowbackend-4w1g.onrender.com/api/quiz/dia/7
```

### Quiz - Responder
```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"checkpointDiaId":7,"usuarioId":1,"respostas":{"1":1,"2":1,"3":1}}' \
  https://inkflowbackend-4w1g.onrender.com/api/quiz/responder
```

### Notificações - Get
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://inkflowbackend-4w1g.onrender.com/api/notificacoes/usuario/1
```

### Notificações - Update
```bash
curl -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"horarioManha":"08:00","horarioTarde":"14:00","horarioNoite":"21:00","notificacoesAtivas":true}' \
  https://inkflowbackend-4w1g.onrender.com/api/notificacoes/usuario/1
```

---

## 📝 SEED DATA NECESSÁRIO

| Tabela | Quantidade | Arquivo |
|--------|-----------|---------|
| badges | 9 registros | SEED_DATA.sql |
| dicas_dia | 30 registros | SEED_DATA.sql |
| quiz_perguntas | 15 registros | SEED_DATA.sql |
| quiz_opcoes | 60 registros | SEED_DATA.sql |
| guia_categorias | 5 registros | SEED_DATA.sql |
| guia_artigos | 10 registros | SEED_DATA.sql |

---

## 🔧 ENTITIES NECESSÁRIAS

| Entity | Relacionamentos | Campos principais |
|--------|----------------|-------------------|
| Badge | - | nome, descricao, icone, categoria |
| UsuarioBadge | ManyToOne Usuario, Badge | dataDesbloqueio |
| FotoCicatrizacao | ManyToOne Cicatrizacao | urlImagem, cloudinaryId, numeroDia |
| QuizPergunta | ManyToOne CheckpointDia | pergunta, opcoes, respostaCorreta |
| QuizResposta | ManyToOne Usuario, CheckpointDia | respostas, acertos, xpGanho |
| DicaDia | - | numeroDia, titulo, descricao, icone |
| NotificacaoPreferencia | OneToOne Usuario | horarios (manhã/tarde/noite) |
| GuiaCategoria | - | nome, icone, cor |
| GuiaArtigo | ManyToOne GuiaCategoria | titulo, conteudo (markdown) |

---

## 🎯 CHECKLIST RÁPIDO

### Fase 1 - Essenciais
- [ ] DicaDia entity + controller
- [ ] EstatisticasService + controller
- [ ] Badge + UsuarioBadge entities
- [ ] BadgeService (cálculo de progresso)
- [ ] Seed data (badges + dicas)

### Fase 2 - Fotos
- [ ] Cloudinary config
- [ ] FotoCicatrizacao entity
- [ ] FotoService (upload/delete)
- [ ] FotoController

### Fase 3 - Quiz
- [ ] QuizPergunta + QuizResposta entities
- [ ] QuizService (processar respostas)
- [ ] QuizController
- [ ] Seed data (perguntas + opções)

### Fase 4 - Extras
- [ ] NotificacaoPreferencia entity
- [ ] NotificacaoController
- [ ] GuiaCategoria + GuiaArtigo entities
- [ ] GuiaController
- [ ] Seed data (categorias + artigos)

---

## ⏱️ TEMPO TOTAL

| Fase | Tempo | Prioridade |
|------|-------|-----------|
| Fase 1 | 6h | 🔴 ALTA |
| Fase 2 | 5h | 🟡 MÉDIA |
| Fase 3 | 3h | 🟡 MÉDIA |
| Fase 4 | 4h | 🟢 BAIXA |
| **TOTAL** | **18h** | **~3 dias** |

---

## 🔗 LINKS ÚTEIS

- [Documentação completa](API_ENDPOINTS.md)
- [Código Spring Boot](SPRING_BOOT_IMPLEMENTATION.md)
- [Checklist de implementação](CHECKLIST_IMPLEMENTACAO.md)
- [Fluxo de dados](FLUXO_DE_DADOS.md)
- [Seed data SQL](SEED_DATA.sql)

---

## 💡 DICAS

1. **Comece pela Fase 1** - São os endpoints mais importantes
2. **Teste cada endpoint** - Não acumule problemas
3. **Use o seed data** - Economiza tempo
4. **Consulte o código Java** - Está completo e pronto
5. **Valide no app mobile** - Veja os dados reais funcionando

---

## 🆘 PROBLEMAS COMUNS

| Problema | Solução |
|----------|---------|
| 401 Unauthorized | Verificar JWT no header |
| 500 Internal Error | Verificar logs do Spring Boot |
| Mock data no app | Verificar estrutura do JSON |
| Upload falha | Verificar credenciais Cloudinary |
| CORS error | Adicionar origem no backend |

---

## ✅ SUCESSO

Quando todos os endpoints estiverem implementados:
- ✅ 12/12 endpoints funcionando
- ✅ Todos os testes curl passando
- ✅ App mobile mostra dados reais
- ✅ Zero erros no console
- ✅ Upload de fotos OK
- ✅ Badges desbloqueando
- ✅ Quiz salvando respostas
- ✅ Gráficos renderizando

**Parabéns! 🎉 Backend completo!**
