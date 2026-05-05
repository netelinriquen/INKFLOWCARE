import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useCicatrizacao } from '@/hooks/useCicatrizacao';
import { useCaminho } from '@/hooks/useCaminho';

const coresFase: Record<string, string> = {
  FASE_1_PRIMEIRAS_24H: '#E21B3C',
  FASE_2_INICIAL: '#FF8C00',
  FASE_3_DESCAMACAO: '#FFD700',
  FASE_4_PROFUNDA: '#22c55e',
};

// Mock data para visualização — igual à referência HTML
const MOCK_CAMINHO = [
  { id: 'm1', numeroDia: '1-3', statusDia: 'COMPLETO', estrelas: 3, xpGanho: 50, fase: 'FASE_1_PRIMEIRAS_24H' },
  { id: 'm2', numeroDia: '4-7', statusDia: 'COMPLETO', estrelas: 3, xpGanho: 100, fase: 'FASE_2_INICIAL' },
  { id: 'm3', numeroDia: '8-14', statusDia: 'COMPLETO', estrelas: 3, xpGanho: 150, fase: 'FASE_2_INICIAL' },
  { id: 'm4', numeroDia: '18', statusDia: 'DISPONIVEL', estrelas: 0, xpGanho: 200, fase: 'FASE_3_DESCAMACAO', titulo: 'Hidratação & Limpeza' },
  { id: 'm5', numeroDia: '19', statusDia: 'BLOQUEADO', estrelas: 0, xpGanho: 250, fase: 'FASE_3_DESCAMACAO', titulo: 'Avaliação da Pele' },
  { id: 'm6', numeroDia: '20', statusDia: 'BLOQUEADO', estrelas: 0, xpGanho: 300, fase: 'FASE_3_DESCAMACAO', titulo: 'Hidratação' },
];

export default function CaminhoScreen() {
  const router = useRouter();
  const { cicatrizacao, loading: cicLoading } = useCicatrizacao();
  const { caminho, loading: caminhoLoading } = useCaminho(cicatrizacao?.id || null);

  const loading = cicLoading || caminhoLoading;
  
  // Usa dados reais se disponíveis, senão usa mock
  const caminhoAtivo = caminho.length > 0 ? caminho : MOCK_CAMINHO;
  const usandoMock = caminho.length === 0;
  
  const diasCompletos = usandoMock ? 3 : caminho.filter(c => c.statusDia === 'COMPLETO').length;
  const totalDias = cicatrizacao?.periodoTotalDias || 30;
  const progresso = usandoMock ? 60 : (totalDias > 0 ? (diasCompletos / totalDias) * 100 : 0);

  function handleNodePress(checkpoint: any) {
    const { statusDia, numeroDia } = checkpoint;

    if (statusDia === 'BLOQUEADO') {
      return;
    }

    if (statusDia === 'PERDIDO') {
      Alert.alert(
        'Dia Perdido',
        'Este dia foi perdido por não completar os cuidados a tempo. Continue com os próximos dias!',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!usandoMock) {
      router.push(`/dia/${numeroDia}` as any);
    }
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>

        {/* Header - fixed top bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#adaaaa" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>RECOVERY PROGRESS</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Status Card */}
          <View style={styles.progressCard}>
            <View style={styles.progressCardGlow} />
            <View style={styles.progressHeader}>
              <View>
                <Text style={styles.progressLabel}>STATUS GERAL</Text>
                <Text style={styles.progressTitle}>
                  Fase 2: <Text style={styles.progressTitleAccent}>Cura</Text>
                </Text>
              </View>
              <View style={styles.progressDays}>
                <Text style={styles.progressDaysNumber}>{usandoMock ? 18 : diasCompletos}</Text>
                <Text style={styles.progressDaysTotal}>/{totalDias} dias</Text>
              </View>
            </View>
            <View style={styles.progressBarContainer}>
              <LinearGradient
                colors={['#ff8d8c', '#ff7072']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressBarFill, { width: `${progresso}%` }]}
              />
            </View>
          </View>

          <Text style={styles.journeyTitle}>SUA JORNADA</Text>

          {/* Journey Map */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ff8d8c" />
              <Text style={styles.loadingText}>Carregando caminho...</Text>
            </View>
          ) : (
            <View style={styles.pathContainer}>
              {caminhoAtivo.map((checkpoint, index) => (
                <NodeItem
                  key={checkpoint.id}
                  checkpoint={checkpoint}
                  index={index}
                  onPress={() => handleNodePress(checkpoint)}
                  isCurrentDay={checkpoint.statusDia === 'DISPONIVEL'}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// Node component
function NodeItem({ checkpoint, index, onPress, isCurrentDay }: any) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const { numeroDia, statusDia, estrelas, xpGanho, fase } = checkpoint;

  const isLeft = index % 2 === 0;
  const corFase = coresFase[fase] || '#888';

  // Pulse animation for current day node
  useEffect(() => {
    if (isCurrentDay) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isCurrentDay]);

  const getCircleStyle = () => {
    switch (statusDia) {
      case 'COMPLETO':
        return {
          backgroundColor: '#22c55e',
          borderColor: '#22c55e',
          shadowColor: '#22c55e',
          shadowOpacity: 0.4,
          shadowRadius: 15,
          elevation: 8,
        };
      case 'PARCIAL':
        return { backgroundColor: '#FFD700', borderColor: '#FFD700' };
      case 'DISPONIVEL':
        return {
          backgroundColor: '#FF8C00',
          borderColor: '#FF8C00',
          shadowColor: '#FF8C00',
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 8,
        };
      case 'PERDIDO':
        return { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: '#EF9A9A', opacity: 0.6 };
      case 'BLOQUEADO':
      default:
        return { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', opacity: 0.4 };
    }
  };

  const getIcon = () => {
    switch (statusDia) {
      case 'COMPLETO':
      case 'PARCIAL':
        return <Ionicons name="checkmark" size={28} color="#fff" />;
      case 'DISPONIVEL':
        return <Ionicons name="play" size={30} color="#fff" />;
      case 'PERDIDO':
        return <Ionicons name="close" size={28} color="#EF9A9A" />;
      case 'BLOQUEADO':
      default:
        return <Ionicons name="lock-closed" size={24} color="#adaaaa" />;
    }
  };

  const isClickable = ['DISPONIVEL', 'COMPLETO', 'PARCIAL'].includes(statusDia);

  return (
    <View style={[styles.nodeWrapper, isLeft ? styles.nodeLeft : styles.nodeRight]}>
      <View style={styles.nodeContent}>
        {/* HOJE badge */}
        {isCurrentDay && (
          <View style={styles.hojeBadge}>
            <Text style={styles.hojeText}>HOJE</Text>
          </View>
        )}

        {/* Circle node */}
        <TouchableOpacity
          onPress={isClickable ? onPress : undefined}
          activeOpacity={isClickable ? 0.7 : 1}
          disabled={!isClickable}
        >
          <Animated.View
            style={[
              styles.nodeCircle,
              getCircleStyle(),
              isCurrentDay && { transform: [{ scale: scaleAnim }] },
            ]}
          >
            {getIcon()}
          </Animated.View>
        </TouchableOpacity>

        {/* Info below node */}
        <View style={styles.nodeInfo}>
          <Text style={styles.nodeDia}>Dia {numeroDia}</Text>
          {(statusDia === 'COMPLETO' || statusDia === 'PARCIAL') && (
            <>
              <View style={styles.nodeXpRow}>
                <Ionicons name="star" size={14} color={statusDia === 'COMPLETO' ? '#22c55e' : '#FFD700'} />
                <Text style={[styles.nodeXp, { color: statusDia === 'COMPLETO' ? '#22c55e' : '#FFD700' }]}>
                  +{xpGanho} XP
                </Text>
              </View>
            </>
          )}
          {statusDia === 'DISPONIVEL' && (
            <>
              <Text style={styles.nodeTitle}>Hidratação & Limpeza</Text>
              <Text style={styles.nodeSubtitle}>Toque para iniciar</Text>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e0e0e' },
  safe: { flex: 1 },

  // Header: fixed top, bg transparent with blur simulation
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
    backgroundColor: 'rgba(14,14,14,0.9)',
  },
  backBtn: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  // font-['Epilogue'] font-bold tracking-tighter uppercase text-xl text-[#ff8d8c]
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ff8d8c',
    letterSpacing: -0.5,
    textTransform: 'uppercase',
  },

  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 120 },

  // Status Card: bg-surface-container-highest p-6 rounded-lg glass-panel
  progressCard: {
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: 'rgba(38, 38, 38, 0.6)',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    position: 'relative',
    overflow: 'hidden',
  },
  progressCardGlow: {
    position: 'absolute', top: -40, right: -40,
    width: 128, height: 128, borderRadius: 64,
    backgroundColor: '#ff8d8c',
    opacity: 0.2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
    zIndex: 10,
  },
  // font-label text-sm text-on-surface-variant uppercase tracking-wider
  progressLabel: {
    fontSize: 14,
    color: '#adaaaa',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '400',
    marginBottom: 4,
  },
  // font-headline text-3xl font-extrabold
  progressTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
  progressTitleAccent: { color: '#ff8d8c' },
  progressDays: { alignItems: 'flex-end' },
  // font-headline text-2xl font-bold text-primary
  progressDaysNumber: { fontSize: 28, fontWeight: '700', color: '#ff8d8c' },
  // font-label text-sm text-on-surface-variant
  progressDaysTotal: { fontSize: 13, color: '#adaaaa' },
  // h-2 bg-surface-container-low rounded-full
  progressBarContainer: {
    height: 8,
    backgroundColor: '#131313',
    borderRadius: 4,
    overflow: 'hidden',
    zIndex: 10,
  },
  progressBarFill: {
    height: 8,
    borderRadius: 4,
  },

  // font-headline text-xl font-bold uppercase
  journeyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    paddingHorizontal: 8,
    marginBottom: 24,
    letterSpacing: -0.5,
    textTransform: 'uppercase',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: { color: '#adaaaa', marginTop: 12, fontSize: 13 },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    color: '#adaaaa',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },

  pathContainer: { paddingVertical: 32 },

  // Zigzag layout
  nodeWrapper: {
    marginBottom: 64,
    position: 'relative',
  },
  nodeLeft: { alignItems: 'flex-start', paddingLeft: '20%' },
  nodeRight: { alignItems: 'flex-end', paddingRight: '20%' },

  nodeContent: {
    alignItems: 'center',
    position: 'relative',
  },

  // HOJE badge: bg-surface-container-highest px-3 py-1 rounded-sm border
  hojeBadge: {
    position: 'absolute',
    top: -32,
    backgroundColor: '#262626',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    zIndex: 20,
  },
  // font-headline text-xs font-bold text-warning tracking-widest uppercase
  hojeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF8C00',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  // Circle: 60px, border 3px
  nodeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },

  nodeInfo: {
    marginTop: 8,
    alignItems: 'center',
  },
  // font-label text-xs text-on-surface-variant uppercase font-bold tracking-widest
  nodeDia: {
    fontSize: 11,
    color: '#adaaaa',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 2,
  },
  nodeXpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  // font-label text-xs font-bold
  nodeXp: {
    fontSize: 12,
    fontWeight: '700',
  },
  // font-headline text-sm text-on-surface font-bold
  nodeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginTop: 4,
  },
  // font-label text-xs text-on-surface-variant
  nodeSubtitle: {
    fontSize: 12,
    color: '#adaaaa',
    marginTop: 2,
  },

  // Dashed connection line
  connectionLine: {
    position: 'absolute',
    bottom: -64,
    left: '50%',
    width: 3,
    height: 64,
    backgroundColor: '#484847',
    marginLeft: -1.5,
    opacity: 0.5,
  },
});
