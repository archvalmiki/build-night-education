# Build Night Education

Build Night Education is a mobile game that teaches people how AI agents work. The project uses Expo Router, React Native, and TypeScript.

## Platform baseline

This project targets Expo SDK 54 because newer SDK releases don't work with the intended deployment environment. Keep the `expo` dependency on the `~54.0` release line when you add or update packages.

- Expo SDK 54
- React Native 0.81
- React 19.1
- Node.js 20.19.4 or later

## Run the app

Install dependencies:

```sh
npm install
```

Start the Expo development server:

```sh
npm start
```

Use the terminal shortcuts to open the app in Expo Go, an iOS simulator, an Android emulator, or a web browser.

## Check the project

Run the linter:

```sh
npm run lint
```

Check Expo dependency compatibility:

```sh
npx expo install --check
```
