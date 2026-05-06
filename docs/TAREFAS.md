# InkFlowCare — Status do Projeto

## ✅ Backend — 12 Endpoints (Deploy no Render)

| Endpoint | Método | Status |
|----------|--------|--------|
| `/api/badges/usuario/{id}` | GET | ✅ |
| `/api/estatisticas/cicatrizacao/{id}` | GET | ✅ |
| `/api/dicas/dia/{numeroDia}` | GET | ✅ |
| `/api/fotos/cicatrizacao/{id}` | GET | ✅ |
| `/api/fotos/cicatrizacao/{id}` | POST | ✅ |
| `/api/fotos/{fotoId}` | DELETE | ✅ |
| `/api/quiz/dia/{diaNumero}` | GET | ✅ |
| `/api/quiz/responder` | POST | ✅ |
| `/api/notificacoes/usuario/{id}` | GET | ✅ |
| `/api/notificacoes/usuario/{id}` | PUT | ✅ |
| `/api/cicatrizacao/**` | GET/PATCH | ✅ (já existia) |

---

## ✅ Mobile — Hooks Integrados ao Backend

| Hook | Endpoint | Fallback |
|------|----------|----------|
| `useBadges` | `/api/badges/usuario/{id}` | Mock 9 badges |
| `useQuiz` | `/api/quiz/dia/{id}` + `/quiz/responder` | Mock 5 perguntas |
| `useEstatisticas` | `/api/estatisticas/cicatrizacao/{id}` | Mock XP/streak |
| `useFotos` | `/api/fotos/cicatrizacao/{id}` | Mock 5 fotos |
| `useNotifications` | `/api/notificacoes/usuario/{id}` | AsyncStorage local |
| `useCicatrizacao` | `/api/cicatrizacao/ativa/{id}` | null |
| `useChecklist` | `/api/cicatrizacao/checklist/**` | - |
| `useCaminho` | `/api/cicatrizacao/caminho/**` | - |

---

## ✅ Telas Completas

- Caminho (estilo Duolingo)
- Dia/[numero] (checklist + dicas + XP)
- Quiz/[diaId] (perguntas + feedback)
- Perfil (badges + notificações + histórico)
- Explore (conteúdo educacional)

---

## ✅ Banco (Somee / SQL Server)

Seed data populado:
- 9 badges com critérios
- 28 dicas com range de dias
- 15 perguntas de quiz (dias 7, 14, 21)
- 60 opções de quiz

---

## 🔑 Referências
- Backend: `https://inkflowbackend-4w1g.onrender.com/api`
- Branch: `teste`
- Docs: `docs/DOCS.md`
