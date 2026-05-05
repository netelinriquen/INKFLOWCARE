# InkFlowCare — Status do Projeto

## ✅ Mobile (Frontend) — COMPLETO

### Telas
- [x] Login com JWT + AsyncStorage
- [x] Dashboard (card ativo, lembretes, checklist)
- [x] Recovery Progress (caminho Duolingo, nós, zigzag)
- [x] Guia de Cuidados (4 fases, checklist por período, FAQ)
- [x] Perfil (stats, badges, tatuagens, toggles, logout)
- [x] Tela dia/[numero] (resumo XP/estrelas, checklist, dicas)
- [x] Tela quiz/[diaId] (perguntas, feedback, resultado, XP)

### Hooks
- [x] `useCicatrizacao` — cicatrização ativa
- [x] `useChecklist` — checklist diário + toggle
- [x] `useCaminho` — checkpoints do caminho
- [x] `useNotifications` — preferências de notificação
- [x] `useBadges` — conquistas (9 badges mockados)
- [x] `useFotos` — upload com image picker
- [x] `useEstatisticas` — XP, streak, taxa conclusão
- [x] `useQuiz` — perguntas + verificação + XP

### Infra
- [x] Design system (#0e0e0e, #1E1E1E, #FF4757, #ff8d8c)
- [x] Navegação 4 tabs (grid, bandage, document, person)
- [x] Auth guard com useEffect + router.replace
- [x] Compatibilidade web (toggles custom, sem expo-notifications)

---

## 🚧 Backend (Spring Boot) — 12 ENDPOINTS PENDENTES

### Documentação criada (docs/)
- `README.md` — ponto de entrada
- `INDICE_COMPLETO.md` — mapa mental + glossário
- `README_APIS.md` — guia de leitura APIs
- `RESUMO_EXECUTIVO.md` — plano 4 fases (18h total)
- `API_ENDPOINTS.md` — 12 endpoints com DTOs + curl
- `SPRING_BOOT_IMPLEMENTATION.md` — código Java completo
- `CHECKLIST_IMPLEMENTACAO.md` — progresso interativo
- `REFERENCIA_RAPIDA.md` — tabela de consulta
- `FLUXO_DE_DADOS.md` — diagramas ASCII
- `SEED_DATA.sql` — badges, dicas, quiz, guia

### Endpoints por fase

#### 🔴 Fase 1 — ALTA (~6h)
- [ ] `GET /badges/usuario/{id}`
- [ ] `GET /estatisticas/cicatrizacao/{id}`
- [ ] `GET /dicas/dia/{numero}`

#### 🟡 Fase 2 — MÉDIA (~5h)
- [ ] `POST /fotos/cicatrizacao/{id}`
- [ ] `GET /fotos/cicatrizacao/{id}`
- [ ] `DELETE /fotos/{id}`

#### 🟡 Fase 3 — MÉDIA (~3h)
- [ ] `GET /quiz/dia/{id}`
- [ ] `POST /quiz/responder`

#### 🟢 Fase 4 — BAIXA (~4h)
- [ ] `GET /notificacoes/usuario/{id}`
- [ ] `PUT /notificacoes/usuario/{id}`
- [ ] `GET /guia/categorias`
- [ ] `GET /guia/categoria/{id}`

---

## 📦 Dependências instaladas
```
expo-notifications, expo-device, expo-image-picker
```

## 🔑 Próximo passo
Implementar os 12 endpoints no backend Spring Boot seguindo `docs/SPRING_BOOT_IMPLEMENTATION.md` + rodar `docs/SEED_DATA.sql`.
