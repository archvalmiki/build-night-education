export const CHOICES = {
  search: { id: 'search', label: 'Search the web', detail: 'Find current information', icon: '🌎', color: '#C9EEFF' },
  memory: { id: 'memory', label: 'Check memory', detail: 'Use something saved earlier', icon: '🧠', color: '#EAE6FF' },
  calculator: { id: 'calculator', label: 'Use calculator', detail: 'Get an exact number', icon: '🧮', color: '#FFE4CF' },
  ask: { id: 'ask', label: 'Ask the person', detail: 'Get missing details', icon: '💬', color: '#D7F8E9' },
  verify: { id: 'verify', label: 'Check the result', detail: 'Confirm it is correct', icon: '🔎', color: '#FFF0B8' },
  permission: { id: 'permission', label: 'Ask permission', detail: 'Pause before taking action', icon: '✋', color: '#FFDCE9' },
} as const;

export type ChoiceId = keyof typeof CHOICES;

export type Mission = {
  job: string;
  clue: string;
  prompt: string;
  choices: ChoiceId[];
  answer: ChoiceId;
  lesson: string;
};

export type GameLevel = {
  number: number;
  belt: string;
  title: string;
  teaches: string;
  color: string;
  missions: Mission[];
};

export const LEVELS: GameLevel[] = [
  {
    number: 1,
    belt: 'White belt',
    title: 'Pick a tool',
    teaches: 'Match a simple job to one tool.',
    color: '#FFFFFF',
    missions: [
      {
        job: 'Will it rain here tomorrow?',
        clue: 'Tomorrow’s forecast can change.',
        prompt: 'What should Pip use?',
        choices: ['memory', 'calculator', 'search'],
        answer: 'search',
        lesson: 'Search finds information that changes, such as weather.',
      },
      {
        job: 'What is 18% of 240?',
        clue: 'The answer must be exact.',
        prompt: 'What should Pip use?',
        choices: ['search', 'calculator', 'memory'],
        answer: 'calculator',
        lesson: 'A calculator handles exact math without guessing.',
      },
      {
        job: 'What snack did I say I like?',
        clue: 'You told Pip yesterday.',
        prompt: 'What should Pip use?',
        choices: ['calculator', 'memory', 'search'],
        answer: 'memory',
        lesson: 'Memory brings back details saved from an earlier conversation.',
      },
    ],
  },
  {
    number: 2,
    belt: 'Purple belt',
    title: 'Plan the next move',
    teaches: 'Spot missing information before choosing a tool.',
    color: '#CFC7FF',
    missions: [
      {
        job: 'Email my coach that I will be late.',
        clue: 'Pip has no coach name or email address.',
        prompt: 'What should Pip do first?',
        choices: ['search', 'ask', 'memory'],
        answer: 'ask',
        lesson: 'An agent should ask when details needed for the job are missing.',
      },
      {
        job: 'Find the cheapest train to Chicago this Saturday.',
        clue: 'Prices and schedules change.',
        prompt: 'What should Pip do first?',
        choices: ['calculator', 'memory', 'search'],
        answer: 'search',
        lesson: 'Search comes first because Pip needs current routes and prices.',
      },
      {
        job: 'Split this $86.40 dinner bill among six people.',
        clue: 'No tip percentage was given.',
        prompt: 'What should Pip do first?',
        choices: ['calculator', 'ask', 'search'],
        answer: 'ask',
        lesson: 'Pip needs the tip amount before calculating each share.',
      },
    ],
  },
  {
    number: 3,
    belt: 'Black belt',
    title: 'Act with care',
    teaches: 'Check work and pause before risky actions.',
    color: '#26305B',
    missions: [
      {
        job: 'Delete every duplicate photo on my phone.',
        clue: 'Deleted photos may be hard to recover.',
        prompt: 'What should Pip do before deleting?',
        choices: ['permission', 'search', 'calculator'],
        answer: 'permission',
        lesson: 'An agent should get permission before a destructive action.',
      },
      {
        job: 'Tell me whether this surprising news post is true.',
        clue: 'One post can be wrong or misleading.',
        prompt: 'What should Pip do before answering?',
        choices: ['memory', 'verify', 'calculator'],
        answer: 'verify',
        lesson: 'Checking reliable sources reduces confident wrong answers.',
      },
      {
        job: 'Buy the first flight you find for my vacation.',
        clue: 'Buying spends money and locks in a choice.',
        prompt: 'What should Pip do before buying?',
        choices: ['permission', 'memory', 'calculator'],
        answer: 'permission',
        lesson: 'Pip can compare flights, but the person should approve the purchase.',
      },
      {
        job: 'Send the finished report to the whole team.',
        clue: 'Pip wrote it using notes from several places.',
        prompt: 'What should Pip do before sending?',
        choices: ['search', 'verify', 'memory'],
        answer: 'verify',
        lesson: 'A final check can catch wrong facts, missing parts, or private details.',
      },
    ],
  },
];
