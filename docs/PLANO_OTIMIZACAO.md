# 🔍 ANÁLISE DE INTEGRAÇÃO BACKEND-MOBILE

## MAPEAMENTO DE DEPENDÊNCIAS CRÍTICAS

### Contratos de API Ativos

#### 1. Dashboard Mobile → Backend
**Endpoint**: `GET /api/cicatrizacao/ativa/{clienteId}`
- **Consumidor**: `hooks/useCicatrizacao.ts`
- **Frequência**: A cada abertura do app + pull-to-refresh
- **Impacto**: CRÍTICO - Tela principal do app
- **Estrutura esperada**:
  ```json
  {
    "id": Long,
    "agendamento": { "id", "regiao", "artista": { "nome" } },
    "dataInicio": String,
    "dataFim": String,
    "periodoTotalDias": Integer,
    "status": String,
    "xpTotal": Integer,
    "diaAtual": Integer,
    "faseAtual": String
  }
  ```

#### 2. Caminho Duolingo → Backend
**Endpoint**: `GET /api/cicatrizacao/{id}/caminho`
- **Consumidor**: `hooks/useCaminho.ts`
- **Frequência**: A cada navegação para tela caminho
- **Impacto**: ALTO - Navegação principal
- **Estrutura esperada**: Array de CheckpointDia

#### 3. Checklist do Dia → Backend
**Endpoint**: `GET /api/cicatrizacao/{id}/checklist/dia/{numeroDia}`
- **Consumidor**: `hooks/useChecklist.ts`
- **Frequência**: A cada abertura de dia específico
- **Impacto**: ALTO - Interação principal do usuário

#### 4. Toggle Checklist → Backend
**Endpoint**: `PATCH /api/cicatrizacao/{id}/checklist/{itemId}/toggle`
- **Consumidor**: `hooks/useChecklist.ts`
- **Frequência**: Múltiplas vezes por dia (cada item marcado)
- **Impacto**: CRÍTICO - Ação mais frequente do app

#### 5. Badges → Backend
**Endpoint**: `GET /api/badges/usuario/{usuarioId}`
- **Consumidor**: `hooks/useBadges.ts`
- **Frequência**: Abertura do perfil
- **Impacto**: MÉDIO - Gamificação

#### 6. Estatísticas → Backend
**Endpoint**: `GET /api/estatisticas/cicatrizacao/{cicatrizacaoId}`
- **Consumidor**: `hooks/useEstatisticas.ts`
- **Frequência**: Abertura do perfil
- **Impacto**: MÉDIO - Visualização de progresso

#### 7. Fotos → Backend
**Endpoints**: 
- `GET /api/fotos/cicatrizacao/{id}`
- `POST /api/fotos/cicatrizacao/{id}`
- `DELETE /api/fotos/{id}`
- **Consumidor**: `hooks/useFotos.ts`
- **Frequência**: Baixa (upload ocasional)
- **Impacto**: MÉDIO - Upload de imagens

#### 8. Quiz → Backend
**Endpoints**:
- `GET /api/quiz/dia/{diaNumero}`
- `POST /api/quiz/responder`
- **Consumidor**: `hooks/useQuiz.ts`
- **Frequência**: Baixa (dias específicos)
- **Impacto**: BAIXO - Feature opcional

---

## PONTOS DE FRAGILIDADE IDENTIFICADOS

### 🔴 Crítico - Risco de Quebra do App

#### 1. N+1 Query Problem em Toggle Checklist
**Localização**: `CicatrizacaoService.toggleItem()` → `recalcularCheckpoint()`

**Problema**:
```java
// Linha ~110: Busca todos os itens do checkpoint
List<ChecklistItem> itens = checklistItemRepository
    .findByCheckpointDiaIdOrderByPeriodoAscOrdemAsc(checkpoint.getId());

// Linha ~130: Busca TODOS os checkpoints da cicatrização
List<CheckpointDia> todos = checkpointDiaRepository
    .findByCicatrizacaoIdOrderByNumeroDiaAsc(cic.getId());
```

**Impacto**:
- Cada toggle executa 3 queries
- Com 30 dias e 7 itens/dia = 210 itens carregados por toggle
- Mobile faz toggle múltiplas vezes por sessão
- Latência aumenta proporcionalmente ao período de cicatrização

**Risco para Mobile**:
- Timeout em conexões lentas
- UI travada aguardando resposta
- Usuário pode marcar item múltiplas vezes (double-tap)

---

#### 2. Atualização de Status em Tempo Real
**Localização**: `CicatrizacaoService.atualizarStatusDias()`

**Problema**:
```java
// Chamado em TODA requisição de buscarCaminho()
private void atualizarStatusDias(Long cicatrizacaoId) {
    LocalDate hoje = LocalDate.now();
    List<CheckpointDia> checkpoints = checkpointDiaRepository
        .findByCicatrizacaoIdOrderByNumeroDiaAsc(cicatrizacaoId);
    
    for (CheckpointDia cp : checkpoints) {
        // Itera TODOS os 30 dias
        // Faz save() individual para cada dia alterado
    }
}
```

**Impacto**:
- Busca todos os 30 dias
- Itera todos mesmo que apenas 1 precise atualização
- Save individual (não batch)
- Executado a cada abertura da tela caminho

**Risco para Mobile**:
- Latência desnecessária
- Tela caminho demora para carregar
- Usuário percebe lentidão

---

#### 3. Falta de Índices em Queries Frequentes
**Localização**: Repositories

**Problema**:
```java
// CicatrizacaoRepository
@Query("SELECT c FROM Cicatrizacao c WHERE c.agendamento.cliente.id = :clienteId 
       AND c.status = 'ATIVA' ORDER BY c.dataInicio DESC LIMIT 1")
Optional<Cicatrizacao> findAtivaByClienteId(@Param("clienteId") Long clienteId);
```

**Impacto**:
- Join com tabela agendamento
- Join com tabela cliente
- Sem índice composto em (cliente_id, status)
- Full table scan em produção com muitos registros

**Risco para Mobile**:
- Dashboard lento para carregar
- Primeira tela que usuário vê
- Má impressão inicial

---

### 🟡 Alto - Degradação de Performance

#### 4. Geração de Checklist em Memória
**Localização**: `CicatrizacaoService.gerarChecklistItens()`

**Problema**:
```java
private void gerarChecklistItens(CheckpointDia cp, int dia) {
    String fase = cp.getFase();
    List<String[]> itensManha = getItensManha(fase);
    List<String[]> itensTarde = getItensTarde(fase);
    List<String[]> itensNoite = getItensNoite(fase);
    
    // Cria objetos em memória
    // Save individual para cada item (7-9 saves por dia)
    for (String[] item : itensManha) {
        salvarItem(cp, "MANHA", ordem++, item[0]);
    }
    // ... repete para tarde e noite
}
```

**Impacto**:
- 30 dias × 7 itens = 210 inserts individuais
- Sem batch insert
- Transação longa durante inicialização

**Risco para Mobile**:
- Timeout ao criar nova tatuagem
- Usuário aguarda muito tempo
- Pode desistir da ação

---

#### 5. Cálculo de Progresso de Badges em Tempo Real
**Localização**: `BadgeController.calcularProgresso()`

**Problema**:
```java
private int calcularProgresso(Badge badge, Long clienteId) {
    // Busca cicatrização ativa
    var cicOpt = cicatrizacaoRepository.findFirstByAgendamentoClienteIdAndStatus(clienteId, "ATIVA");
    
    // Busca TODOS os checkpoints
    List<CheckpointDia> dias = checkpointDiaRepository
        .findByCicatrizacaoIdOrderByNumeroDiaAsc(cic.getId());
    
    // Calcula streak percorrendo array
    // Executado para CADA badge (9 badges)
}
```

**Impacto**:
- 9 badges × (1 query cicatrização + 1 query checkpoints) = 18 queries
- Cálculo de streak em memória para cada badge
- Sem cache

**Risco para Mobile**:
- Perfil lento para carregar
- Usuário vê loading prolongado

---

#### 6. Falta de Paginação em Listas
**Localização**: Múltiplos endpoints

**Problema**:
```java
// FotoEvolucaoController
@GetMapping("/cicatrizacao/{cicatrizacaoId}")
public ResponseEntity<List<FotoEvolucao>> listar(@PathVariable Long cicatrizacaoId) {
    return ResponseEntity.ok(fotoRepository.findByCicatrizacaoIdOrderByNumeroDiaAsc(cicatrizacaoId));
}
```

**Impacto**:
- Retorna TODAS as fotos de uma vez
- Sem limit
- Payload grande em JSON

**Risco para Mobile**:
- Consumo excessivo de dados móveis
- Parsing lento de JSON grande
- Scroll lag na galeria

---

### 🟢 Médio - Otimizações Recomendadas

#### 7. Connection Pool Pequeno
**Localização**: `application.properties`

**Problema**:
```properties
spring.datasource.hikari.maximum-pool-size=5
spring.datasource.hikari.minimum-idle=2
```

**Impacto**:
- Apenas 5 conexões simultâneas
- Mobile faz múltiplas requests paralelas (badges + stats + fotos)
- Requests ficam em fila

---

#### 8. Falta de Cache
**Localização**: Todos os controllers

**Problema**:
- Nenhum endpoint usa cache
- Badges sempre recalculadas
- Dicas sempre buscadas do DB
- Quiz sempre buscado do DB

**Impacto**:
- Queries repetidas desnecessariamente
- Dados raramente mudam (badges, dicas, quiz)

---

#### 9. Logs Excessivos em Produção
**Localização**: `application.properties`

**Problema**:
```properties
logging.level.org.hibernate.SQL=INFO
spring.jpa.show-sql=false
```

**Impacto**:
- Logs de SQL em produção
- I/O desnecessário
- Dificulta debug de problemas reais

---

## MATRIZ DE IMPACTO

| Problema | Severidade | Frequência | Impacto Mobile | Prioridade |
|----------|-----------|------------|----------------|------------|
| N+1 em Toggle | 🔴 Crítico | Muito Alta | UI travada | P0 |
| Status em Tempo Real | 🔴 Crítico | Alta | Tela lenta | P0 |
| Falta de Índices | 🔴 Crítico | Muito Alta | Dashboard lento | P0 |
| Geração Checklist | 🟡 Alto | Baixa | Timeout criação | P1 |
| Cálculo Badges | 🟡 Alto | Média | Perfil lento | P1 |
| Sem Paginação | 🟡 Alto | Baixa | Consumo dados | P1 |
| Connection Pool | 🟢 Médio | Alta | Fila requests | P2 |
| Sem Cache | 🟢 Médio | Alta | Queries repetidas | P2 |
| Logs Excessivos | 🟢 Médio | Constante | Performance geral | P2 |

---

## GARANTIAS DE COMPATIBILIDADE

### Contratos que NÃO PODEM MUDAR

#### 1. Estrutura de Response
- Todos os campos atuais devem ser mantidos
- Novos campos podem ser adicionados (mobile ignora)
- Tipos de dados não podem mudar (String → Integer quebra)

#### 2. Endpoints Existentes
- URLs não podem mudar
- Métodos HTTP não podem mudar (GET → POST quebra)
- Parâmetros obrigatórios não podem ser adicionados

#### 3. Códigos de Status HTTP
- 200 OK para sucesso
- 204 No Content para cicatrização não encontrada
- 401 Unauthorized para token inválido
- 404 Not Found para recursos não encontrados

### Mudanças Seguras

#### ✅ Permitido
- Adicionar novos campos no response
- Adicionar novos endpoints
- Otimizar queries internas
- Adicionar índices no banco
- Adicionar cache
- Melhorar performance

#### ❌ Proibido
- Remover campos do response
- Renomear campos
- Mudar tipos de dados
- Mudar URLs de endpoints
- Mudar códigos de status HTTP
- Adicionar validações que rejeitem requests válidos

---

## ESTRATÉGIA DE ROLLBACK

### Pontos de Reversão

#### 1. Índices de Banco
- Podem ser criados/removidos sem downtime
- Não afetam código
- Reversão: DROP INDEX

#### 2. Queries Otimizadas
- Mantêm mesma interface
- Apenas mudam implementação interna
- Reversão: Git revert

#### 3. Cache
- Adiciona camada transparente
- Não muda contratos
- Reversão: Desabilitar cache

#### 4. Connection Pool
- Configuração externa
- Não afeta código
- Reversão: Alterar properties

### Testes de Regressão Obrigatórios

Antes de cada deploy:
1. ✅ Dashboard carrega cicatrização ativa
2. ✅ Caminho mostra 30 dias
3. ✅ Checklist marca/desmarca itens
4. ✅ Badges calculam progresso
5. ✅ Estatísticas retornam dados
6. ✅ Fotos fazem upload
7. ✅ Quiz carrega perguntas

---

# 🎯 PLANO DE OTIMIZAÇÃO SEQUENCIAL

## FASE 1: OTIMIZAÇÕES DE BANCO DE DADOS

### Etapa 1.1: Criação de Índices Críticos
**Objetivo**: Reduzir latência de queries mais frequentes

**Ações**:
1. Criar índice composto em `cicatrizacao(agendamento_id, status)`
2. Criar índice em `checkpoint_dia(cicatrizacao_id, numero_dia)`
3. Criar índice em `checklist_item(checkpoint_dia_id, periodo, ordem)`
4. Criar índice em `badge_usuario(cliente_id, badge_id)`
5. Criar índice em `foto_evolucao(cicatrizacao_id, numero_dia)`

**Impacto Esperado**:
- Dashboard: Redução de 80% no tempo de query
- Caminho: Redução de 70% no tempo de busca
- Checklist: Redução de 60% no tempo de busca

**Validação**:
- Executar EXPLAIN ANALYZE antes/depois
- Medir tempo de resposta dos endpoints
- Verificar que mobile continua funcionando

**Rollback**: DROP INDEX se houver problema

---

### Etapa 1.2: Otimização de Queries com Fetch Join
**Objetivo**: Eliminar N+1 queries

**Ações**:
1. Adicionar `@EntityGraph` em `findAtivaByClienteId`
2. Usar JOIN FETCH em query de cicatrização ativa
3. Carregar agendamento e artista em uma única query

**Impacto Esperado**:
- Dashboard: 3 queries → 1 query
- Redução de 66% nas queries de banco

**Validação**:
- Verificar logs SQL (deve mostrar JOIN)
- Testar no mobile que dados aparecem corretamente
- Confirmar que estrutura JSON não mudou

**Rollback**: Remover @EntityGraph

---

### Etapa 1.3: Batch Operations em Geração de Checklist
**Objetivo**: Reduzir tempo de criação de cicatrização

**Ações**:
1. Acumular todos os ChecklistItem em List
2. Usar `saveAll()` ao invés de `save()` individual
3. Configurar `spring.jpa.properties.hibernate.jdbc.batch_size=50`

**Impacto Esperado**:
- Criação de cicatrização: 210 inserts → 5 batches
- Redução de 95% no tempo de transação

**Validação**:
- Criar nova tatuagem no mobile
- Verificar que todos os 210 itens foram criados
- Confirmar que checklist aparece corretamente

**Rollback**: Voltar para save() individual

---

## FASE 2: OTIMIZAÇÕES DE LÓGICA DE NEGÓCIO

### Etapa 2.1: Lazy Update de Status de Dias
**Objetivo**: Evitar processamento desnecessário

**Ações**:
1. Remover `atualizarStatusDias()` de `buscarCaminho()`
2. Criar job agendado (1x por dia às 00:01) para atualizar status
3. Adicionar flag `ultima_atualizacao` em cicatrização
4. Atualizar apenas se data mudou

**Impacto Esperado**:
- Caminho: Elimina iteração de 30 dias por request
- Redução de 90% no processamento

**Validação**:
- Verificar que dias DISPONIVEL aparecem corretamente
- Testar mudança de dia (meia-noite)
- Confirmar que PERDIDO é marcado corretamente

**Rollback**: Reativar atualização em tempo real

---

### Etapa 2.2: Otimização de Recálculo de Checkpoint
**Objetivo**: Reduzir queries em toggle

**Ações**:
1. Passar lista de itens como parâmetro (já carregada)
2. Calcular XP total apenas se checkpoint mudou para COMPLETO
3. Usar query agregada para XP total ao invés de carregar todos os dias

**Impacto Esperado**:
- Toggle: 3 queries → 1 query
- Redução de 66% nas queries

**Validação**:
- Marcar/desmarcar itens no mobile
- Verificar que XP é calculado corretamente
- Confirmar que estrelas aparecem

**Rollback**: Voltar para lógica original

---

### Etapa 2.3: Cálculo Incremental de Badges
**Objetivo**: Evitar recálculo completo

**Ações**:
1. Criar tabela `badge_progresso_cache`
2. Atualizar cache quando checkpoint muda
3. Ler de cache ao invés de calcular em tempo real
4. Invalidar cache apenas quando necessário

**Impacto Esperado**:
- Badges: 18 queries → 1 query
- Redução de 94% nas queries

**Validação**:
- Abrir perfil no mobile
- Verificar que progresso está correto
- Marcar checklist e ver progresso atualizar

**Rollback**: Voltar para cálculo em tempo real

---

## FASE 3: OTIMIZAÇÕES DE INFRAESTRUTURA

### Etapa 3.1: Implementação de Cache L1
**Objetivo**: Reduzir queries para dados estáticos

**Ações**:
1. Adicionar `spring-boot-starter-cache`
2. Configurar Caffeine cache
3. Cachear badges (TTL: 1 hora)
4. Cachear dicas (TTL: 1 hora)
5. Cachear quiz (TTL: 1 hora)

**Impacto Esperado**:
- Badges: 100% cache hit após primeira request
- Dicas: 100% cache hit após primeira request
- Quiz: 100% cache hit após primeira request

**Validação**:
- Verificar logs de cache hit/miss
- Testar que dados aparecem no mobile
- Confirmar que cache expira corretamente

**Rollback**: Desabilitar cache

---

### Etapa 3.2: Aumento de Connection Pool
**Objetivo**: Suportar mais requests simultâneas

**Ações**:
1. Aumentar `maximum-pool-size` de 5 para 15
2. Aumentar `minimum-idle` de 2 para 5
3. Ajustar `connection-timeout` para 20000ms

**Impacto Esperado**:
- Redução de 80% em requests em fila
- Melhor throughput em horários de pico

**Validação**:
- Monitorar métricas de pool
- Verificar que não há connection timeout
- Testar múltiplos usuários simultâneos

**Rollback**: Voltar para valores anteriores

---

### Etapa 3.3: Paginação de Listas Grandes
**Objetivo**: Reduzir payload e consumo de dados

**Ações**:
1. Adicionar parâmetros `page` e `size` em GET /fotos
2. Retornar apenas 10 fotos por página
3. Adicionar header `X-Total-Count`
4. Mobile carrega mais ao fazer scroll (infinite scroll)

**Impacto Esperado**:
- Payload: Redução de 90% (30 fotos → 3 fotos)
- Consumo de dados: Redução de 90%
- Tempo de parsing JSON: Redução de 90%

**Validação**:
- Verificar que mobile carrega primeira página
- Testar scroll infinito
- Confirmar que todas as fotos são acessíveis

**Rollback**: Remover paginação (backward compatible)

---

## FASE 4: MONITORAMENTO E OBSERVABILIDADE

### Etapa 4.1: Métricas de Performance
**Objetivo**: Medir impacto das otimizações

**Ações**:
1. Adicionar `spring-boot-starter-actuator`
2. Expor métricas em `/actuator/metrics`
3. Adicionar custom metrics para endpoints críticos
4. Configurar alertas para latência > 500ms

**Impacto Esperado**:
- Visibilidade de performance em tempo real
- Detecção proativa de degradação

**Validação**:
- Acessar /actuator/metrics
- Verificar que métricas são coletadas
- Testar alertas

**Rollback**: Desabilitar actuator

---

### Etapa 4.2: Logging Estruturado
**Objetivo**: Facilitar debug de problemas

**Ações**:
1. Reduzir log level de SQL para WARN
2. Adicionar MDC com requestId
3. Logar apenas erros e warnings
4. Adicionar log de tempo de execução em endpoints críticos

**Impacto Esperado**:
- Redução de 80% no volume de logs
- Melhor performance de I/O
- Facilita troubleshooting

**Validação**:
- Verificar que logs são legíveis
- Confirmar que erros são logados
- Testar rastreamento de requests

**Rollback**: Voltar para log level anterior

---

## ORDEM DE EXECUÇÃO RECOMENDADA

### Sprint 1: Quick Wins (Maior Impacto, Menor Risco)
1. ✅ Etapa 1.1: Índices (sem mudança de código)
2. ✅ Etapa 3.2: Connection Pool (apenas config)
3. ✅ Etapa 4.2: Logging (apenas config)

### Sprint 2: Otimizações de Query
1. ✅ Etapa 1.2: Fetch Join
2. ✅ Etapa 2.2: Otimização Toggle
3. ✅ Etapa 1.3: Batch Operations

### Sprint 3: Cache e Lazy Loading
1. ✅ Etapa 3.1: Cache L1
2. ✅ Etapa 2.1: Lazy Update Status
3. ✅ Etapa 2.3: Cache Badges

### Sprint 4: Paginação e Monitoramento
1. ✅ Etapa 3.3: Paginação
2. ✅ Etapa 4.1: Métricas

---

## CRITÉRIOS DE SUCESSO

### Métricas de Performance

**Antes das Otimizações**:
- Dashboard: ~800ms
- Caminho: ~600ms
- Toggle: ~400ms
- Badges: ~1200ms

**Meta Após Otimizações**:
- Dashboard: <200ms (75% redução)
- Caminho: <150ms (75% redução)
- Toggle: <100ms (75% redução)
- Badges: <300ms (75% redução)

### Métricas de Banco

**Antes**:
- Queries por request: 5-10
- Connection pool usage: 80%
- Cache hit rate: 0%

**Meta**:
- Queries por request: 1-3 (70% redução)
- Connection pool usage: <50%
- Cache hit rate: >80%

### Experiência Mobile

**Antes**:
- Loading visível em todas as telas
- Lag ao marcar checklist
- Timeout ocasional

**Meta**:
- Loading imperceptível (<200ms)
- Resposta instantânea ao marcar
- Zero timeouts

---

## PRÓXIMOS PASSOS

1. Revisar e aprovar plano
2. Configurar ambiente de staging
3. Executar Sprint 1 (Quick Wins)
4. Medir baseline de performance
5. Executar otimizações sequencialmente
6. Validar cada etapa antes de próxima
7. Documentar resultados
