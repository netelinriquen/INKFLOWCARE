import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCicatrizacao } from '@/hooks/useCicatrizacao';
import { useChecklist } from '@/hooks/useChecklist';

const periodoNomes: Record<string, string> = {
  MANHA: 'Manhã',
  TARDE: 'Tarde',
  NOITE: 'Noite',
};

const periodoIcones: Record<string, any> = {
  MANHA: 'sunny',
  TARDE: 'partly-sunny',
  NOITE: 'moon',
};

export default function DiaScreen() {
  const router = useRouter();
  const { numero } = useLocalSearchParams();
  const numeroDia = parseInt(numero as string);

  const { cicatrizacao, loading: cicLoading } = useCicatrizacao();
  const { checklist, loading: checklistLoading, toggleItem } = useChecklist(
    cicatrizacao?.id || null,
    numeroDia
  );

  const loading = cicLoading || checklistLoading;

  // Agrupar checklist por período
  const checklistPorPeriodo = {
    MANHA: checklist.filter(item => item.periodo === 'MANHA').sort((a, b) => a.ordem - b.ordem),
    TARDE: checklist.filter(item => item.periodo === 'TARDE').sort((a, b) => a.ordem - b.ordem),
    NOITE: checklist.filter(item => item.periodo === 'NOITE').sort((a, b) => a.ordem - b.ordem),
  };

  const totalItens = checklist.length;
  const itensConcluidos = checklist.filter(item => item.concluido).length;
  const progresso = totalItens > 0 ? (itensConcluidos / totalItens) * 100 : 0;

  async function handleToggle(itemId: number) {
    await toggleItem(itemId);
  }

  return (
    <LinearGradient colors={['#0e0e0e', '#0a0a2e', '#0d1b4b']} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#adaaaa" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>DIA {numeroDia}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>PROGRESSO DO DIA</Text>
            <Text style={styles.progressPercent}>{Math.round(progresso)}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: `${progresso}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {itensConcluidos}/{totalItens} tarefas concluídas
          </Text>
        </View>

        {/* Checklist */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF0000" />
              <Text style={styles.loadingText}>Carregando checklist...</Text>
            </View>
          ) : checklist.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="clipboard-outline" size={64} color="#555" />
              <Text style={styles.emptyTitle}>Nenhuma tarefa disponível</Text>
              <Text style={styles.emptySubtitle}>Este dia ainda não possui checklist</Text>
            </View>
          ) : (
            <>
              {/* Manhã */}
              {checklistPorPeriodo.MANHA.length > 0 && (
                <PeriodoSection
                  periodo="MANHA"
                  itens={checklistPorPeriodo.MANHA}
                  onToggle={handleToggle}
                />
              )}

              {/* Tarde */}
              {checklistPorPeriodo.TARDE.length > 0 && (
                <PeriodoSection
                  periodo="TARDE"
                  itens={checklistPorPeriodo.TARDE}
                  onToggle={handleToggle}
                />
              )}

              {/* Noite */}
              {checklistPorPeriodo.NOITE.length > 0 && (
                <PeriodoSection
                  periodo="NOITE"
                  itens={checklistPorPeriodo.NOITE}
                  onToggle={handleToggle}
                />
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// Componente de Seção por Período
function PeriodoSection({ periodo, itens, onToggle }: any) {
  const concluidos = itens.filter((i: any) => i.concluido).length;
  const total = itens.length;

  return (
    <View style={styles.periodoSection}>
      <View style={styles.periodoHeader}>
        <View style={styles.periodoTitleRow}>
          <Ionicons name={periodoIcones[periodo]} size={20} color="#ff8d8c" />
          <Text style={styles.periodoTitle}>{periodoNomes[periodo]}</Text>
        </View>
        <Text style={styles.periodoCounter}>{concluidos}/{total}</Text>
      </View>

      <View style={styles.periodoCard}>
        {itens.map((item: any, index: number) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.checklistItem,
              index < itens.length - 1 && styles.checklistItemBorder,
            ]}
            onPress={() => onToggle(item.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, item.concluido && styles.checkboxChecked]}>
              {item.concluido && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <Text style={[styles.checklistText, item.concluido && styles.checklistTextDone]}>
              {item.descricao}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ff8d8c',
    letterSpacing: 2,
  },

  progressCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: 'rgba(38, 38, 38, 0.6)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 11,
    color: '#adaaaa',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  progressPercent: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ff8d8c',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#ff8d8c',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#adaaaa',
  },

  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 100 },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: { color: '#888', marginTop: 12, fontSize: 13 },

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
    color: '#888',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },

  periodoSection: {
    marginBottom: 24,
  },
  periodoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  periodoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  periodoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  periodoCounter: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ff8d8c',
  },

  periodoCard: {
    backgroundColor: 'rgba(38, 38, 38, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },

  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  checklistItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#ff8d8c',
    borderColor: '#ff8d8c',
  },

  checklistText: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  checklistTextDone: {
    color: '#555',
    textDecorationLine: 'line-through',
  },
});
