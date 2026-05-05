# InkFlowCare Mobile 🎨

Guia gamificado de cuidados pós-tatuagem, inspirado na mecânica do Duolingo. Extensão mobile de um projeto web de estúdio de tatuagem já existente.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | React Native + Expo 54 |
| Linguagem | TypeScript |
| Navegação | Expo Router (file-based) |
| Estado | Context API |
| HTTP | Axios |
| Persistência | AsyncStorage |
| Backend | Spring Boot 3.x + Java 17 (deploy no Render) |
| Auth | JWT (HS256, 24h) |

## Como rodar

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar dev server
npx expo start

# 3. Limpar cache (se necessário)
npx expo start -c
```

Opções de execução:
- **Web:** pressione `w` no terminal
- **Android:** pressione `a` (requer emulador ou Expo Go)
- **iOS:** pressione `i` (requer simulador macOS)

## Estrutura

```
app/          → Telas e navegação (Expo Router)
components/   → Componentes reutilizáveis
context/      → AuthContext (JWT + AsyncStorage)
hooks/        → useCicatrizacao, useCaminho, useChecklist
services/     → Axios com interceptor JWT
scripts/      → Scripts de diagnóstico e teste
docs/         → Documentação técnica, referências visuais e plano
```

## Telas

| Tab | Tela | Descrição |
|-----|------|-----------|
| 1 | Dashboard | Progresso da tatuagem ativa + lembretes do dia |
| 2 | Recovery Progress | Caminho estilo Duolingo com nós de progresso |
| 3 | Explore | Guia de cuidados |
| 4 | Perfil | Dados do usuário + configurações + histórico |

## Backend

API em: `https://inkflowbackend-4w1g.onrender.com/api`

Login: `POST /api/auth/login` → retorna JWT + dados do usuário.

## Documentação

### Geral
- Documentação técnica completa: [`docs/DOCS.md`](docs/DOCS.md)
- Plano de implementação: [`docs/Plano_Implementação/PLANO.MD`](docs/Plano_Implementação/PLANO.MD)
- Referências visuais (HTML): [`docs/REFERENCIAS_TELAS/`](docs/REFERENCIAS_TELAS/)

### APIs Backend
- **[Resumo Executivo](docs/RESUMO_EXECUTIVO.md)** - Ordem de implementação e prioridades
- **[Lista de Endpoints](docs/API_ENDPOINTS.md)** - Documentação completa de todos os endpoints
- **[Implementação Spring Boot](docs/SPRING_BOOT_IMPLEMENTATION.md)** - Código Java completo
