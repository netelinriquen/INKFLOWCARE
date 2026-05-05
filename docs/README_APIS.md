# 📚 Documentação de APIs - InkFlowCare Backend

Esta pasta contém toda a documentação necessária para implementar os endpoints do backend Spring Boot.

---

## 📖 GUIA DE LEITURA

### 1️⃣ Comece aqui
**[RESUMO_EXECUTIVO.md](RESUMO_EXECUTIVO.md)**
- Visão geral do projeto
- Status atual (o que funciona e o que falta)
- Ordem de implementação por prioridade
- Tempo estimado para cada fase
- Roteiro de testes

### 2️⃣ Referência de endpoints
**[API_ENDPOINTS.md](API_ENDPOINTS.md)**
- Lista completa de todos os 12 endpoints pendentes
- Request/Response de cada endpoint
- Estrutura de dados (DTOs)
- Exemplos de curl para testes
- Tabela de prioridades

### 3️⃣ Código de implementação
**[SPRING_BOOT_IMPLEMENTATION.md](SPRING_BOOT_IMPLEMENTATION.md)**
- Código Java completo para cada endpoint
- Entities, Repositories, Services, Controllers
- Configuração do Cloudinary (upload de fotos)
- Lógica de cálculo de badges e estatísticas
- Dependências necessárias (pom.xml)

### 4️⃣ Acompanhamento
**[CHECKLIST_IMPLEMENTACAO.md](CHECKLIST_IMPLEMENTACAO.md)**
- Checklist interativo para marcar progresso
- Dividido por fases (1, 2, 3, 4)
- Testes rápidos para cada endpoint
- Troubleshooting de problemas comuns
- Métricas de sucesso

### 5️⃣ Dados iniciais
**[SEED_DATA.sql](SEED_DATA.sql)**
- Script SQL completo pronto para executar
- 9 badges pré-cadastradas
- 30 dicas do dia
- 15 perguntas de quiz (dias 7, 14, 21)
- 5 categorias de guia
- 10 artigos de guia

---

## 🎯 FLUXO DE TRABALHO RECOMENDADO

```
1. Ler RESUMO_EXECUTIVO.md
   ↓
2. Escolher uma fase para implementar (começar pela Fase 1)
   ↓
3. Consultar API_ENDPOINTS.md para ver estrutura dos dados
   ↓
4. Copiar código de SPRING_BOOT_IMPLEMENTATION.md
   ↓
5. Executar SEED_DATA.sql no banco
   ↓
6. Testar endpoint com curl (exemplos no RESUMO_EXECUTIVO.md)
   ↓
7. Marcar checkbox em CHECKLIST_IMPLEMENTACAO.md
   ↓
8. Validar no app mobile
   ↓
9. Repetir para próximo endpoint
```

---

## 📊 RESUMO RÁPIDO

### Endpoints Funcionando (5)
✅ POST /auth/login  
✅ GET /cicatrizacao/usuario/{id}/ativa  
✅ GET /checklist/cicatrizacao/{id}/dia/{dia}  
✅ PATCH /checklist/item/{id}/toggle  
✅ GET /checkpoint-dias/cicatrizacao/{id}  

### Endpoints Pendentes (12)

#### 🔴 Prioridade ALTA (3 endpoints)
- GET /badges/usuario/{id}
- GET /estatisticas/cicatrizacao/{id}
- GET /dicas/dia/{numero}

#### 🟡 Prioridade MÉDIA (6 endpoints)
- POST /fotos/cicatrizacao/{id}
- GET /fotos/cicatrizacao/{id}
- DELETE /fotos/{id}
- GET /quiz/dia/{id}
- POST /quiz/responder

#### 🟢 Prioridade BAIXA (4 endpoints)
- GET /notificacoes/usuario/{id}
- PUT /notificacoes/usuario/{id}
- GET /guia/categorias
- GET /guia/categoria/{id}

---

## ⏱️ TEMPO ESTIMADO

| Fase | Endpoints | Tempo | Prioridade |
|------|-----------|-------|-----------|
| Fase 1 - Essenciais | 3 | 6h | 🔴 ALTA |
| Fase 2 - Fotos | 3 | 5h | 🟡 MÉDIA |
| Fase 3 - Quiz | 2 | 3h | 🟡 MÉDIA |
| Fase 4 - Extras | 4 | 4h | 🟢 BAIXA |
| **TOTAL** | **12** | **18h** | **~3 dias** |

---

## 🧪 TESTE RÁPIDO

Após implementar um endpoint, teste assim:

```bash
# 1. Login
TOKEN=$(curl -s -X POST https://inkflowbackend-4w1g.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cat@gmail.com","senha":"cat"}' \
  | jq -r '.token')

# 2. Testar endpoint
curl -H "Authorization: Bearer $TOKEN" \
  https://inkflowbackend-4w1g.onrender.com/api/[ENDPOINT]
```

---

## 🔑 INFORMAÇÕES IMPORTANTES

- **Backend URL**: `https://inkflowbackend-4w1g.onrender.com/api`
- **Credenciais de teste**: `cat@gmail.com` / `cat`
- **JWT**: Válido por 24h
- **Todos os hooks mobile já estão prontos** - Apenas implemente os endpoints
- **Mock data funciona como fallback** - App não quebra se API falhar

---

## 📝 ESTRUTURA DE ARQUIVOS

```
docs/
├── README_APIS.md                    ← Você está aqui
├── RESUMO_EXECUTIVO.md               ← Comece por aqui
├── API_ENDPOINTS.md                  ← Referência de endpoints
├── SPRING_BOOT_IMPLEMENTATION.md     ← Código Java completo
├── CHECKLIST_IMPLEMENTACAO.md        ← Acompanhamento
└── SEED_DATA.sql                     ← Dados iniciais
```

---

## 🚀 COMEÇAR AGORA

1. Abra **[RESUMO_EXECUTIVO.md](RESUMO_EXECUTIVO.md)**
2. Leia a Fase 1 (Essenciais)
3. Implemente o primeiro endpoint (Dicas do Dia)
4. Teste com curl
5. Valide no app mobile
6. Continue para o próximo!

---

## 💡 DICAS

- **Implemente em ordem de prioridade** - Fase 1 primeiro
- **Teste cada endpoint antes de continuar** - Não acumule problemas
- **Use o seed data fornecido** - Economiza tempo
- **Consulte o código Java** - Está completo e pronto para usar
- **Marque o checklist** - Ajuda a acompanhar progresso

---

## 🆘 PRECISA DE AJUDA?

- Problemas com endpoints? Veja **Troubleshooting** em [CHECKLIST_IMPLEMENTACAO.md](CHECKLIST_IMPLEMENTACAO.md)
- Dúvidas sobre estrutura de dados? Veja [API_ENDPOINTS.md](API_ENDPOINTS.md)
- Precisa de código? Veja [SPRING_BOOT_IMPLEMENTATION.md](SPRING_BOOT_IMPLEMENTATION.md)

---

## ✅ SUCESSO!

Quando todos os 12 endpoints estiverem implementados:
- [ ] Todos os testes curl passando
- [ ] App mobile mostra dados reais (não mock)
- [ ] Zero erros no console
- [ ] Upload de fotos funcionando
- [ ] Badges desbloqueando automaticamente
- [ ] Quiz salvando respostas
- [ ] Gráficos renderizando

**Parabéns! 🎉 O backend está completo!**
