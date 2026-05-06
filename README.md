# 📚 InkFlowCare - Documentação Consolidada

Bem-vindo à documentação do projeto InkFlowCare Mobile & Backend!
Este documento serve como o único ponto de entrada para todas as informações técnicas e de arquitetura do projeto.

---

## 🧭 NAVEGAÇÃO RÁPIDA

Aqui estão os 6 arquivos principais que você precisa conhecer:

1. **[STATUS_CONSOLIDADO.md](docs/STATUS_CONSOLIDADO.md)**
   Status real atualizado do que está funcionando e o que falta no backend e mobile.
   *Sempre consulte este arquivo antes de iniciar qualquer desenvolvimento.*

2. **[PLANO_OTIMIZACAO.md](docs/PLANO_OTIMIZACAO.md)**
   Plano de execução passo a passo focado em melhorar o desempenho do sistema, sem estimativas de tempo, com foco nas integrações críticas.

3. **[API_ENDPOINTS.md](docs/API_ENDPOINTS.md)**
   Documentação técnica completa de todos os endpoints REST (Request/Response, estruturas DTO, métodos).

4. **[SPRING_BOOT_IMPLEMENTATION.md](docs/SPRING_BOOT_IMPLEMENTATION.md)**
   Código Java de referência para implementação no backend (Entities, Repositories, Services, Controllers).

5. **[FLUXO_DE_DADOS.md](docs/FLUXO_DE_DADOS.md)**
   Diagramas visuais de como os dados fluem entre o App Mobile e o Backend.

6. **[DOCS.md](docs/DOCS.md)**
   Documentação técnica completa do projeto mobile (arquitetura, pastas, hooks, navegação).

---

## 🎯 RESUMO DO PROJETO

- **Backend URL**: `https://inkflowbackend-4w1g.onrender.com/api`
- **Autenticação**: JWT (Válido por 24h)
- **Credenciais de Teste**: `cat@gmail.com` / `cat`

### O que já está pronto?
O frontend mobile já possui 95% das funcionalidades implementadas, e o backend já possui a estrutura base de autenticação, perfil e checklist funcionando perfeitamente.

### Próximos Passos
Siga o **[PLANO_OTIMIZACAO.md](docs/PLANO_OTIMIZACAO.md)** para otimizar os 8 contratos críticos de integração entre o App e a API, garantindo estabilidade e performance sem quebrar os fluxos existentes.

---

## 📊 ESTRUTURA DA DOCUMENTAÇÃO

```
docs/
├── STATUS_CONSOLIDADO.md ............... Status atual real
├── PLANO_OTIMIZACAO.md ................. Análise de performance e plano de ação
├── API_ENDPOINTS.md .................... Documentação de endpoints
├── SPRING_BOOT_IMPLEMENTATION.md ....... Código Java de referência
├── FLUXO_DE_DADOS.md ................... Diagramas visuais de fluxo
├── DOCS.md ............................. Documentação técnica mobile
├── GUIA_RAPIDO.md ...................... Referência rápida e checklist unificado
└── SEED_DATA_POSTGRESQL.sql ............ Dados iniciais para popular o banco
```

> **Nota:** Arquivos antigos ou redundantes foram movidos para a pasta `archive/` para manter a documentação limpa.
