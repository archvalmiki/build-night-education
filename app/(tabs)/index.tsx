import * as Haptics from 'expo-haptics';
import Head from 'expo-router/head';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fonts } from '@/constants/theme';

const COLORS = {
  sky: '#C9EEFF',
  skyDark: '#73C7EC',
  lemon: '#FFD85A',
  grape: '#6654E8',
  bubblegum: '#F65F9C',
  mint: '#58D5A2',
  peach: '#FFB47A',
  cream: '#FFFDF5',
  ink: '#26305B',
  softInk: '#525C82',
  white: '#FFFFFF',
  lavender: '#EAE6FF',
};

const tools = [
  { id: 'search', label: 'Web search', icon: '🌎', detail: 'Look up fresh facts', color: COLORS.sky },
  { id: 'memory', label: 'Memory', icon: '🧠', detail: 'Remember past clues', color: COLORS.lavender },
  { id: 'calculator', label: 'Calculator', icon: '🧮', detail: 'Work out exact math', color: '#FFE4CF' },
] as const;

type ToolId = (typeof tools)[number]['id'];

const missions: { task: string; hint: string; correctTool: ToolId }[] = [
  { task: 'What will the weather be tomorrow?', hint: 'Tomorrow’s forecast can change.', correctTool: 'search' },
  { task: 'What is my favorite color?', hint: 'You told Pip earlier.', correctTool: 'memory' },
  { task: 'What is 18% of 240?', hint: 'Pip needs an exact answer.', correctTool: 'calculator' },
  { task: 'Who won yesterday’s game?', hint: 'Yesterday’s result is fresh news.', correctTool: 'search' },
  { task: 'Where did I stop last time?', hint: 'Your progress was saved.', correctTool: 'memory' },
];

function PageHead() {
  return (
    <Head>
      <title>Agent Ninja</title>
      <meta name="description" content="A playful game about how AI agents choose tools." />
    </Head>
  );
}

function PipCharacter({ small = false }: { small?: boolean }) {
  return (
    <View accessible accessibilityLabel="A friendly purple ninja robot" accessibilityRole="image" style={[styles.pip, small && styles.pipSmall]}>
      <View style={[styles.antennaStem, small && styles.antennaStemSmall]} />
      <View style={[styles.antennaDot, small && styles.antennaDotSmall]} />
      <View style={[styles.pipEar, styles.pipEarLeft]} />
      <View style={[styles.pipEar, styles.pipEarRight]} />
      <View style={[styles.pipHead, small && styles.pipHeadSmall]}>
        <View style={[styles.ninjaBand, small && styles.ninjaBandSmall]}>
          <View style={[styles.ninjaBadge, small && styles.ninjaBadgeSmall]} />
        </View>
        <View style={styles.pipEyes}>
          <View style={[styles.pipEye, small && styles.pipEyeSmall]} />
          <View style={[styles.pipEye, small && styles.pipEyeSmall]} />
        </View>
        <View style={[styles.pipSmile, small && styles.pipSmileSmall]} />
        {!small && <View style={styles.pipCheeks}><View style={styles.pipCheek} /><View style={styles.pipCheek} /></View>}
      </View>
      {!small && (
        <>
          <View style={styles.pipBody}><View style={styles.pipHeart}><Text style={styles.pipHeartText}>★</Text></View></View>
          <View style={[styles.pipArm, styles.pipArmLeft]} />
          <View style={[styles.pipArm, styles.pipArmRight]} />
        </>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const [started, setStarted] = useState(false);
  const [missionIndex, setMissionIndex] = useState(0);
  const [selectedTool, setSelectedTool] = useState<ToolId | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [finished, setFinished] = useState(false);

  const mission = missions[missionIndex];
  const correct = selectedTool === mission.correctTool;

  function startGame() {
    setStarted(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

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
    setMissionIndex(0);
    setSelectedTool(null);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setFinished(false);
    setStarted(false);
  }

  if (!started) {
    return (
      <>
        <PageHead />
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.startPage} showsVerticalScrollIndicator={false}>
            <View style={[styles.cloud, styles.cloudOne]} />
            <View style={[styles.cloud, styles.cloudTwo]} />
            <View style={styles.logoPill}><Text style={styles.logoText}>AGENT NINJA</Text></View>
            <View style={styles.heroBubble}>
              <View style={styles.sparkleOne}><Text style={styles.sparkleText}>✦</Text></View>
              <View style={styles.sparkleTwo}><Text style={styles.sparkleText}>★</Text></View>
              <PipCharacter />
            </View>
            <Text style={styles.startTitle}>Train your Agent Ninja!</Text>
            <Text style={styles.startCopy}>
              AI agents solve jobs by choosing tools. Pick the best tool for each mission.
            </Text>
            <View style={styles.toolPreviewRow}>
              {tools.map((tool) => (
                <View key={tool.id} style={[styles.previewBubble, { backgroundColor: tool.color }]}>
                  <Text style={styles.previewIcon}>{tool.icon}</Text>
                </View>
              ))}
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={startGame}
              style={({ pressed }) => [styles.startButton, pressed && styles.buttonPressed]}>
              <Text style={styles.startButtonText}>Start the quest</Text>
              <Text style={styles.startButtonArrow}>→</Text>
            </Pressable>
            <Text style={styles.roundNote}>5 quick missions · about 2 minutes</Text>
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }

  if (finished) {
    return (
      <>
        <PageHead />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.resultPage}>
            <Text style={[styles.confetti, styles.confettiLeft]}>●  ✦</Text>
            <Text style={[styles.confetti, styles.confettiRight]}>★  ●</Text>
            <View style={styles.resultPipWrap}><PipCharacter /></View>
            <Text style={styles.resultTitle}>Ninja rank unlocked!</Text>
            <Text style={styles.resultCopy}>You chose tools like a real AI agent.</Text>
            <View style={styles.scoreCard}>
              <View style={styles.scoreItem}><Text style={styles.scoreBig}>{score}</Text><Text style={styles.scoreCaption}>points</Text></View>
              <View style={styles.scoreDivider} />
              <View style={styles.scoreItem}><Text style={styles.scoreBig}>{bestStreak}</Text><Text style={styles.scoreCaption}>best streak</Text></View>
            </View>
            <Pressable accessibilityRole="button" onPress={restartGame} style={({ pressed }) => [styles.playAgainButton, pressed && styles.buttonPressed]}>
              <Text style={styles.playAgainText}>Play again</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <PageHead />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.gamePage} showsVerticalScrollIndicator={false}>
          <View style={styles.gameHeader}>
            <View><Text style={styles.gameBrand}>Agent Ninja</Text><Text style={styles.levelText}>Mission {missionIndex + 1} of {missions.length}</Text></View>
            <View style={styles.pointsPill}><Text style={styles.pointsStar}>★</Text><Text style={styles.pointsText}>{score}</Text></View>
          </View>
          <View accessibilityLabel={`${missionIndex + (selectedTool ? 1 : 0)} of ${missions.length} missions complete`} style={styles.dotsRow}>
            {missions.map((_, index) => <View key={index} style={[styles.progressDot, index < missionIndex + (selectedTool ? 1 : 0) && styles.progressDotDone]} />)}
          </View>
          <View style={styles.missionBubble}>
            <View style={styles.miniPipWrap}><PipCharacter small /></View>
            <View style={styles.speechCopy}>
              <Text style={styles.pipSays}>Your ninja asks:</Text>
              <Text style={styles.missionText}>{mission.task}</Text>
              <Text style={styles.missionHint}>{mission.hint}</Text>
            </View>
          </View>
          <Text style={styles.chooseTitle}>Which tool should Agent Ninja use?</Text>
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
                  style={({ pressed }) => [styles.toolCard, { backgroundColor: tool.color }, pressed && styles.toolPressed, isAnswer && styles.toolCorrect, isWrong && styles.toolWrong]}>
                  <View style={styles.iconBubble}><Text style={styles.toolIcon}>{tool.icon}</Text></View>
                  <View style={styles.toolCopy}><Text style={styles.toolLabel}>{tool.label}</Text><Text style={styles.toolDetail}>{tool.detail}</Text></View>
                  <View style={[styles.choiceMark, isAnswer && styles.choiceMarkCorrect, isWrong && styles.choiceMarkWrong]}>
                    <Text style={styles.choiceMarkText}>{isAnswer ? '✓' : isWrong ? '×' : '›'}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
          {selectedTool && (
            <View style={[styles.feedbackCard, correct ? styles.feedbackCorrect : styles.feedbackWrong]}>
              <Text style={styles.feedbackEmoji}>{correct ? '🎉' : '💡'}</Text>
              <View style={styles.feedbackWords}>
                <Text style={styles.feedbackTitle}>{correct ? 'Great choice!' : 'Good try!'}</Text>
                <Text style={styles.feedbackCopy}>
                  {correct ? `${tools.find((tool) => tool.id === mission.correctTool)?.label} fits this mission.` : `Your ninja needs ${tools.find((tool) => tool.id === mission.correctTool)?.label.toLowerCase()} this time.`}
                </Text>
              </View>
              <Pressable accessibilityRole="button" onPress={continueGame} style={({ pressed }) => [styles.nextButton, pressed && styles.buttonPressed]}>
                <Text style={styles.nextButtonText}>{missionIndex === missions.length - 1 ? 'See my score' : 'Next'}</Text>
              </Pressable>
            </View>
          )}
          <Text style={styles.streakText}>🔥 {streak} answer streak</Text>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const shadow = { boxShadow: '0 5px 0 rgba(38, 48, 91, 0.14)' };

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.sky },
  startPage: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 14, paddingBottom: 28, overflow: 'hidden' },
  cloud: { position: 'absolute', width: 120, height: 44, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.62)' },
  cloudOne: { left: -34, top: 72, transform: [{ rotate: '-8deg' }] }, cloudTwo: { right: -50, top: 185, transform: [{ rotate: '12deg' }] },
  logoPill: { backgroundColor: COLORS.white, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 2, borderColor: COLORS.ink },
  logoText: { color: COLORS.ink, fontFamily: Fonts.rounded, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  heroBubble: { width: 230, height: 230, borderRadius: 115, backgroundColor: COLORS.lemon, alignItems: 'center', justifyContent: 'center', marginTop: 24, borderWidth: 3, borderColor: COLORS.ink, ...shadow },
  sparkleOne: { position: 'absolute', left: 18, top: 52 }, sparkleTwo: { position: 'absolute', right: 20, top: 26 }, sparkleText: { color: COLORS.bubblegum, fontSize: 27, fontWeight: '900' },
  pip: { width: 164, height: 174, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 20 }, pipSmall: { width: 68, height: 68, paddingTop: 10 },
  antennaStem: { width: 5, height: 24, borderRadius: 3, backgroundColor: COLORS.ink, position: 'absolute', top: 2 }, antennaStemSmall: { width: 3, height: 12, top: 0 },
  antennaDot: { width: 17, height: 17, borderRadius: 9, backgroundColor: COLORS.bubblegum, borderWidth: 3, borderColor: COLORS.ink, position: 'absolute', top: -6 }, antennaDotSmall: { width: 9, height: 9, borderWidth: 2, top: -3 },
  pipEar: { position: 'absolute', top: 49, width: 19, height: 39, borderRadius: 10, backgroundColor: COLORS.bubblegum, borderWidth: 3, borderColor: COLORS.ink }, pipEarLeft: { left: 2 }, pipEarRight: { right: 2 },
  pipHead: { width: 140, height: 91, borderRadius: 34, backgroundColor: COLORS.white, borderWidth: 4, borderColor: COLORS.ink, alignItems: 'center', paddingTop: 25, zIndex: 2 }, pipHeadSmall: { width: 58, height: 45, borderRadius: 17, borderWidth: 3, paddingTop: 12 },
  ninjaBand: { position: 'absolute', left: 0, right: 0, top: 10, height: 15, backgroundColor: COLORS.grape, alignItems: 'center', justifyContent: 'center' }, ninjaBandSmall: { top: 4, height: 8 },
  ninjaBadge: { width: 17, height: 17, borderRadius: 9, backgroundColor: COLORS.lemon, borderWidth: 2, borderColor: COLORS.ink }, ninjaBadgeSmall: { width: 9, height: 9, borderWidth: 1 },
  pipEyes: { flexDirection: 'row', gap: 31 }, pipEye: { width: 13, height: 19, borderRadius: 8, backgroundColor: COLORS.ink }, pipEyeSmall: { width: 6, height: 9 },
  pipSmile: { width: 30, height: 13, borderBottomWidth: 4, borderBottomColor: COLORS.ink, borderRadius: 15, marginTop: 4 }, pipSmileSmall: { width: 15, height: 7, borderBottomWidth: 2, marginTop: 1 },
  pipCheeks: { position: 'absolute', left: 15, right: 15, top: 57, flexDirection: 'row', justifyContent: 'space-between' }, pipCheek: { width: 13, height: 7, borderRadius: 7, backgroundColor: '#FF9FC4' },
  pipBody: { width: 88, height: 65, borderRadius: 24, backgroundColor: COLORS.grape, borderWidth: 4, borderColor: COLORS.ink, marginTop: -3, alignItems: 'center', paddingTop: 12 },
  pipHeart: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.lemon, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: COLORS.ink }, pipHeartText: { color: COLORS.bubblegum, fontSize: 18, fontWeight: '900' },
  pipArm: { position: 'absolute', top: 115, width: 44, height: 16, borderRadius: 10, backgroundColor: COLORS.grape, borderWidth: 3, borderColor: COLORS.ink }, pipArmLeft: { left: 11, transform: [{ rotate: '24deg' }] }, pipArmRight: { right: 11, transform: [{ rotate: '-24deg' }] },
  startTitle: { color: COLORS.ink, fontFamily: Fonts.rounded, fontSize: 40, lineHeight: 44, fontWeight: '900', letterSpacing: -1.5, marginTop: 24, textAlign: 'center' },
  startCopy: { color: COLORS.softInk, fontFamily: Fonts.rounded, fontSize: 17, lineHeight: 24, fontWeight: '600', textAlign: 'center', maxWidth: 340, marginTop: 10 },
  toolPreviewRow: { flexDirection: 'row', gap: 10, marginTop: 18 }, previewBubble: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.ink }, previewIcon: { fontSize: 24 },
  startButton: { width: '100%', maxWidth: 350, minHeight: 62, borderRadius: 22, backgroundColor: COLORS.bubblegum, borderWidth: 3, borderColor: COLORS.ink, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20, ...shadow },
  startButtonText: { color: COLORS.ink, fontFamily: Fonts.rounded, fontSize: 20, fontWeight: '900' }, startButtonArrow: { color: COLORS.ink, fontSize: 27, fontWeight: '900', marginLeft: 12 }, buttonPressed: { transform: [{ translateY: 3 }] },
  roundNote: { color: COLORS.softInk, fontFamily: Fonts.rounded, fontSize: 12, fontWeight: '700', marginTop: 12 },
  gamePage: { flexGrow: 1, backgroundColor: COLORS.cream, paddingHorizontal: 18, paddingTop: 12, paddingBottom: 30 },
  gameHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, gameBrand: { color: COLORS.ink, fontFamily: Fonts.rounded, fontSize: 22, fontWeight: '900' }, levelText: { color: COLORS.softInk, fontFamily: Fonts.rounded, fontSize: 13, fontWeight: '700', marginTop: 2 },
  pointsPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.lemon, borderWidth: 2, borderColor: COLORS.ink, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 }, pointsStar: { color: COLORS.bubblegum, fontSize: 17 }, pointsText: { color: COLORS.ink, fontFamily: Fonts.rounded, fontSize: 15, fontWeight: '900', marginLeft: 5 },
  dotsRow: { flexDirection: 'row', gap: 7, marginTop: 15 }, progressDot: { flex: 1, height: 8, borderRadius: 4, backgroundColor: '#DDD9EE' }, progressDotDone: { backgroundColor: COLORS.grape },
  missionBubble: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.lemon, borderRadius: 28, borderWidth: 3, borderColor: COLORS.ink, padding: 16, marginTop: 18, ...shadow },
  miniPipWrap: { width: 76, height: 76, borderRadius: 38, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', marginRight: 13, overflow: 'hidden' }, speechCopy: { flex: 1 }, pipSays: { color: COLORS.grape, fontFamily: Fonts.rounded, fontSize: 13, fontWeight: '900' },
  missionText: { color: COLORS.ink, fontFamily: Fonts.rounded, fontSize: 21, lineHeight: 25, fontWeight: '900', marginTop: 3 }, missionHint: { color: COLORS.softInk, fontFamily: Fonts.rounded, fontSize: 12, lineHeight: 17, fontWeight: '600', marginTop: 6 },
  chooseTitle: { color: COLORS.ink, fontFamily: Fonts.rounded, fontSize: 19, fontWeight: '900', marginTop: 24, marginBottom: 11 }, toolList: { gap: 11 },
  toolCard: { minHeight: 76, borderRadius: 22, borderWidth: 3, borderColor: COLORS.ink, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', ...shadow }, toolPressed: { transform: [{ translateY: 3 }] }, toolCorrect: { borderColor: '#187A57', borderWidth: 4 }, toolWrong: { borderColor: '#B52D57', borderWidth: 4 },
  iconBubble: { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.white, borderWidth: 2, borderColor: COLORS.ink, alignItems: 'center', justifyContent: 'center' }, toolIcon: { fontSize: 28 }, toolCopy: { flex: 1, marginLeft: 12 }, toolLabel: { color: COLORS.ink, fontFamily: Fonts.rounded, fontSize: 17, fontWeight: '900' }, toolDetail: { color: COLORS.softInk, fontFamily: Fonts.rounded, fontSize: 12, fontWeight: '600', marginTop: 2 },
  choiceMark: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.white, borderWidth: 2, borderColor: COLORS.ink, alignItems: 'center', justifyContent: 'center' }, choiceMarkCorrect: { backgroundColor: COLORS.mint }, choiceMarkWrong: { backgroundColor: '#FF9CB8' }, choiceMarkText: { color: COLORS.ink, fontSize: 23, lineHeight: 25, fontWeight: '900' },
  feedbackCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 22, borderWidth: 3, borderColor: COLORS.ink, padding: 12, marginTop: 16 }, feedbackCorrect: { backgroundColor: '#D7F8E9' }, feedbackWrong: { backgroundColor: '#FFE0EB' }, feedbackEmoji: { fontSize: 28 }, feedbackWords: { flex: 1, marginLeft: 9 }, feedbackTitle: { color: COLORS.ink, fontFamily: Fonts.rounded, fontSize: 16, fontWeight: '900' }, feedbackCopy: { color: COLORS.softInk, fontFamily: Fonts.rounded, fontSize: 11, lineHeight: 15, fontWeight: '600', marginTop: 2 },
  nextButton: { backgroundColor: COLORS.grape, minWidth: 76, minHeight: 44, borderRadius: 16, borderWidth: 2, borderColor: COLORS.ink, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 }, nextButtonText: { color: COLORS.white, fontFamily: Fonts.rounded, fontSize: 13, fontWeight: '900' }, streakText: { color: COLORS.softInk, fontFamily: Fonts.rounded, fontSize: 13, fontWeight: '800', textAlign: 'center', marginTop: 16 },
  resultPage: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, overflow: 'hidden' }, resultPipWrap: { width: 230, height: 230, borderRadius: 115, backgroundColor: COLORS.lemon, borderWidth: 3, borderColor: COLORS.ink, alignItems: 'center', justifyContent: 'center', ...shadow },
  confetti: { position: 'absolute', color: COLORS.bubblegum, fontSize: 25, fontWeight: '900' }, confettiLeft: { left: 22, top: 90, transform: [{ rotate: '-18deg' }] }, confettiRight: { right: 20, top: 120, color: COLORS.grape, transform: [{ rotate: '17deg' }] },
  resultTitle: { color: COLORS.ink, fontFamily: Fonts.rounded, fontSize: 35, fontWeight: '900', letterSpacing: -1, marginTop: 24, textAlign: 'center' }, resultCopy: { color: COLORS.softInk, fontFamily: Fonts.rounded, fontSize: 16, lineHeight: 22, fontWeight: '600', textAlign: 'center', maxWidth: 330, marginTop: 8 },
  scoreCard: { width: '100%', maxWidth: 330, flexDirection: 'row', backgroundColor: COLORS.white, borderWidth: 3, borderColor: COLORS.ink, borderRadius: 22, paddingVertical: 14, marginTop: 20, ...shadow }, scoreItem: { flex: 1, alignItems: 'center' }, scoreDivider: { width: 2, backgroundColor: '#D9D5E9' }, scoreBig: { color: COLORS.grape, fontFamily: Fonts.rounded, fontSize: 25, fontWeight: '900' }, scoreCaption: { color: COLORS.softInk, fontFamily: Fonts.rounded, fontSize: 11, fontWeight: '700' },
  playAgainButton: { width: '100%', maxWidth: 330, minHeight: 58, borderRadius: 20, backgroundColor: COLORS.bubblegum, borderWidth: 3, borderColor: COLORS.ink, alignItems: 'center', justifyContent: 'center', marginTop: 20, ...shadow }, playAgainText: { color: COLORS.white, fontFamily: Fonts.rounded, fontSize: 18, fontWeight: '900' },
});
