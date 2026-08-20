import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fonts } from '@/constants/theme';

const COLORS = {
  ice: '#EEF3F8', white: '#FFFFFF', ink: '#101A32', cobalt: '#3047F4',
  coral: '#F2614B', mint: '#2DAA78', steel: '#66708A', line: '#CBD4E2',
};

const tools = [
  { id: 'search', label: 'Web search', glyph: '⌕', detail: 'Find current facts' },
  { id: 'memory', label: 'Memory', glyph: '◉', detail: 'Recall saved context' },
  { id: 'calculator', label: 'Calculator', glyph: '÷', detail: 'Solve exact math' },
] as const;

type ToolId = (typeof tools)[number]['id'];

const missions: { task: string; context: string; correctTool: ToolId }[] = [
  { task: 'Find tomorrow’s weather in Chicago.', context: 'This answer changes every day.', correctTool: 'search' },
  { task: 'Recall the player’s favorite color.', context: 'The player shared it in an earlier session.', correctTool: 'memory' },
  { task: 'Calculate 18% of 240.', context: 'The answer must be exact.', correctTool: 'calculator' },
  { task: 'Check who won yesterday’s game.', context: 'The result is recent information.', correctTool: 'search' },
  { task: 'Recall where the player left off.', context: 'Progress was saved after the last round.', correctTool: 'memory' },
];

export default function HomeScreen() {
  const [missionIndex, setMissionIndex] = useState(0);
  const [selectedTool, setSelectedTool] = useState<ToolId | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [finished, setFinished] = useState(false);
  const mission = missions[missionIndex];
  const correct = selectedTool === mission.correctTool;
  const progress = ((missionIndex + (selectedTool ? 1 : 0)) / missions.length) * 100;

  function chooseTool(toolId: ToolId) {
    if (selectedTool) return;
    const isCorrect = toolId === mission.correctTool;
    setSelectedTool(toolId);
    if (isCorrect) {
      const nextStreak = streak + 1;
      setScore((current) => current + 100 + streak * 25);
      setStreak(nextStreak);
      setBestStreak((current) => Math.max(current, nextStreak));
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setStreak(0);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  function continueGame() {
    if (missionIndex === missions.length - 1) {
      setFinished(true);
      return;
    }
    setMissionIndex((current) => current + 1);
    setSelectedTool(null);
  }

  function restartGame() {
    setMissionIndex(0); setSelectedTool(null); setScore(0);
    setStreak(0); setBestStreak(0); setFinished(false);
  }

  if (finished) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.resultScreen}>
          <Text style={styles.eyebrow}>TRAINING COMPLETE</Text>
          <View style={styles.resultNode}><Text style={styles.resultMark}>✓</Text></View>
          <Text style={styles.resultTitle}>Agent routed.</Text>
          <Text style={styles.resultCopy}>Tools give agents abilities. Good agents choose the right tool for each task.</Text>
          <View style={styles.resultStats}>
            <View style={styles.resultStat}><Text style={styles.resultValue}>{score}</Text><Text style={styles.resultLabel}>SCORE</Text></View>
            <View style={styles.statDivider} />
            <View style={styles.resultStat}><Text style={styles.resultValue}>{bestStreak}</Text><Text style={styles.resultLabel}>BEST STREAK</Text></View>
          </View>
          <Pressable accessibilityRole="button" onPress={restartGame} style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}>
            <Text style={styles.primaryButtonText}>Train again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View><Text style={styles.eyebrow}>AGENT LAB / 001</Text><Text style={styles.brand}>Tool Router</Text></View>
          <View style={styles.scoreBlock}><Text style={styles.scoreValue}>{score}</Text><Text style={styles.scoreLabel}>POINTS</Text></View>
        </View>
        <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View>
        <View style={styles.progressLabels}>
          <Text style={styles.utilityText}>MISSION {missionIndex + 1} / {missions.length}</Text>
          <Text style={styles.utilityText}>STREAK {streak}</Text>
        </View>
        <View style={styles.missionCard}>
          <View style={styles.agentRow}>
            <View style={styles.agentNode}><View style={styles.agentEye} /><View style={styles.agentEye} /></View>
            <View><Text style={styles.nodeLabel}>AGENT RECEIVED TASK</Text><Text style={styles.nodeStatus}>Awaiting route</Text></View>
          </View>
          <Text style={styles.missionText}>{mission.task}</Text>
          <Text style={styles.missionContext}>{mission.context}</Text>
        </View>
        <View style={styles.bus}><View style={styles.busStem} /><View style={styles.busLine} /><View style={styles.busDot} /></View>
        <Text style={styles.prompt}>Choose a tool</Text>
        <View style={styles.toolList}>
          {tools.map((tool) => {
            const isSelected = selectedTool === tool.id;
            const isAnswer = selectedTool !== null && tool.id === mission.correctTool;
            const isWrong = isSelected && !isAnswer;
            return (
              <Pressable
                accessibilityLabel={`${tool.label}. ${tool.detail}`}
                accessibilityRole="button"
                disabled={selectedTool !== null}
                key={tool.id}
                onPress={() => chooseTool(tool.id)}
                style={({ pressed }) => [styles.toolCard, pressed && styles.toolPressed, isAnswer && styles.toolCorrect, isWrong && styles.toolWrong]}>
                <View style={styles.toolGlyphBox}><Text style={styles.toolGlyph}>{tool.glyph}</Text></View>
                <View style={styles.toolCopy}><Text style={styles.toolLabel}>{tool.label}</Text><Text style={styles.toolDetail}>{tool.detail}</Text></View>
                <Text style={styles.toolArrow}>{isAnswer ? '✓' : isWrong ? '×' : '→'}</Text>
              </Pressable>
            );
          })}
        </View>
        {selectedTool && (
          <View style={[styles.feedback, correct ? styles.feedbackCorrect : styles.feedbackWrong]}>
            <Text style={styles.feedbackTitle}>{correct ? 'Route accepted' : 'Route corrected'}</Text>
            <Text style={styles.feedbackCopy}>
              {correct ? `Right. ${mission.context}` : `Use ${tools.find((tool) => tool.id === mission.correctTool)?.label.toLowerCase()}. ${mission.context}`}
            </Text>
            <Pressable accessibilityRole="button" onPress={continueGame} style={({ pressed }) => [styles.continueButton, pressed && styles.buttonPressed]}>
              <Text style={styles.continueText}>{missionIndex === missions.length - 1 ? 'View results' : 'Next mission'}</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.ice },
  page: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  eyebrow: { color: COLORS.cobalt, fontFamily: Fonts.mono, fontSize: 11, fontWeight: '700', letterSpacing: 1.4 },
  brand: { color: COLORS.ink, fontFamily: Fonts.rounded, fontSize: 30, fontWeight: '800', letterSpacing: -1.2, marginTop: 2 },
  scoreBlock: { alignItems: 'flex-end' }, scoreValue: { color: COLORS.ink, fontFamily: Fonts.mono, fontSize: 24, fontWeight: '700' },
  scoreLabel: { color: COLORS.steel, fontFamily: Fonts.mono, fontSize: 9, letterSpacing: 1.2 },
  progressTrack: { height: 6, backgroundColor: COLORS.line, marginTop: 22, overflow: 'hidden' }, progressFill: { height: '100%', backgroundColor: COLORS.cobalt },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 7 }, utilityText: { color: COLORS.steel, fontFamily: Fonts.mono, fontSize: 10, fontWeight: '600', letterSpacing: 0.7 },
  missionCard: { backgroundColor: COLORS.ink, marginTop: 22, padding: 20, minHeight: 210, borderRadius: 4 },
  agentRow: { flexDirection: 'row', alignItems: 'center', gap: 12 }, agentNode: { width: 42, height: 42, borderRadius: 21, borderWidth: 2, borderColor: COLORS.ice, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  agentEye: { width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.coral }, nodeLabel: { color: COLORS.ice, fontFamily: Fonts.mono, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  nodeStatus: { color: '#9FAAC1', fontFamily: Fonts.sans, fontSize: 13, marginTop: 2 }, missionText: { color: COLORS.white, fontFamily: Fonts.rounded, fontSize: 27, fontWeight: '700', lineHeight: 33, letterSpacing: -0.5, marginTop: 24 },
  missionContext: { color: '#B9C2D3', fontFamily: Fonts.sans, fontSize: 14, lineHeight: 20, marginTop: 12 },
  bus: { height: 38, alignItems: 'center' }, busStem: { width: 2, height: 21, backgroundColor: COLORS.cobalt }, busLine: { position: 'absolute', top: 20, left: 28, right: 28, height: 2, backgroundColor: COLORS.cobalt }, busDot: { position: 'absolute', top: 16, width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.cobalt },
  prompt: { color: COLORS.ink, fontFamily: Fonts.mono, fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }, toolList: { gap: 10 },
  toolCard: { backgroundColor: COLORS.white, borderWidth: 2, borderColor: 'transparent', borderRadius: 4, minHeight: 72, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center' }, toolPressed: { transform: [{ scale: 0.985 }] },
  toolCorrect: { borderColor: COLORS.mint, backgroundColor: '#EAF8F2' }, toolWrong: { borderColor: COLORS.coral, backgroundColor: '#FFF0ED' }, toolGlyphBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.ice, alignItems: 'center', justifyContent: 'center' },
  toolGlyph: { color: COLORS.cobalt, fontFamily: Fonts.mono, fontSize: 22, fontWeight: '700' }, toolCopy: { flex: 1, marginLeft: 13 }, toolLabel: { color: COLORS.ink, fontFamily: Fonts.rounded, fontSize: 17, fontWeight: '700' }, toolDetail: { color: COLORS.steel, fontFamily: Fonts.sans, fontSize: 12, marginTop: 2 }, toolArrow: { color: COLORS.ink, fontFamily: Fonts.mono, fontSize: 22, fontWeight: '700' },
  feedback: { borderRadius: 4, marginTop: 16, padding: 16 }, feedbackCorrect: { backgroundColor: '#DDF4E9' }, feedbackWrong: { backgroundColor: '#FFE5DF' }, feedbackTitle: { color: COLORS.ink, fontFamily: Fonts.rounded, fontSize: 18, fontWeight: '800' }, feedbackCopy: { color: COLORS.ink, fontFamily: Fonts.sans, fontSize: 14, lineHeight: 20, marginTop: 4 },
  continueButton: { backgroundColor: COLORS.ink, minHeight: 48, borderRadius: 3, marginTop: 14, alignItems: 'center', justifyContent: 'center' }, continueText: { color: COLORS.white, fontFamily: Fonts.mono, fontSize: 12, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' }, buttonPressed: { opacity: 0.82 },
  resultScreen: { flex: 1, paddingHorizontal: 28, justifyContent: 'center', alignItems: 'center' }, resultNode: { width: 82, height: 82, borderRadius: 41, backgroundColor: COLORS.cobalt, alignItems: 'center', justifyContent: 'center', marginTop: 24 }, resultMark: { color: COLORS.white, fontFamily: Fonts.mono, fontSize: 38, fontWeight: '700' }, resultTitle: { color: COLORS.ink, fontFamily: Fonts.rounded, fontSize: 36, fontWeight: '800', letterSpacing: -1.4, marginTop: 20 },
  resultCopy: { color: COLORS.steel, fontFamily: Fonts.sans, fontSize: 16, lineHeight: 24, textAlign: 'center', maxWidth: 330, marginTop: 12 }, resultStats: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 }, resultStat: { minWidth: 110, alignItems: 'center' }, statDivider: { width: 1, height: 42, backgroundColor: COLORS.line }, resultValue: { color: COLORS.ink, fontFamily: Fonts.mono, fontSize: 26, fontWeight: '700' }, resultLabel: { color: COLORS.steel, fontFamily: Fonts.mono, fontSize: 9, letterSpacing: 1, marginTop: 4 },
  primaryButton: { backgroundColor: COLORS.coral, borderRadius: 3, minHeight: 54, width: '100%', maxWidth: 330, alignItems: 'center', justifyContent: 'center' }, primaryButtonText: { color: COLORS.white, fontFamily: Fonts.mono, fontSize: 13, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
});
