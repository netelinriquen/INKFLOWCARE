# 🚀 Guia Rápido — InkFlowCare

---

## 🟢 ENDPOINTS FUNCIONANDO

| Método | Endpoint | Usado em |
|--------|----------|----------|
| `POST` | `/api/auth/login` | `context/auth.tsx` |
| `GET` | `/api/cicatrizacao/ativa/{clienteId}` | `hooks/useCicatrizacao.ts` |
| `GET` | `/api/cicatrizacao/{id}/caminho` | `hooks/useCaminho.ts` |
| `GET` | `/api/cicatrizacao/{id}/checklist/dia/{dia}` | `hooks/useChecklist.ts` |
| `PATCH` | `/api/cicatrizacao/{id}/checklist/{itemId}/toggle` | `hooks/useChecklist.ts` |
| `POST` | `/api/cicatrizacao/criar` | `app/nova-tatuagem.tsx` |
| `GET` | `/api/cicatrizacao/usuario/{id}/historico` | `app/(tabs)/perfil.tsx` |
| `GET` | `/api/badges/usuario/{id}` | `hooks/useBadges.ts` |
| `GET` | `/api/estatisticas/cicatrizacao/{id}` | `hooks/useEstatisticas.ts` |
| `GET` | `/api/dicas/dia/{numero}` | `app/dia/[numero].tsx` |
| `GET` | `/api/fotos/cicatrizacao/{id}` | `hooks/useFotos.ts` |
| `POST` | `/api/fotos/cicatrizacao/{id}` | `hooks/useFotos.ts` |
| `DELETE` | `/api/fotos/{id}` | `hooks/useFotos.ts` |
| `GET` | `/api/quiz/dia/{diaNumero}` | `hooks/useQuiz.ts` |
| `POST` | `/api/quiz/responder` | `hooks/useQuiz.ts` |
| `GET` | `/api/notificacoes/usuario/{id}` | `hooks/useNotifications.ts` |
| `PUT` | `/api/notificacoes/usuario/{id}` | `hooks/useNotifications.ts` |
| `PUT` | `/api/clientes/{id}` | `app/(tabs)/perfil.tsx` |

*(Consulte `API_ENDPOINTS.md` para payload e responses exatos).*

---

## 🟡 ENDPOINTS PENDENTES

Nenhum. Todos os endpoints críticos estão implementados. ✅

---

## 🧪 COMO TESTAR RAPIDAMENTE

**1. Obter Token:**
```bash
TOKEN=$(curl -s -X POST https://inkflowbackend-4w1g.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cat@gmail.com","password":"cat"}' \
  | jq -r '.token')
```

**2. Fazer Requisição:**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://inkflowbackend-4w1g.onrender.com/api/seu-endpoint-aqui
```

> **Atenção:** Em caso de erro 500, o problema geralmente é no banco Somee (timeout/cold-start) ou dados de teste inconsistentes. Tente novamente ou recrie o JWT.
