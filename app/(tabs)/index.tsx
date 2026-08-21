import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import Head from 'expo-router/head';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CHOICES, type ChoiceId, LEVELS } from '@/constants/game-content';
import { Fonts } from '@/constants/theme';

const COLORS = {
  sky: '#C9EEFF',
  lemon: '#FFD85A',
  grape: '#6654E8',
  bubblegum: '#F65F9C',
  mint: '#58D5A2',
  cream: '#FFFDF5',
  ink: '#26305B',
  softInk: '#525C82',
  white: '#FFFFFF',
  danger: '#B52D57',
};

const PLAYER_KEY = '@agent-ninja/player';
const SCORES_KEY = '@agent-ninja/high-scores';

type Screen = 'home' | 'name' | 'help' | 'game' | 'level-up' | 'results' | 'scores';
type ScoreEntry = { id: string; name: string; score: number; streak: number };

function PageHead() {
  return (
    <Head>
      <title>Agent Ninja</title>
      <meta name="description" content="Train an AI agent to choose tools, plan steps, and act safely." />
    </Head>
  );
}

function Shell({ background, children }: { background: string; children: ReactNode }) {
  return (
    <>
      <PageHead />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: background }]}>{children}</SafeAreaView>
    </>
  );
}

function PipCharacter({ small = false }: { small?: boolean }) {
  return (
    <View
      accessible
      accessibilityLabel="Pip, a purple ninja robot"
      accessibilityRole="image"
      style={[styles.pip, small && styles.pipSmall]}>
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
        {!small && (
          <View style={styles.pipCheeks}>
            <View style={styles.pipCheek} />
            <View style={styles.pipCheek} />
          </View>
        )}
      </View>
      {!small && (
        <>
          <View style={styles.pipBody}>
            <View style={styles.pipHeart}><Text style={styles.pipHeartText}>★</Text></View>
          </View>
          <View style={[styles.pipArm, styles.pipArmLeft]} />
          <View style={[styles.pipArm, styles.pipArmRight]} />
        </>
      )}
    </View>
  );
}

function Belt({ color, dark = false }: { color: string; dark?: boolean }) {
  return (
    <View style={[styles.belt, { backgroundColor: color }, dark && styles.darkBelt]}>
      <View style={styles.beltKnot} />
    </View>
  );
}

export default function HomeScreen() {
  const [screen, setScreen] = useState<Screen>('home');
  const [name, setName] = useState('');
  const [savedName, setSavedName] = useState('');
  const [nameError, setNameError] = useState(false);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [levelIndex, setLevelIndex] = useState(0);
  const [missionIndex, setMissionIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<ChoiceId | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const level = LEVELS[levelIndex];
  const mission = level.missions[missionIndex];
  const correct = selectedChoice === mission.answer;
  const totalMissions = useMemo(
    () => LEVELS.reduce((sum, item) => sum + item.missions.length, 0),
    [],
  );
  const completedMissions = LEVELS.slice(0, levelIndex).reduce(
    (sum, item) => sum + item.missions.length,
    0,
  ) + missionIndex + (selectedChoice ? 1 : 0);

  useEffect(() => {
    async function loadPlayer() {
      try {
        const [savedName, savedScores] = await Promise.all([
          AsyncStorage.getItem(PLAYER_KEY),
          AsyncStorage.getItem(SCORES_KEY),
        ]);
        if (savedName) {
          setName(savedName);
          setSavedName(savedName);
        }
        if (savedScores) setScores(JSON.parse(savedScores) as ScoreEntry[]);
      } catch {
        // Play remains available if device storage fails.
      }
    }
    void loadPlayer();
  }, []);

  async function startGame(playerName = name) {
    const cleanName = playerName.trim().slice(0, 18);
    if (!cleanName) {
      setNameError(true);
      return;
    }
    setName(cleanName);
    setSavedName(cleanName);
    setNameError(false);
    setLevelIndex(0);
    setMissionIndex(0);
    setSelectedChoice(null);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setScreen('game');
    await AsyncStorage.setItem(PLAYER_KEY, cleanName).catch(() => undefined);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  function openGame() {
    if (savedName) {
      setName(savedName);
      void startGame(savedName);
      return;
    }
    setName('');
    setNameError(false);
    setScreen('name');
  }

  function chooseAnswer(choiceId: ChoiceId) {
    if (selectedChoice) return;
    const isCorrect = choiceId === mission.answer;
    setSelectedChoice(choiceId);
    if (isCorrect) {
      const nextStreak = streak + 1;
      setScore((current) => current + level.number * 100 + streak * 20);
      setStreak(nextStreak);
      setBestStreak((current) => Math.max(current, nextStreak));
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setStreak(0);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  async function saveScore() {
    const entry: ScoreEntry = {
      id: `${Date.now()}-${Math.random()}`,
      name: name.trim() || 'Ninja',
      score,
      streak: bestStreak,
    };
    const nextScores = [...scores, entry].sort((a, b) => b.score - a.score).slice(0, 8);
    setScores(nextScores);
    await AsyncStorage.setItem(SCORES_KEY, JSON.stringify(nextScores)).catch(() => undefined);
  }

  function continueGame() {
    const lastMission = missionIndex === level.missions.length - 1;
    const lastLevel = levelIndex === LEVELS.length - 1;
    if (!lastMission) {
      setMissionIndex((current) => current + 1);
      setSelectedChoice(null);
      return;
    }
    if (!lastLevel) {
      setScreen('level-up');
      return;
    }
    void saveScore();
    setScreen('results');
  }

  function beginNextLevel() {
    setLevelIndex((current) => current + 1);
    setMissionIndex(0);
    setSelectedChoice(null);
    setScreen('game');
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }

  function goHome() {
    setScreen('home');
    setSelectedChoice(null);
  }

  if (screen === 'scores') {
    return (
      <Shell background={COLORS.cream}>
        <ScrollView contentContainerStyle={styles.scoresPage}>
          <View style={styles.topBar}>
            <Pressable accessibilityRole="button" onPress={goHome} style={styles.backButton}>
              <Text style={styles.backText}>‹ Home</Text>
            </Pressable>
            <Text style={styles.scoresEyebrow}>SAVED ON THIS DEVICE</Text>
          </View>
          <Text style={styles.scoresTitle}>High Scores</Text>
          <Text style={styles.scoresCopy}>Your eight best completed runs.</Text>
          <View style={styles.scoresCard}>
            {scores.length === 0 ? (
              <View style={styles.emptyScores}>
                <Text style={styles.emptyEmoji}>🥷</Text>
                <Text style={styles.emptyTitle}>No scores yet</Text>
                <Text style={styles.emptyCopy}>Finish all three levels to save your first score.</Text>
              </View>
            ) : scores.map((entry, index) => (
              <View key={entry.id} style={[styles.scoreRow, index < scores.length - 1 && styles.scoreRowBorder]}>
                <View style={[styles.rankBadge, index === 0 && styles.firstRank]}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <View style={styles.playerDetails}>
                  <Text style={styles.playerName}>{entry.name}</Text>
                  <Text style={styles.playerStreak}>{entry.streak} best streak</Text>
                </View>
                <Text style={styles.playerScore}>{entry.score}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </Shell>
    );
  }

  if (screen === 'help') {
    return (
      <Shell background={COLORS.cream}>
        <ScrollView contentContainerStyle={styles.helpPage} showsVerticalScrollIndicator={false}>
          <View style={styles.topBar}>
            <Pressable accessibilityRole="button" onPress={goHome} style={styles.backButton}>
              <Text style={styles.backText}>‹ Home</Text>
            </Pressable>
            <Text style={styles.scoresEyebrow}>HOW TO PLAY</Text>
          </View>
          <Text style={styles.helpTitle}>Train Pip to handle jobs.</Text>
          <Text style={styles.helpCopy}>Pip is an AI agent. A person gives Pip a job, then Pip decides what to do next. You make that decision.</Text>
          <View style={styles.howCard}>
            <View style={styles.howRow}><Text style={styles.howNumber}>1</Text><Text style={styles.howText}>Read the job and clue.</Text></View>
            <View style={styles.howRow}><Text style={styles.howNumber}>2</Text><Text style={styles.howText}>Choose Pip’s next move.</Text></View>
            <View style={styles.howRow}><Text style={styles.howNumber}>3</Text><Text style={styles.howText}>Read why that move works.</Text></View>
          </View>
          <Text style={styles.pathTitle}>Three levels</Text>
          {LEVELS.map((item) => (
            <View key={item.number} style={styles.helpLevelCard}>
              <Belt color={item.color} dark={item.number === 3} />
              <View style={styles.levelWords}>
                <Text style={styles.levelNumber}>LEVEL {item.number} · {item.belt.toUpperCase()}</Text>
                <Text style={styles.levelTitle}>{item.title}</Text>
                <Text style={styles.levelTeaches}>{item.teaches}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </Shell>
    );
  }

  if (screen === 'name') {
    return (
      <Shell background={COLORS.sky}>
        <View style={styles.namePage}>
          <Pressable accessibilityRole="button" onPress={goHome} style={styles.nameBackButton}>
            <Text style={styles.backText}>‹ Home</Text>
          </Pressable>
          <View style={styles.namePip}><PipCharacter /></View>
          <Text style={styles.nameTitle}>Choose your ninja name</Text>
          <Text style={styles.nameCopy}>This name and your high scores stay on this device.</Text>
          <TextInput
            accessibilityLabel="Your ninja name"
            autoCapitalize="words"
            autoFocus
            maxLength={18}
            onChangeText={(value) => { setName(value); setNameError(false); }}
            onSubmitEditing={() => void startGame()}
            placeholder="Type a name"
            placeholderTextColor="#858AA8"
            returnKeyType="done"
            style={[styles.nameInput, styles.namePageInput, nameError && styles.nameInputError]}
            value={name}
          />
          {nameError && <Text accessibilityRole="alert" style={styles.nameError}>Enter a name to continue.</Text>}
          <Pressable accessibilityRole="button" onPress={() => void startGame()} style={({ pressed }) => [styles.startButton, pressed && styles.buttonPressed]}>
            <Text style={styles.startButtonText}>Start Game</Text><Text style={styles.startButtonArrow}>→</Text>
          </Pressable>
        </View>
      </Shell>
    );
  }

  if (screen === 'home') {
    return (
      <Shell background={COLORS.sky}>
        <View style={styles.homeGamePage}>
          <View style={[styles.cloud, styles.cloudOne]} />
          <View style={[styles.cloud, styles.cloudTwo]} />
          <View style={styles.homeTop}>
            <View style={styles.logoPill}><Text style={styles.logoText}>AGENT NINJA</Text></View>
            <View style={styles.homeActions}>
              <Pressable accessibilityRole="button" onPress={() => setScreen('help')} style={styles.helpButton}><Text style={styles.helpButtonText}>? Help</Text></Pressable>
              <Pressable accessibilityLabel="High Scores" accessibilityRole="button" onPress={() => setScreen('scores')} style={styles.trophyButton}><Text style={styles.trophyButtonText}>🏆</Text></Pressable>
            </View>
          </View>
          <View style={styles.homeHero}>
            <View style={styles.homeHeroBubble}><PipCharacter /></View>
            <Text style={styles.homeTitle}>Train Pip. Think like an AI agent.</Text>
            <Text style={styles.homeCopy}>Choose Pip’s next move: use a tool, ask a question, or check the work.</Text>
          </View>
          <View style={styles.homeBottom}>
            {savedName ? (
              <View style={styles.playerConfirm}>
                <Text style={styles.playerConfirmLabel}>PLAYING AS</Text>
                <Text style={styles.playerConfirmName}>🥷 {savedName}</Text>
                <Pressable accessibilityRole="button" onPress={() => { setName(''); setNameError(false); setScreen('name'); }}>
                  <Text style={styles.changePlayerText}>Change</Text>
                </Pressable>
              </View>
            ) : <Text style={styles.newPlayerNote}>Your name is saved after you start.</Text>}
            <Pressable accessibilityRole="button" onPress={openGame} style={({ pressed }) => [styles.startButton, styles.homeStartButton, pressed && styles.buttonPressed]}>
              <Text style={styles.startButtonText}>Start Game</Text><Text style={styles.startButtonArrow}>→</Text>
            </Pressable>
            <Text style={styles.roundNote}>{totalMissions} missions · 3 levels · easy to hard</Text>
          </View>
        </View>
      </Shell>
    );
  }

  if (screen === 'level-up') {
    const nextLevel = LEVELS[levelIndex + 1];
    return (
      <Shell background={COLORS.sky}>
        <View style={styles.levelUpPage}>
          <Text style={styles.levelComplete}>LEVEL {level.number} COMPLETE</Text>
          <View style={styles.resultPipWrap}><PipCharacter /></View>
          <Text style={styles.levelUpTitle}>{nextLevel.belt} unlocked</Text>
          <Belt color={nextLevel.color} dark={nextLevel.number === 3} />
          <Text style={styles.levelUpCopy}>Next: {nextLevel.teaches}</Text>
          <Pressable accessibilityRole="button" onPress={beginNextLevel} style={({ pressed }) => [styles.startButton, pressed && styles.buttonPressed]}>
            <Text style={styles.startButtonText}>Start level {nextLevel.number}</Text><Text style={styles.startButtonArrow}>→</Text>
          </Pressable>
        </View>
      </Shell>
    );
  }

  if (screen === 'results') {
    return (
      <Shell background={COLORS.sky}>
        <ScrollView contentContainerStyle={styles.resultPage}>
          <Text style={styles.levelComplete}>BLACK BELT COMPLETE</Text>
          <View style={styles.resultPipWrap}><PipCharacter /></View>
          <Text style={styles.resultTitle}>{name}, you trained Pip.</Text>
          <Text style={styles.resultCopy}>You picked tools, asked for missing details, checked results, and paused before risky actions.</Text>
          <View style={styles.scoreCard}>
            <View style={styles.scoreItem}><Text style={styles.scoreBig}>{score}</Text><Text style={styles.scoreCaption}>points</Text></View>
            <View style={styles.scoreDivider} />
            <View style={styles.scoreItem}><Text style={styles.scoreBig}>{bestStreak}</Text><Text style={styles.scoreCaption}>best streak</Text></View>
          </View>
          <Pressable accessibilityRole="button" onPress={() => setScreen('scores')} style={({ pressed }) => [styles.startButton, pressed && styles.buttonPressed]}>
            <Text style={styles.startButtonText}>View high scores</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={goHome} style={styles.textButton}><Text style={styles.textButtonText}>Back to dojo</Text></Pressable>
        </ScrollView>
      </Shell>
    );
  }

  return (
    <Shell background={COLORS.cream}>
      <ScrollView contentContainerStyle={styles.gamePage} showsVerticalScrollIndicator={false}>
        <View style={styles.gameHeader}>
          <View><Text style={styles.gameBrand}>Agent Ninja</Text><Text style={styles.levelText}>{level.belt} · Level {level.number} of {LEVELS.length}</Text></View>
          <View style={styles.pointsPill}><Text style={styles.pointsStar}>★</Text><Text style={styles.pointsText}>{score}</Text></View>
        </View>
        <View accessibilityLabel={`${completedMissions} of ${totalMissions} missions complete`} style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(completedMissions / totalMissions) * 100}%` }]} />
        </View>
        <View style={styles.missionLabelRow}><Text style={styles.missionLabel}>MISSION {missionIndex + 1} OF {level.missions.length}</Text><Text style={styles.difficultyLabel}>{level.title}</Text></View>
        <View style={styles.missionBubble}>
          <View style={styles.miniPipWrap}><PipCharacter small /></View>
          <View style={styles.speechCopy}><Text style={styles.pipSays}>THE JOB</Text><Text style={styles.missionText}>{mission.job}</Text><Text style={styles.missionHint}>{mission.clue}</Text></View>
        </View>
        <Text style={styles.chooseTitle}>{mission.prompt}</Text>
        <View style={styles.toolList}>
          {mission.choices.map((choiceId) => {
            const choice = CHOICES[choiceId];
            const isSelected = selectedChoice === choiceId;
            const isAnswer = selectedChoice !== null && choiceId === mission.answer;
            const isWrong = isSelected && !isAnswer;
            return (
              <Pressable
                accessibilityLabel={`${choice.label}. ${choice.detail}`}
                accessibilityRole="button"
                disabled={selectedChoice !== null}
                key={choiceId}
                onPress={() => chooseAnswer(choiceId)}
                style={({ pressed }) => [styles.toolCard, { backgroundColor: choice.color }, pressed && styles.toolPressed, isAnswer && styles.toolCorrect, isWrong && styles.toolWrong]}>
                <View style={styles.iconBubble}><Text style={styles.toolIcon}>{choice.icon}</Text></View>
                <View style={styles.toolCopy}><Text style={styles.toolLabel}>{choice.label}</Text><Text style={styles.toolDetail}>{choice.detail}</Text></View>
                <View style={[styles.choiceMark, isAnswer && styles.choiceMarkCorrect, isWrong && styles.choiceMarkWrong]}>
                  <Text style={styles.choiceMarkText}>{isAnswer ? '✓' : isWrong ? '×' : '›'}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
        {selectedChoice && (
          <View style={[styles.feedbackCard, correct ? styles.feedbackCorrect : styles.feedbackWrong]}>
            <View style={styles.feedbackTop}>
              <Text style={styles.feedbackEmoji}>{correct ? '🥷' : '↻'}</Text>
              <View style={styles.feedbackWords}>
                <Text style={styles.feedbackTitle}>{correct ? 'Correct move' : `Use ${CHOICES[mission.answer].label.toLowerCase()}`}</Text>
                <Text style={styles.feedbackCopy}>{mission.lesson}</Text>
              </View>
            </View>
            <Pressable accessibilityRole="button" onPress={continueGame} style={({ pressed }) => [styles.nextButton, pressed && styles.buttonPressed]}>
              <Text style={styles.nextButtonText}>{missionIndex === level.missions.length - 1 ? (levelIndex === LEVELS.length - 1 ? 'Finish training' : 'Finish level') : 'Next mission'}</Text>
            </Pressable>
          </View>
        )}
        <Text style={styles.streakText}>🔥 {streak} correct in a row</Text>
      </ScrollView>
    </Shell>
  );
}

const shadow = { boxShadow: '0 5px 0 rgba(38, 48, 91, 0.14)' };

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  homePage: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 32, overflow: 'hidden' },
  homeGamePage: { flex: 1, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 18, overflow: 'hidden' },
  cloud: { position: 'absolute', width: 130, height: 44, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.55)' },
  cloudOne: { left: -48, top: 120, transform: [{ rotate: '-8deg' }] },
  cloudTwo: { right: -58, top: 310, transform: [{ rotate: '12deg' }] },
  homeTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  homeActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoPill: { backgroundColor: COLORS.white, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 2, borderColor: COLORS.ink },
  logoText: { color: COLORS.ink, fontFamily: Fonts.rounded, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  scoresButton: { backgroundColor: COLORS.lemon, borderRadius: 18, borderWidth: 2, borderColor: COLORS.ink, paddingHorizontal: 12, paddingVertical: 8 },
  scoresButtonText: { color: COLORS.ink, fontFamily: Fonts.rounded, fontWeight: '900', fontSize: 12 },
  helpButton: { minHeight: 38, justifyContent: 'center', backgroundColor: COLORS.white, borderRadius: 18, borderWidth: 2, borderColor: COLORS.ink, paddingHorizontal: 12 },
  helpButtonText: { color: COLORS.ink, fontFamily: Fonts.rounded, fontSize: 12, fontWeight: '900' },
  trophyButton: { width: 40, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.lemon, borderWidth: 2, borderColor: COLORS.ink },
  trophyButtonText: { fontSize: 17 },
  homeHero: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 0 },
  homeHeroBubble: { width: 196, height: 196, borderRadius: 98, backgroundColor: COLORS.lemon, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: COLORS.ink, ...shadow },
  homeTitle: { color: COLORS.ink, fontFamily: Fonts.rounded, fontSize: 30, lineHeight: 33, fontWeight: '900', letterSpacing: -0.8, textAlign: 'center', maxWidth: 350, marginTop: 18 },
  homeCopy: { color: COLORS.softInk, fontFamily: Fonts.rounded, fontSize: 14, lineHeight: 19, fontWeight: '600', textAlign: 'center', maxWidth: 340, marginTop: 7 },
  homeBottom: { alignItems: 'center' },
  homeStartButton: { marginTop: 10 },
  playerConfirm: { width: '100%', minHeight: 49, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.72)', borderRadius: 16, borderWidth: 2, borderColor: COLORS.ink, paddingHorizontal: 12 },
  playerConfirmLabel: { color: COLORS.grape, fontFamily: Fonts.rounded, fontSize: 9, fontWeight: '900', letterSpacing: 0.7, marginRight: 9 },
  playerConfirmName: { flex: 1, color: COLORS.ink, fontFamily: Fonts.rounded, fontSize: 15, fontWeight: '900' },
  changePlayerText: { color: COLORS.grape, fontFamily: Fonts.rounded, fontSize: 12, fontWeight: '900', textDecorationLine: 'underline' },
  newPlayerNote: { color: COLORS.softInk, fontFamily: Fonts.rounded, fontSize: 12, fontWeight: '700' },
  heroRow: { minHeight: 205, flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  heroCopy: { flex: 1, zIndex: 2 },
  startTitle: { color: COLORS.ink, fontFamily: Fonts.rounded, fontSize: 34, lineHeight: 37, fontWeight: '900', letterSpacing: -1.1 },
  startCopy: { color: COLORS.softInk, fontFamily: Fonts.rounded, fontSize: 15, lineHeight: 21, fontWeight: '600', marginTop: 10 },
  heroBubble: { width: 165, height: 165, borderRadius: 83, backgroundColor: COLORS.lemon, alignItems: 'center', justifyContent: 'center', marginLeft: -15, borderWidth: 3, borderColor: COLORS.ink, transform: [{ scale: 0.82 }], ...shadow },
  howCard: { backgroundColor: COLORS.white, borderWidth: 3, borderColor: COLORS.ink, borderRadius: 22, padding: 15, ...shadow },
  howTitle: { color: COLORS.grape, fontFamily: Fonts.rounded, fontSize: 15, fontWeight: '900', marginBottom: 8 },
  howRow: { flexDirection: 'row', alignItems: 'center', marginTop: 7 },
  howNumber: { width: 27, height: 27, borderRadius: 14, backgroundColor: COLORS.grape, color: COLORS.white, textAlign: 'center', lineHeight: 27, fontFamily: Fonts.rounded, fontWeight: '900', marginRight: 10 },
  howText: { flex: 1, color: COLORS.ink, fontFamily: Fonts.rounded, fontSize: 14, fontWeight: '700' },
  pathTitle: { color: COLORS.ink, fontFamily: Fonts.rounded, fontSize: 20, fontWeight: '900', marginTop: 24, marginBottom: 10 },
  helpPage: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 28 },
  helpTitle: { color: COLORS.ink, fontFamily: Fonts.rounded, fontSize: 34, lineHeight: 38, fontWeight: '900', letterSpacing: -1, marginTop: 24 },
  helpCopy: { color: COLORS.softInk, fontFamily: Fonts.rounded, fontSize: 15, lineHeight: 21, fontWeight: '600', marginTop: 8, marginBottom: 18 },
  helpLevelCard: { minHeight: 80, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 18, borderWidth: 2, borderColor: COLORS.ink, padding: 11, marginBottom: 10 },
  levelPath: { gap: 0 },
  levelPathItem: { flexDirection: 'row' },
  levelConnector: { width: 18, alignItems: 'center' },
  connectorLine: { width: 3, flex: 1, backgroundColor: COLORS.grape },
  levelCard: { flex: 1, minHeight: 80, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.72)', borderRadius: 18, borderWidth: 2, borderColor: COLORS.ink, padding: 11, marginBottom: 10 },
  belt: { width: 49, height: 15, borderRadius: 3, borderWidth: 2, borderColor: COLORS.ink, marginRight: 12, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-5deg' }] },
  darkBelt: { borderColor: COLORS.ink },
  beltKnot: { width: 13, height: 20, backgroundColor: COLORS.bubblegum, borderWidth: 2, borderColor: COLORS.ink, transform: [{ rotate: '8deg' }] },
  levelWords: { flex: 1 },
  levelNumber: { color: COLORS.grape, fontFamily: Fonts.rounded, fontSize: 9, fontWeight: '900', letterSpacing: 0.6 },
  levelTitle: { color: COLORS.ink, fontFamily: Fonts.rounded, fontSize: 16, fontWeight: '900', marginTop: 1 },
  levelTeaches: { color: COLORS.softInk, fontFamily: Fonts.rounded, fontSize: 11, lineHeight: 15, fontWeight: '600', marginTop: 2 },
  nameLabel: { color: COLORS.ink, fontFamily: Fonts.rounded, fontSize: 14, fontWeight: '900', marginTop: 14, marginBottom: 7 },
  namePage: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  nameBackButton: { position: 'absolute', top: 12, left: 20, paddingVertical: 8, paddingRight: 14 },
  namePip: { width: 155, height: 155, borderRadius: 78, backgroundColor: COLORS.lemon, borderWidth: 3, borderColor: COLORS.ink, alignItems: 'center', justifyContent: 'center', transform: [{ scale: 0.82 }], ...shadow },
  nameTitle: { color: COLORS.ink, fontFamily: Fonts.rounded, fontSize: 29, lineHeight: 33, fontWeight: '900', letterSpacing: -0.7, textAlign: 'center', marginTop: 12 },
  nameCopy: { color: COLORS.softInk, fontFamily: Fonts.rounded, fontSize: 14, lineHeight: 19, fontWeight: '600', textAlign: 'center', maxWidth: 320, marginTop: 7 },
  namePageInput: { width: '100%', marginTop: 19 },
  nameInput: { minHeight: 54, backgroundColor: COLORS.white, borderWidth: 3, borderColor: COLORS.ink, borderRadius: 18, paddingHorizontal: 16, color: COLORS.ink, fontFamily: Fonts.rounded, fontSize: 17, fontWeight: '800' },
  nameInputError: { borderColor: COLORS.danger },
  nameError: { color: COLORS.danger, fontFamily: Fonts.rounded, fontSize: 12, fontWeight: '800', marginTop: 6 },
  startButton: { width: '100%', minHeight: 60, borderRadius: 20, backgroundColor: COLORS.bubblegum, borderWidth: 3, borderColor: COLORS.ink, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, ...shadow },
  startButtonText: { color: COLORS.ink, fontFamily: Fonts.rounded, fontSize: 18, fontWeight: '900' },
  startButtonArrow: { color: COLORS.ink, fontSize: 25, fontWeight: '900', marginLeft: 10 },
  buttonPressed: { transform: [{ translateY: 3 }] },
  roundNote: { color: COLORS.softInk, fontFamily: Fonts.rounded, fontSize: 11, fontWeight: '700', textAlign: 'center', marginTop: 11 },
  pip: { width: 164, height: 174, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 20 },
  pipSmall: { width: 68, height: 68, paddingTop: 10 },
  antennaStem: { width: 5, height: 24, borderRadius: 3, backgroundColor: COLORS.ink, position: 'absolute', top: 2 },
  antennaStemSmall: { width: 3, height: 12, top: 0 },
  antennaDot: { width: 17, height: 17, borderRadius: 9, backgroundColor: COLORS.bubblegum, borderWidth: 3, borderColor: COLORS.ink, position: 'absolute', top: -6 },
  antennaDotSmall: { width: 9, height: 9, borderWidth: 2, top: -3 },
  pipEar: { position: 'absolute', top: 49, width: 19, height: 39, borderRadius: 10, backgroundColor: COLORS.bubblegum, borderWidth: 3, borderColor: COLORS.ink },
  pipEarLeft: { left: 2 }, pipEarRight: { right: 2 },
  pipHead: { width: 140, height: 91, borderRadius: 34, backgroundColor: COLORS.white, borderWidth: 4, borderColor: COLORS.ink, alignItems: 'center', paddingTop: 25, zIndex: 2 },
  pipHeadSmall: { width: 58, height: 45, borderRadius: 17, borderWidth: 3, paddingTop: 12 },
  ninjaBand: { position: 'absolute', left: 0, right: 0, top: 10, height: 15, backgroundColor: COLORS.grape, alignItems: 'center', justifyContent: 'center' },
  ninjaBandSmall: { top: 4, height: 8 },
  ninjaBadge: { width: 17, height: 17, borderRadius: 9, backgroundColor: COLORS.lemon, borderWidth: 2, borderColor: COLORS.ink },
  ninjaBadgeSmall: { width: 9, height: 9, borderWidth: 1 },
  pipEyes: { flexDirection: 'row', gap: 31 },
  pipEye: { width: 13, height: 19, borderRadius: 8, backgroundColor: COLORS.ink },
  pipEyeSmall: { width: 6, height: 9 },
  pipSmile: { width: 30, height: 13, borderBottomWidth: 4, borderBottomColor: COLORS.ink, borderRadius: 15, marginTop: 4 },
  pipSmileSmall: { width: 15, height: 7, borderBottomWidth: 2, marginTop: 1 },
  pipCheeks: { position: 'absolute', left: 15, right: 15, top: 57, flexDirection: 'row', justifyContent: 'space-between' },
  pipCheek: { width: 13, height: 7, borderRadius: 7, backgroundColor: '#FF9FC4' },
  pipBody: { width: 88, height: 65, borderRadius: 24, backgroundColor: COLORS.grape, borderWidth: 4, borderColor: COLORS.ink, marginTop: -3, alignItems: 'center', paddingTop: 12 },
  pipHeart: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.lemon, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: COLORS.ink },
  pipHeartText: { color: COLORS.bubblegum, fontSize: 18, fontWeight: '900' },
  pipArm: { position: 'absolute', top: 115, width: 44, height: 16, borderRadius: 10, backgroundColor: COLORS.grape, borderWidth: 3, borderColor: COLORS.ink },
  pipArmLeft: { left: 11, transform: [{ rotate: '24deg' }] },
  pipArmRight: { right: 11, transform: [{ rotate: '-24deg' }] },
  gamePage: { flexGrow: 1, paddingHorizontal: 18, paddingTop: 12, paddingBottom: 30 },
  gameHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  gameBrand: { color: COLORS.ink, fontFamily: Fonts.rounded, fontSize: 22, fontWeight: '900' },
  levelText: { color: COLORS.softInk, fontFamily: Fonts.rounded, fontSize: 12, fontWeight: '700', marginTop: 2 },
  pointsPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.lemon, borderWidth: 2, borderColor: COLORS.ink, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  pointsStar: { color: COLORS.bubblegum, fontSize: 17 },
  pointsText: { color: COLORS.ink, fontFamily: Fonts.rounded, fontSize: 15, fontWeight: '900', marginLeft: 5 },
  progressTrack: { height: 9, borderRadius: 5, backgroundColor: '#DDD9EE', marginTop: 14, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.grape, borderRadius: 5 },
  missionLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 17 },
  missionLabel: { color: COLORS.grape, fontFamily: Fonts.rounded, fontSize: 11, fontWeight: '900', letterSpacing: 0.7 },
  difficultyLabel: { color: COLORS.softInk, fontFamily: Fonts.rounded, fontSize: 11, fontWeight: '800' },
  missionBubble: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.lemon, borderRadius: 26, borderWidth: 3, borderColor: COLORS.ink, padding: 15, marginTop: 8, ...shadow },
  miniPipWrap: { width: 74, height: 74, borderRadius: 37, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', marginRight: 12, overflow: 'hidden' },
  speechCopy: { flex: 1 },
  pipSays: { color: COLORS.grape, fontFamily: Fonts.rounded, fontSize: 10, fontWeight: '900', letterSpacing: 0.6 },
  missionText: { color: COLORS.ink, fontFamily: Fonts.rounded, fontSize: 19, lineHeight: 23, fontWeight: '900', marginTop: 3 },
  missionHint: { color: COLORS.softInk, fontFamily: Fonts.rounded, fontSize: 12, lineHeight: 16, fontWeight: '600', marginTop: 5 },
  chooseTitle: { color: COLORS.ink, fontFamily: Fonts.rounded, fontSize: 18, fontWeight: '900', marginTop: 21, marginBottom: 10 },
  toolList: { gap: 10 },
  toolCard: { minHeight: 72, borderRadius: 21, borderWidth: 3, borderColor: COLORS.ink, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', ...shadow },
  toolPressed: { transform: [{ translateY: 3 }] },
  toolCorrect: { borderColor: '#187A57', borderWidth: 4 },
  toolWrong: { borderColor: COLORS.danger, borderWidth: 4 },
  iconBubble: { width: 49, height: 49, borderRadius: 25, backgroundColor: COLORS.white, borderWidth: 2, borderColor: COLORS.ink, alignItems: 'center', justifyContent: 'center' },
  toolIcon: { fontSize: 26 },
  toolCopy: { flex: 1, marginLeft: 11 },
  toolLabel: { color: COLORS.ink, fontFamily: Fonts.rounded, fontSize: 16, fontWeight: '900' },
  toolDetail: { color: COLORS.softInk, fontFamily: Fonts.rounded, fontSize: 11, fontWeight: '600', marginTop: 2 },
  choiceMark: { width: 31, height: 31, borderRadius: 16, backgroundColor: COLORS.white, borderWidth: 2, borderColor: COLORS.ink, alignItems: 'center', justifyContent: 'center' },
  choiceMarkCorrect: { backgroundColor: COLORS.mint },
  choiceMarkWrong: { backgroundColor: '#FF9CB8' },
  choiceMarkText: { color: COLORS.ink, fontSize: 22, lineHeight: 24, fontWeight: '900' },
  feedbackCard: { borderRadius: 21, borderWidth: 3, borderColor: COLORS.ink, padding: 12, marginTop: 15 },
  feedbackCorrect: { backgroundColor: '#D7F8E9' },
  feedbackWrong: { backgroundColor: '#FFE0EB' },
  feedbackTop: { flexDirection: 'row', alignItems: 'center' },
  feedbackEmoji: { fontSize: 26 },
  feedbackWords: { flex: 1, marginLeft: 9 },
  feedbackTitle: { color: COLORS.ink, fontFamily: Fonts.rounded, fontSize: 15, fontWeight: '900' },
  feedbackCopy: { color: COLORS.softInk, fontFamily: Fonts.rounded, fontSize: 12, lineHeight: 16, fontWeight: '600', marginTop: 2 },
  nextButton: { backgroundColor: COLORS.grape, minHeight: 44, borderRadius: 15, borderWidth: 2, borderColor: COLORS.ink, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  nextButtonText: { color: COLORS.white, fontFamily: Fonts.rounded, fontSize: 13, fontWeight: '900' },
  streakText: { color: COLORS.softInk, fontFamily: Fonts.rounded, fontSize: 12, fontWeight: '800', textAlign: 'center', marginTop: 15 },
  levelUpPage: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  levelComplete: { color: COLORS.grape, fontFamily: Fonts.rounded, fontSize: 12, fontWeight: '900', letterSpacing: 1.2, marginBottom: 18 },
  resultPipWrap: { width: 210, height: 210, borderRadius: 105, backgroundColor: COLORS.lemon, borderWidth: 3, borderColor: COLORS.ink, alignItems: 'center', justifyContent: 'center', ...shadow },
  levelUpTitle: { color: COLORS.ink, fontFamily: Fonts.rounded, fontSize: 34, lineHeight: 39, fontWeight: '900', letterSpacing: -1, textAlign: 'center', marginTop: 22, marginBottom: 17 },
  levelUpCopy: { color: COLORS.softInk, fontFamily: Fonts.rounded, fontSize: 16, lineHeight: 22, fontWeight: '700', textAlign: 'center', maxWidth: 330, marginTop: 18 },
  resultPage: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 24 },
  resultTitle: { color: COLORS.ink, fontFamily: Fonts.rounded, fontSize: 32, lineHeight: 37, fontWeight: '900', letterSpacing: -1, textAlign: 'center', marginTop: 22 },
  resultCopy: { color: COLORS.softInk, fontFamily: Fonts.rounded, fontSize: 15, lineHeight: 21, fontWeight: '600', textAlign: 'center', maxWidth: 350, marginTop: 8 },
  scoreCard: { width: '100%', maxWidth: 340, flexDirection: 'row', backgroundColor: COLORS.white, borderWidth: 3, borderColor: COLORS.ink, borderRadius: 22, paddingVertical: 14, marginTop: 18, ...shadow },
  scoreItem: { flex: 1, alignItems: 'center' },
  scoreDivider: { width: 2, backgroundColor: '#D9D5E9' },
  scoreBig: { color: COLORS.grape, fontFamily: Fonts.rounded, fontSize: 25, fontWeight: '900' },
  scoreCaption: { color: COLORS.softInk, fontFamily: Fonts.rounded, fontSize: 11, fontWeight: '700' },
  textButton: { paddingVertical: 14, paddingHorizontal: 20 },
  textButtonText: { color: COLORS.grape, fontFamily: Fonts.rounded, fontSize: 14, fontWeight: '900', textDecorationLine: 'underline' },
  scoresPage: { flexGrow: 1, paddingHorizontal: 20, paddingVertical: 14 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { paddingVertical: 8, paddingRight: 14 },
  backText: { color: COLORS.grape, fontFamily: Fonts.rounded, fontSize: 16, fontWeight: '900' },
  scoresEyebrow: { color: COLORS.softInk, fontFamily: Fonts.rounded, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  scoresTitle: { color: COLORS.ink, fontFamily: Fonts.rounded, fontSize: 38, fontWeight: '900', letterSpacing: -1.2, marginTop: 26 },
  scoresCopy: { color: COLORS.softInk, fontFamily: Fonts.rounded, fontSize: 14, fontWeight: '600', marginTop: 5 },
  scoresCard: { backgroundColor: COLORS.white, borderWidth: 3, borderColor: COLORS.ink, borderRadius: 23, marginTop: 20, overflow: 'hidden', ...shadow },
  scoreRow: { flexDirection: 'row', alignItems: 'center', minHeight: 72, paddingHorizontal: 14 },
  scoreRowBorder: { borderBottomWidth: 2, borderBottomColor: '#E2DEEF' },
  rankBadge: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#EAE6FF', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.ink },
  firstRank: { backgroundColor: COLORS.lemon },
  rankText: { color: COLORS.ink, fontFamily: Fonts.rounded, fontSize: 14, fontWeight: '900' },
  playerDetails: { flex: 1, marginLeft: 12 },
  playerName: { color: COLORS.ink, fontFamily: Fonts.rounded, fontSize: 16, fontWeight: '900' },
  playerStreak: { color: COLORS.softInk, fontFamily: Fonts.rounded, fontSize: 11, fontWeight: '600', marginTop: 2 },
  playerScore: { color: COLORS.grape, fontFamily: Fonts.rounded, fontSize: 18, fontWeight: '900' },
  emptyScores: { alignItems: 'center', paddingHorizontal: 25, paddingVertical: 38 },
  emptyEmoji: { fontSize: 39 },
  emptyTitle: { color: COLORS.ink, fontFamily: Fonts.rounded, fontSize: 19, fontWeight: '900', marginTop: 10 },
  emptyCopy: { color: COLORS.softInk, fontFamily: Fonts.rounded, fontSize: 13, lineHeight: 18, fontWeight: '600', textAlign: 'center', marginTop: 5 },
});
