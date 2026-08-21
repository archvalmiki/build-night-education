# Agent Ninja

Agent Ninja is a short mobile game that teaches how AI agents choose tools,
plan their next step, and pause before risky actions. It was also built as an
experiment in developing a complete Expo app through conversation with an AI
coding agent.

- [Play Agent Ninja](https://agent-ninja.expo.app)
- [View the Expo project](https://expo.dev/projects/242eeff7-04c0-4c90-a553-0c4c880ad162)
- [Browse the GitHub repository](https://github.com/archvalmiki/build-night-education)

Scan this QR code with the iPhone Camera app to open the hosted game:

![QR code for the Agent Ninja web app](docs/agent-ninja-web-qr.png)

The QR code opens the EAS Hosting production build. That build remains
available when the development laptop is off. Expo Go testing uses a temporary
Metro URL and requires the development machine to keep running.

This README follows the Google developer documentation style guide through a
custom Google-style skill. It also goes through the custom slop-check skill
before publication. Both skills came from earlier work on reusable agent
workflows.

## What the game teaches

The player trains Pip, a cartoon ninja robot. Each mission gives Pip a job and
asks the player to choose what Pip should do next.

The difficulty increases across three levels:

1. **White belt: Pick a tool.** Match simple jobs with web search, memory, or a
   calculator.
2. **Purple belt: Plan the next move.** Notice when Pip needs current
   information or must ask for missing details.
3. **Black belt: Act with care.** Check results and get permission before
   destructive actions or purchases.

The current game includes:

- 10 missions with immediate explanations.
- Points and answer streaks.
- A remembered player name.
- Local High Scores containing the eight best completed runs on the device.
- Haptic feedback on supported mobile devices.
- A one-screen game menu, a separate Help screen, and level transition screens.

## Why this repository exists

This repository records an AI-assisted product-development loop, including the
parts that required correction. The first playable version worked, but it
looked like a corporate quiz and explained the game poorly. Short rounds of
human feedback changed the concept, visual design, teaching sequence, data
model, testing process, and deployment workflow.

The working pattern was:

1. Give the agent a concrete product intent and technical constraints.
2. Build a playable version early.
3. Test the real interface as well as the source code.
4. Describe confusion in plain language.
5. Let the agent revise the product and verify the complete flow.

## Build history and decisions

1. **Create the repository.** The agent initialized Git, created a private
   GitHub repository with `gh`, and added a `.gitignore` that excludes
   dependencies, Expo output, generated builds, secrets, and macOS files such
   as `.DS_Store`.
2. **Pin the platform.** The project started on Expo SDK 54 because newer SDK
   releases caused problems in the intended environment. The agent checked the
   versioned Expo 54 documentation before code changes and used
   `npx expo install` for compatible native packages.
3. **Build a playable placeholder.** The first game asked the player to match a
   job with web search, memory, or a calculator. This established the central
   teaching mechanic before the visual direction was settled.
4. **Test in a real browser.** The agent used the installed agent-browser plugin
   instead of assuming that a successful build meant the interface worked. It
   checked interactions, responsive layout, console output, and accessibility.
5. **Rename and redesign the game.** Human feedback named the game Agent Ninja
   and rejected the first corporate-looking screen. The next version introduced
   Pip, bright cartoon colors, chunky controls, a game menu, and mission cards.
   Pip remained a code-built React Native character.
6. **Connect Expo services.** The agent linked the app to the existing Expo
   project, deployed the web build with EAS Hosting, and started Metro tunnels
   for Expo Go tests. The tunnel required the `@expo/ngrok` helper on the
   development machine.
7. **Add a learning curve.** A single round became 10 missions across white,
   purple, and black belt levels. The curriculum grew from tool matching to
   missing-information checks, verification, and permission before risky
   actions.
8. **Resolve score storage.** A proposed leaderboard raised a product question:
   local storage cannot compare players across phones. A shared leaderboard
   would require a hosted database and API. The feature became local High
   Scores, and AsyncStorage now remembers the name and eight best runs on one
   device.
9. **Simplify the menu.** Browser screenshots showed that the starter looked
   like a scrolling web page. The final menu fits one mobile viewport, puts
   Help and High Scores at the top, and asks for a name only when needed. A
   returning player confirms or changes the saved name before starting.
10. **Create permanent and temporary test paths.** EAS Hosting provides the
    permanent web URL and committed QR code. Metro provides a temporary Expo Go
    QR code for native development. The temporary QR expires when its tunnel or
    development machine stops.
11. **Prepare the educational release.** The agent wrote this README with the
    custom Google-style skill, ran the custom slop-check, published the web app
    to the stable production URL, and changed the GitHub repository from private
    to public.

## Prompts and feedback that shaped the app

These excerpts are condensed from the working conversation. They preserve the
request and feedback without presenting a full transcript.

- **Repository and platform:** "Set this up as a private repo under my GitHub
  account. Use Expo SDK 54 because the newest SDK does not work properly for
  this project."
- **Initial product:** "Build an app for teaching people about AI agents as a
  game. Start with a basic simple game."
- **Visual correction:** "The game looks like a corporate website. Give it a
  starter screen and make it feel like a fun, cartoonish game."
- **Identity:** "The game should be called Agent Ninja."
- **Browser verification:** "Use the agent-browser plugin that is already set
  up on this machine for testing in the browser."
- **Learning progression:** "Add levels and take the game from easy to hard
  over time."
- **Persistence:** "Let the player enter a name and remember it over sessions."
- **Scope correction:** "A leaderboard does not make sense across downloads
  without shared storage. Call it High Scores and show the player's own high
  scores."
- **Menu correction:** "The starter must fit on one screen. Show Start Game,
  ask for a name only when needed, confirm a saved name, and put Help on the
  home screen."
- **Writing review:** "Run slop-check and drift-check."

The prompts specify outcomes and constraints. The feedback names observable
problems while leaving implementation choices open.

## Agent skills, plugins, and tools

Several parts of this workflow use custom skills built during earlier work.
They turn repeatable preferences and review methods into instructions the agent
can load when a task calls for them.

- **Codex:** Inspected the workspace, edited the React Native code, ran checks,
  managed Git, and coordinated deployment commands.
- **frontend-design custom skill:** Set a cartoon dojo direction, retained the
  hand-built ninja robot, and avoided a generic dashboard layout.
- **agent-browser plugin and CLI:** Tested the app in Chromium at a mobile
  viewport, completed all 10 missions, checked persistence, captured
  screenshots, inspected console errors, and ran an accessibility audit.
- **slop-check custom skill:** Scanned player-facing copy and this README for
  common AI-writing patterns.
- **drift-check custom skill:** Compared player-facing language with the
  original product intent to catch unnecessary frameworks, corporate language,
  or changes in meaning.
- **Google-style custom skill:** Applied the bundled Google developer
  documentation style guide to this README. It shaped headings, procedures,
  command formatting, voice, and sentence structure.
- **caveman custom skill:** Kept working-session updates short. It did not
  determine game content or architecture.
- **GitHub CLI:** Created the remote repository, pushed changes, and managed
  repository visibility.
- **Expo CLI and EAS CLI:** Pinned compatible packages, ran Metro, created an
  Expo Go tunnel, exported the web build, and deployed the preview to EAS
  Hosting.

The ninja character is built from React Native views and text. The app uses no
generated character artwork.

## Development decisions

### Pin Expo SDK 54

The project targets Expo SDK 54 because that version was a stated requirement.
Keep the `expo` dependency on the `~54.0` release line. Install Expo packages
with `npx expo install` so their versions remain compatible with SDK 54.

Current platform versions include:

- Expo SDK 54
- React Native 0.81
- React 19.1
- TypeScript 5.9

### Keep High Scores on the device

The original idea used the word *leaderboard*. A leaderboard shared by every
download requires a hosted database and an API. This version instead stores the
player name and past scores with AsyncStorage.

This choice gives the game a familiar single-player High Scores screen and
keeps its scope clear. A future global leaderboard can use a shared backend
such as the Convex integration documented by Expo.

### Teach more than tool selection

The early prototype only asked players to choose among search, memory, and a
calculator. Later levels introduce two parts of agent behavior that are easy to
miss:

- Ask for information when the job is underspecified.
- Check work and request permission before consequential actions.

### Separate content from screen logic

Mission text, answer choices, lessons, and level metadata live in
`constants/game-content.ts`. Screen state, scoring, persistence, and visual
components live in `app/(tabs)/index.tsx`.

This split lets contributors review or expand the curriculum without digging
through the complete UI implementation.

## Project structure

```text
app/
  _layout.tsx            Root Expo Router layout
  (tabs)/index.tsx       Game screens, scoring, and local persistence
constants/
  game-content.ts        Levels, missions, choices, and explanations
  theme.ts               Shared font configuration
assets/images/           App icons and splash assets
AGENTS.md                SDK 54 and testing handoff requirements
app.json                 Expo and EAS project configuration
```

## Versioning

Git tags mark playable versions. The app uses a three-part version in
`app.json`, `package.json`, and `package-lock.json`. The home screen reads the
Expo app version and shows its first two parts.

- [`v0.1`](https://github.com/archvalmiki/build-night-education/tree/v0.1)
  marks the first complete Agent Ninja release. It introduced the cartoon
  design and five tool-selection missions.
- [`v0.2`](https://github.com/archvalmiki/build-night-education/tree/v0.2)
  adds three levels, 10 missions, local High Scores, remembered names, the
  one-screen menu, Help, the educational README, and production hosting.

For each release, update the app and package versions, commit the release, add
an annotated Git tag, and push the commit and tag to GitHub.

## Run the app

Node.js 20.19 or later is required by Expo SDK 54.

1. Install dependencies:

   ```sh
   npm install
   ```

2. Start Metro:

   ```sh
   npm start
   ```

3. Use the terminal QR code to open the app in Expo Go, or press `w` to open
   the web version.

If the phone and development machine cannot connect over the local network,
start an Expo tunnel:

```sh
npx expo start --tunnel --go
```

On iOS, scan the terminal QR code with the Camera app, then open the link in
Expo Go. The development machine must remain running while the phone uses the
Metro server.

## Check the project

Run the static checks:

```sh
npx tsc --noEmit
npm run lint
npx expo install --check
```

Create the production web export:

```sh
npx expo export --platform web
```

The browser test used a `390 x 844` viewport. It verified:

- The menu height matched the viewport height, with no page scroll.
- A first-time player saw the name prompt after selecting **Start Game**.
- A returning player saw the saved name and could change it.
- All 10 missions, level transitions, scoring, and results completed.
- High Scores persisted after navigation and reload.
- The browser console contained no application errors.
- The axe-core WCAG A and AA audit reported zero violations.

Automated browser checks cover the web build. Expo Go on iOS still needs a
manual smoke test for native layout, keyboard behavior, storage, and haptics.

## Deploy the hosted web app

1. Export the web app:

   ```sh
   npx expo export --platform web
   ```

2. Deploy to production:

   ```sh
   npx --yes eas-cli deploy --prod --non-interactive
   ```

EAS Hosting serves the production build at
[agent-ninja.expo.app](https://agent-ninja.expo.app) and records the deployment
in the Expo project dashboard.

## Current boundaries

- High Scores stay on one device and do not sync across installations.
- The app has a fixed curriculum of 10 missions.
- The player selects the agent's next move from fixed mission data. A live AI
  model does not run inside the game.
- The EAS Hosting URL serves the web build. Expo Go testing uses a live Metro
  URL from the development machine.
