# ✅ CHECKLIST DE IMPLEMENTAÇÃO - APIs Backend

Use este arquivo para acompanhar o progresso da implementação.

---

## 📋 FASE 1 - ESSENCIAIS (Prioridade ALTA)

### 1. Dicas do Dia
- [ ] Criar entity `DicaDia`
- [ ] Criar repository `DicaDiaRepository`
- [ ] Criar controller `DicaController`
- [ ] Adicionar seed data (20-30 dicas)
- [ ] Testar: `GET /api/dicas/dia/7`
- [ ] Validar no app mobile (tela dia/[numero])

**Tempo estimado**: 1h

---

### 2. Estatísticas
- [ ] Criar DTO `EstatisticasDTO`
- [ ] Criar service `EstatisticasService`
  - [ ] Método `calcularEstatisticas()`
  - [ ] Método `calcularStreakAtual()`
  - [ ] Método `calcularMelhorStreak()`
- [ ] Criar controller `EstatisticasController`
- [ ] Testar: `GET /api/estatisticas/cicatrizacao/1`
- [ ] Validar no app mobile (perfil - gráficos)

**Tempo estimado**: 2h

---

### 3. Badges
- [ ] Criar entity `Badge`
- [ ] Criar entity `UsuarioBadge`
- [ ] Criar repositories
- [ ] Criar service `BadgeService`
  - [ ] Método `getBadgesComProgresso()`
  - [ ] Método `calcularProgresso()` (STREAK, XP, CONCLUSAO)
  - [ ] Método `desbloquearBadge()` (automático)
- [ ] Criar controller `BadgeController`
- [ ] Adicionar seed data (9 badges)
- [ ] Testar: `GET /api/badges/usuario/1`
- [ ] Validar no app mobile (perfil - seção conquistas)

**Tempo estimado**: 3h

**✅ Total Fase 1**: 6h

---

## 📋 FASE 2 - FOTOS (Prioridade MÉDIA)

### 4. Configurar Cloudinary
- [ ] Criar conta no Cloudinary (free tier)
- [ ] Obter credenciais:
  - [ ] `CLOUDINARY_CLOUD_NAME`
  - [ ] `CLOUDINARY_API_KEY`
  - [ ] `CLOUDINARY_API_SECRET`
- [ ] Adicionar ao `application.properties`
- [ ] Criar `CloudinaryConfig` bean
- [ ] Adicionar dependência no `pom.xml`

**Tempo estimado**: 1h

---

### 5. Upload de Fotos
- [ ] Criar entity `FotoCicatrizacao`
- [ ] Criar repository `FotoCicatrizacaoRepository`
- [ ] Criar service `FotoService`
  - [ ] Método `uploadFoto()` (Cloudinary)
  - [ ] Método `getFotosByCicatrizacao()`
  - [ ] Método `deletarFoto()` (Cloudinary + DB)
- [ ] Criar controller `FotoController`
- [ ] Testar upload: `POST /api/fotos/cicatrizacao/1` (Postman)
- [ ] Testar listagem: `GET /api/fotos/cicatrizacao/1`
- [ ] Testar deleção: `DELETE /api/fotos/1`
- [ ] Validar no app mobile (tela dia/[numero] - botão foto)

**Tempo estimado**: 4h

**✅ Total Fase 2**: 5h

---

## 📋 FASE 3 - QUIZ (Prioridade MÉDIA)

### 6. Quiz
- [ ] Criar entity `QuizPergunta`
- [ ] Criar entity `QuizResposta`
- [ ] Criar repositories
- [ ] Criar service `QuizService`
  - [ ] Método `getPerguntasByDia()`
  - [ ] Método `processarRespostas()`
  - [ ] Método `calcularXpGanho()`
- [ ] Criar controller `QuizController`
- [ ] Adicionar seed data (10-15 perguntas)
- [ ] Testar: `GET /api/quiz/dia/7`
- [ ] Testar: `POST /api/quiz/responder`
- [ ] Validar no app mobile (tela quiz/[diaId])

**Tempo estimado**: 3h

**✅ Total Fase 3**: 3h

---

## 📋 FASE 4 - EXTRAS (Prioridade BAIXA)

### 7. Notificações (Preferências)
- [ ] Criar entity `NotificacaoPreferencia`
- [ ] Criar repository `NotificacaoPreferenciaRepository`
- [ ] Criar controller `NotificacaoController`
  - [ ] Método `getPreferencias()`
  - [ ] Método `atualizarPreferencias()`
  - [ ] Método `criarPreferenciaPadrao()`
- [ ] Testar: `GET /api/notificacoes/usuario/1`
- [ ] Testar: `PUT /api/notificacoes/usuario/1`
- [ ] Validar no app mobile (perfil - toggle notificações)

**Tempo estimado**: 2h

---

### 8. Guia de Cuidados (Opcional)
- [ ] Criar entity `GuiaCategoria`
- [ ] Criar entity `GuiaArtigo`
- [ ] Criar repositories
- [ ] Criar controller `GuiaController`
- [ ] Adicionar seed data (5-10 artigos)
- [ ] Testar: `GET /api/guia/categorias`
- [ ] Testar: `GET /api/guia/categoria/1`
- [ ] Validar no app mobile (tab explore)

**Tempo estimado**: 2h

**✅ Total Fase 4**: 4h

---

## 🎯 PROGRESSO GERAL

```
Fase 1 - Essenciais:    [ ] 0/3 endpoints (0%)
Fase 2 - Fotos:         [ ] 0/3 endpoints (0%)
Fase 3 - Quiz:          [ ] 0/2 endpoints (0%)
Fase 4 - Extras:        [ ] 0/4 endpoints (0%)

TOTAL:                  [ ] 0/12 endpoints (0%)
```

---

## 🧪 TESTES RÁPIDOS

### Após cada endpoint implementado:

```bash
# 1. Fazer login e obter token
TOKEN=$(curl -s -X POST https://inkflowbackend-4w1g.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cat@gmail.com","senha":"cat"}' \
  | jq -r '.token')

# 2. Testar endpoint específico
curl -H "Authorization: Bearer $TOKEN" \
  https://inkflowbackend-4w1g.onrender.com/api/[ENDPOINT]
```

### Validação no App Mobile:

1. Abrir app no navegador (`npx expo start` → pressionar `w`)
2. Fazer login com `cat@gmail.com` / `cat`
3. Navegar até a tela que usa o endpoint
4. Verificar se dados reais aparecem (não mock)
5. Verificar console do navegador (F12) para erros

---

## 📊 MÉTRICAS DE SUCESSO

- [ ] Todos os 12 endpoints implementados
- [ ] Todos os testes curl passando
- [ ] App mobile mostra dados reais (não mock)
- [ ] Zero erros no console do app
- [ ] Upload de fotos funcionando
- [ ] Badges desbloqueando automaticamente
- [ ] Quiz salvando respostas e calculando XP
- [ ] Gráficos de estatísticas renderizando

---

## 🚨 TROUBLESHOOTING

### Endpoint retorna 401 Unauthorized
- Verificar se JWT está sendo enviado no header
- Verificar se token não expirou (24h)
- Fazer novo login para obter token fresco

### Endpoint retorna 500 Internal Server Error
- Verificar logs do Spring Boot
- Verificar se entities estão mapeadas corretamente
- Verificar se relacionamentos (@ManyToOne, etc) estão corretos

### App mobile continua mostrando mock data
- Verificar se endpoint está retornando status 200
- Verificar estrutura do JSON (deve bater com interface TypeScript)
- Verificar console do navegador para erros de CORS
- Limpar cache do Expo: `npx expo start -c`

### Upload de foto falha
- Verificar credenciais do Cloudinary
- Verificar se arquivo não excede 10MB
- Verificar logs do Spring Boot para erro específico
- Testar upload direto no Cloudinary Dashboard

---

## 📝 NOTAS

- Marque cada checkbox com `[x]` conforme completar
- Atualize o progresso geral após cada fase
- Documente problemas encontrados abaixo

### Problemas Encontrados:
```
[Espaço para anotar problemas e soluções]
```

### Melhorias Futuras:
```
[Espaço para anotar ideias de melhorias]
```
