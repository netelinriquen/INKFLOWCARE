# 🚀 GUIA DE IMPLEMENTAÇÃO - Spring Boot

Exemplos de código para implementar cada endpoint no backend.

---

## 1️⃣ BADGES

### Entity
```java
@Entity
@Table(name = "badges")
public class Badge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String nome;
    private String descricao;
    private String icone;
    
    @Enumerated(EnumType.STRING)
    private CategoriaBadge categoria; // STREAK, XP, CONCLUSAO, ESPECIAL
    
    // Campos calculados por usuário (não persistidos aqui)
    @Transient
    private Boolean desbloqueado;
    
    @Transient
    private LocalDateTime dataDesbloqueio;
    
    @Transient
    private Integer progresso;
}

@Entity
@Table(name = "usuario_badges")
public class UsuarioBadge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    private Usuario usuario;
    
    @ManyToOne
    private Badge badge;
    
    private LocalDateTime dataDesbloqueio;
}
```

### Controller
```java
@RestController
@RequestMapping("/api/badges")
public class BadgeController {
    
    @Autowired
    private BadgeService badgeService;
    
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<BadgeDTO>> getBadgesUsuario(@PathVariable Long usuarioId) {
        List<BadgeDTO> badges = badgeService.getBadgesComProgresso(usuarioId);
        return ResponseEntity.ok(badges);
    }
    
    @GetMapping("/disponiveis")
    public ResponseEntity<List<Badge>> getBadgesDisponiveis() {
        return ResponseEntity.ok(badgeService.findAll());
    }
}
```

### Service (Lógica de Progresso)
```java
@Service
public class BadgeService {
    
    public List<BadgeDTO> getBadgesComProgresso(Long usuarioId) {
        List<Badge> todasBadges = badgeRepository.findAll();
        List<UsuarioBadge> desbloqueadas = usuarioBadgeRepository.findByUsuarioId(usuarioId);
        
        return todasBadges.stream().map(badge -> {
            BadgeDTO dto = new BadgeDTO(badge);
            
            // Verificar se está desbloqueada
            Optional<UsuarioBadge> ub = desbloqueadas.stream()
                .filter(u -> u.getBadge().getId().equals(badge.getId()))
                .findFirst();
            
            if (ub.isPresent()) {
                dto.setDesbloqueado(true);
                dto.setDataDesbloqueio(ub.get().getDataDesbloqueio());
                dto.setProgresso(100);
            } else {
                dto.setDesbloqueado(false);
                dto.setProgresso(calcularProgresso(badge, usuarioId));
            }
            
            return dto;
        }).collect(Collectors.toList());
    }
    
    private Integer calcularProgresso(Badge badge, Long usuarioId) {
        switch (badge.getCategoria()) {
            case STREAK:
                // Calcular streak atual vs meta da badge
                int streakAtual = cicatrizacaoService.getStreakAtual(usuarioId);
                int metaStreak = extrairMetaDaBadge(badge.getNome()); // ex: "7 dias" -> 7
                return Math.min(100, (streakAtual * 100) / metaStreak);
                
            case CONCLUSAO:
                // Calcular dias completos vs meta
                int diasCompletos = cicatrizacaoService.getDiasCompletos(usuarioId);
                int metaDias = extrairMetaDaBadge(badge.getNome());
                return Math.min(100, (diasCompletos * 100) / metaDias);
                
            case XP:
                // Calcular XP total vs meta
                int xpTotal = cicatrizacaoService.getXpTotal(usuarioId);
                int metaXp = extrairMetaDaBadge(badge.getNome());
                return Math.min(100, (xpTotal * 100) / metaXp);
                
            default:
                return 0;
        }
    }
}
```

---

## 2️⃣ ESTATÍSTICAS

### DTO
```java
public class EstatisticasDTO {
    private List<XpPorDia> xpPorDia;
    private Integer streakAtual;
    private Integer melhorStreak;
    private Integer diasCompletos;
    private Integer totalDias;
    private Integer taxaConclusao;
    
    public static class XpPorDia {
        private Integer dia;
        private Integer xp;
    }
}
```

### Controller
```java
@RestController
@RequestMapping("/api/estatisticas")
public class EstatisticasController {
    
    @Autowired
    private EstatisticasService estatisticasService;
    
    @GetMapping("/cicatrizacao/{cicatrizacaoId}")
    public ResponseEntity<EstatisticasDTO> getEstatisticas(@PathVariable Long cicatrizacaoId) {
        EstatisticasDTO stats = estatisticasService.calcularEstatisticas(cicatrizacaoId);
        return ResponseEntity.ok(stats);
    }
}
```

### Service
```java
@Service
public class EstatisticasService {
    
    public EstatisticasDTO calcularEstatisticas(Long cicatrizacaoId) {
        Cicatrizacao cic = cicatrizacaoRepository.findById(cicatrizacaoId)
            .orElseThrow(() -> new NotFoundException("Cicatrização não encontrada"));
        
        EstatisticasDTO stats = new EstatisticasDTO();
        
        // XP por dia
        List<CheckpointDia> dias = checkpointDiaRepository.findByCicatrizacaoIdOrderByNumeroDia(cicatrizacaoId);
        stats.setXpPorDia(dias.stream()
            .map(d -> new XpPorDia(d.getNumeroDia(), d.getXpGanho()))
            .collect(Collectors.toList()));
        
        // Streak atual
        stats.setStreakAtual(calcularStreakAtual(dias));
        
        // Melhor streak
        stats.setMelhorStreak(calcularMelhorStreak(dias));
        
        // Dias completos
        long completos = dias.stream()
            .filter(d -> d.getStatusDia() == StatusDia.COMPLETO)
            .count();
        stats.setDiasCompletos((int) completos);
        
        // Total de dias
        stats.setTotalDias(cic.getPeriodoTotalDias());
        
        // Taxa de conclusão
        stats.setTaxaConclusao((int) ((completos * 100) / cic.getPeriodoTotalDias()));
        
        return stats;
    }
    
    private Integer calcularStreakAtual(List<CheckpointDia> dias) {
        int streak = 0;
        for (int i = dias.size() - 1; i >= 0; i--) {
            if (dias.get(i).getStatusDia() == StatusDia.COMPLETO) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    }
    
    private Integer calcularMelhorStreak(List<CheckpointDia> dias) {
        int melhor = 0;
        int atual = 0;
        
        for (CheckpointDia dia : dias) {
            if (dia.getStatusDia() == StatusDia.COMPLETO) {
                atual++;
                melhor = Math.max(melhor, atual);
            } else {
                atual = 0;
            }
        }
        
        return melhor;
    }
}
```

---

## 3️⃣ FOTOS (com Cloudinary)

### Entity
```java
@Entity
@Table(name = "fotos_cicatrizacao")
public class FotoCicatrizacao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "cicatrizacao_id")
    private Cicatrizacao cicatrizacao;
    
    private String urlImagem;
    private Integer numeroDia;
    private LocalDateTime dataUpload;
    private String legenda;
    
    // Cloudinary public_id para deletar depois
    private String cloudinaryId;
}
```

### Controller
```java
@RestController
@RequestMapping("/api/fotos")
public class FotoController {
    
    @Autowired
    private FotoService fotoService;
    
    @PostMapping("/cicatrizacao/{cicatrizacaoId}")
    public ResponseEntity<FotoCicatrizacao> uploadFoto(
        @PathVariable Long cicatrizacaoId,
        @RequestParam("file") MultipartFile file,
        @RequestParam("numeroDia") Integer numeroDia,
        @RequestParam(value = "legenda", required = false) String legenda
    ) {
        FotoCicatrizacao foto = fotoService.uploadFoto(cicatrizacaoId, file, numeroDia, legenda);
        return ResponseEntity.ok(foto);
    }
    
    @GetMapping("/cicatrizacao/{cicatrizacaoId}")
    public ResponseEntity<List<FotoCicatrizacao>> getFotos(@PathVariable Long cicatrizacaoId) {
        List<FotoCicatrizacao> fotos = fotoService.getFotosByCicatrizacao(cicatrizacaoId);
        return ResponseEntity.ok(fotos);
    }
    
    @DeleteMapping("/{fotoId}")
    public ResponseEntity<Void> deletarFoto(@PathVariable Long fotoId) {
        fotoService.deletarFoto(fotoId);
        return ResponseEntity.noContent().build();
    }
}
```

### Service (com Cloudinary)
```java
@Service
public class FotoService {
    
    @Autowired
    private Cloudinary cloudinary;
    
    @Autowired
    private FotoCicatrizacaoRepository fotoRepository;
    
    public FotoCicatrizacao uploadFoto(Long cicatrizacaoId, MultipartFile file, Integer numeroDia, String legenda) {
        try {
            // Upload para Cloudinary
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), 
                ObjectUtils.asMap(
                    "folder", "inkflow/cicatrizacao",
                    "resource_type", "image"
                ));
            
            String url = (String) uploadResult.get("secure_url");
            String publicId = (String) uploadResult.get("public_id");
            
            // Salvar no banco
            FotoCicatrizacao foto = new FotoCicatrizacao();
            foto.setCicatrizacao(cicatrizacaoRepository.findById(cicatrizacaoId).orElseThrow());
            foto.setUrlImagem(url);
            foto.setCloudinaryId(publicId);
            foto.setNumeroDia(numeroDia);
            foto.setLegenda(legenda);
            foto.setDataUpload(LocalDateTime.now());
            
            return fotoRepository.save(foto);
            
        } catch (IOException e) {
            throw new RuntimeException("Erro ao fazer upload da foto", e);
        }
    }
    
    public void deletarFoto(Long fotoId) {
        FotoCicatrizacao foto = fotoRepository.findById(fotoId)
            .orElseThrow(() -> new NotFoundException("Foto não encontrada"));
        
        try {
            // Deletar do Cloudinary
            cloudinary.uploader().destroy(foto.getCloudinaryId(), ObjectUtils.emptyMap());
        } catch (IOException e) {
            // Log mas não falha
            System.err.println("Erro ao deletar do Cloudinary: " + e.getMessage());
        }
        
        // Deletar do banco
        fotoRepository.delete(foto);
    }
}
```

### Configuração Cloudinary
```java
@Configuration
public class CloudinaryConfig {
    
    @Value("${cloudinary.cloud-name}")
    private String cloudName;
    
    @Value("${cloudinary.api-key}")
    private String apiKey;
    
    @Value("${cloudinary.api-secret}")
    private String apiSecret;
    
    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
            "cloud_name", cloudName,
            "api_key", apiKey,
            "api_secret", apiSecret
        ));
    }
}
```

**application.properties**:
```properties
cloudinary.cloud-name=${CLOUDINARY_CLOUD_NAME}
cloudinary.api-key=${CLOUDINARY_API_KEY}
cloudinary.api-secret=${CLOUDINARY_API_SECRET}
```

---

## 4️⃣ QUIZ

### Entity
```java
@Entity
@Table(name = "quiz_perguntas")
public class QuizPergunta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "checkpoint_dia_id")
    private CheckpointDia checkpointDia;
    
    private String pergunta;
    
    @ElementCollection
    @CollectionTable(name = "quiz_opcoes")
    private List<String> opcoes;
    
    private Integer respostaCorreta; // índice 0-3
    private String explicacao;
    private Integer xpBonus;
}

@Entity
@Table(name = "quiz_respostas")
public class QuizResposta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    private Usuario usuario;
    
    @ManyToOne
    private CheckpointDia checkpointDia;
    
    @ElementCollection
    @MapKeyColumn(name = "pergunta_id")
    @Column(name = "opcao_escolhida")
    private Map<Long, Integer> respostas;
    
    private Integer acertos;
    private Integer xpGanho;
    private LocalDateTime dataResposta;
}
```

### Controller
```java
@RestController
@RequestMapping("/api/quiz")
public class QuizController {
    
    @Autowired
    private QuizService quizService;
    
    @GetMapping("/dia/{checkpointDiaId}")
    public ResponseEntity<List<QuizPergunta>> getQuizDia(@PathVariable Long checkpointDiaId) {
        List<QuizPergunta> perguntas = quizService.getPerguntasByDia(checkpointDiaId);
        return ResponseEntity.ok(perguntas);
    }
    
    @PostMapping("/responder")
    public ResponseEntity<QuizResultadoDTO> responderQuiz(@RequestBody QuizRespostaRequest request) {
        QuizResultadoDTO resultado = quizService.processarRespostas(request);
        return ResponseEntity.ok(resultado);
    }
}
```

### Service
```java
@Service
public class QuizService {
    
    public List<QuizPergunta> getPerguntasByDia(Long checkpointDiaId) {
        return quizPerguntaRepository.findByCheckpointDiaId(checkpointDiaId);
    }
    
    public QuizResultadoDTO processarRespostas(QuizRespostaRequest request) {
        List<QuizPergunta> perguntas = getPerguntasByDia(request.getCheckpointDiaId());
        
        int acertos = 0;
        int xpGanho = 0;
        
        for (QuizPergunta pergunta : perguntas) {
            Integer respostaUsuario = request.getRespostas().get(pergunta.getId());
            
            if (respostaUsuario != null && respostaUsuario.equals(pergunta.getRespostaCorreta())) {
                acertos++;
                xpGanho += pergunta.getXpBonus();
            }
        }
        
        // Salvar resposta
        QuizResposta resposta = new QuizResposta();
        resposta.setUsuario(usuarioRepository.findById(request.getUsuarioId()).orElseThrow());
        resposta.setCheckpointDia(checkpointDiaRepository.findById(request.getCheckpointDiaId()).orElseThrow());
        resposta.setRespostas(request.getRespostas());
        resposta.setAcertos(acertos);
        resposta.setXpGanho(xpGanho);
        resposta.setDataResposta(LocalDateTime.now());
        quizRespostaRepository.save(resposta);
        
        // Adicionar XP ao checkpoint dia
        CheckpointDia dia = checkpointDiaRepository.findById(request.getCheckpointDiaId()).orElseThrow();
        dia.setXpGanho(dia.getXpGanho() + xpGanho);
        checkpointDiaRepository.save(dia);
        
        return new QuizResultadoDTO(acertos, perguntas.size(), xpGanho, (acertos * 100) / perguntas.size());
    }
}
```

---

## 5️⃣ DICAS DO DIA

### Entity
```java
@Entity
@Table(name = "dicas_dia")
public class DicaDia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Integer numeroDia;
    private String titulo;
    private String descricao;
    private String icone;
    
    @Enumerated(EnumType.STRING)
    private TipoDica tipo; // HIDRATACAO, HIGIENE, ALIMENTACAO, ATIVIDADE
}
```

### Controller
```java
@RestController
@RequestMapping("/api/dicas")
public class DicaController {
    
    @Autowired
    private DicaDiaRepository dicaDiaRepository;
    
    @GetMapping("/dia/{numeroDia}")
    public ResponseEntity<List<DicaDia>> getDicasDia(@PathVariable Integer numeroDia) {
        List<DicaDia> dicas = dicaDiaRepository.findByNumeroDia(numeroDia);
        return ResponseEntity.ok(dicas);
    }
}
```

### Seed Data (data.sql)
```sql
INSERT INTO dicas_dia (numero_dia, titulo, descricao, icone, tipo) VALUES
(1, 'Remova o curativo', 'Após 2-4 horas, remova o curativo com cuidado e lave com água morna', 'bandage', 'HIGIENE'),
(1, 'Primeira lavagem', 'Use sabão neutro sem perfume e seque com papel toalha limpo', 'water-drop', 'HIGIENE'),
(3, 'Hidratação constante', 'Aplique pomada 3-4x ao dia para evitar ressecamento', 'water-drop', 'HIDRATACAO'),
(7, 'Não arranque cascas', 'Deixe a pele descamar naturalmente para evitar manchas', 'hand-left', 'HIGIENE'),
(14, 'Protetor solar', 'Já pode usar FPS 50+ ao sair. O sol desbota a tatuagem!', 'sunny', 'HIDRATACAO');
```

---

## 6️⃣ NOTIFICAÇÕES (Preferências)

### Entity
```java
@Entity
@Table(name = "notificacao_preferencias")
public class NotificacaoPreferencia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;
    
    private String horarioManha;  // "08:00"
    private String horarioTarde;  // "14:00"
    private String horarioNoite;  // "21:00"
    private Boolean notificacoesAtivas;
}
```

### Controller
```java
@RestController
@RequestMapping("/api/notificacoes")
public class NotificacaoController {
    
    @Autowired
    private NotificacaoPreferenciaRepository notifRepository;
    
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<NotificacaoPreferencia> getPreferencias(@PathVariable Long usuarioId) {
        NotificacaoPreferencia prefs = notifRepository.findByUsuarioId(usuarioId)
            .orElseGet(() -> criarPreferenciaPadrao(usuarioId));
        return ResponseEntity.ok(prefs);
    }
    
    @PutMapping("/usuario/{usuarioId}")
    public ResponseEntity<NotificacaoPreferencia> atualizarPreferencias(
        @PathVariable Long usuarioId,
        @RequestBody NotificacaoPreferencia preferencias
    ) {
        NotificacaoPreferencia prefs = notifRepository.findByUsuarioId(usuarioId)
            .orElseGet(() -> criarPreferenciaPadrao(usuarioId));
        
        prefs.setHorarioManha(preferencias.getHorarioManha());
        prefs.setHorarioTarde(preferencias.getHorarioTarde());
        prefs.setHorarioNoite(preferencias.getHorarioNoite());
        prefs.setNotificacoesAtivas(preferencias.getNotificacoesAtivas());
        
        return ResponseEntity.ok(notifRepository.save(prefs));
    }
    
    private NotificacaoPreferencia criarPreferenciaPadrao(Long usuarioId) {
        NotificacaoPreferencia prefs = new NotificacaoPreferencia();
        prefs.setUsuario(usuarioRepository.findById(usuarioId).orElseThrow());
        prefs.setHorarioManha("08:00");
        prefs.setHorarioTarde("14:00");
        prefs.setHorarioNoite("21:00");
        prefs.setNotificacoesAtivas(true);
        return notifRepository.save(prefs);
    }
}
```

---

## 📦 DEPENDÊNCIAS NECESSÁRIAS (pom.xml)

```xml
<!-- Cloudinary para upload de fotos -->
<dependency>
    <groupId>com.cloudinary</groupId>
    <artifactId>cloudinary-http44</artifactId>
    <version>1.33.0</version>
</dependency>

<!-- Multipart file upload -->
<dependency>
    <groupId>commons-fileupload</groupId>
    <artifactId>commons-fileupload</artifactId>
    <version>1.5</version>
</dependency>
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Criar entities (Badge, FotoCicatrizacao, QuizPergunta, DicaDia, NotificacaoPreferencia)
- [ ] Criar repositories
- [ ] Criar services com lógica de negócio
- [ ] Criar controllers com endpoints
- [ ] Configurar Cloudinary (variáveis de ambiente)
- [ ] Adicionar seed data para badges, quiz e dicas
- [ ] Testar cada endpoint com Postman/curl
- [ ] Verificar integração com app mobile
