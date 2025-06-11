# 🃏 Poker Chip Tracker

A mobile-first Progressive Web App (PWA) for tracking poker chips during games. Features a clean, dark theme perfect for poker table lighting conditions.

## Features

### ✨ Current Features
- **Mobile-First Design**: Optimized for smartphones and tablets
- **Dark Theme**: Easy on the eyes in low-light poker environments
- **Game Setup**: Configure game name, players, and starting chip amounts
- **Touch-Friendly**: Large buttons and inputs designed for mobile interaction
- **Local Storage**: Automatically saves your game setup preferences
- **PWA Ready**: Installable on mobile devices, works offline

### 🎯 Upcoming Features
- Live chip tracking during games
- Player chip balance management
- Game history and statistics
- Multiple game type support
- Chip transaction logging

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom poker-themed colors
- **Icons**: Feather Icons for professional, consistent iconography
- **PWA**: Service Worker for offline functionality
- **Storage**: localStorage for data persistence
- **Build Tool**: Create React App

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd chip-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## PWA Installation

### On Mobile (iOS/Android)
1. Open the app in your mobile browser
2. Look for "Add to Home Screen" option in your browser menu
3. Tap "Add" to install the app on your device
4. The app will now work offline and feel like a native app

### On Desktop
1. Open the app in Chrome/Edge
2. Look for the install icon in the address bar
3. Click to install as a desktop app

## Usage

### Setting Up a Game
1. Enter a memorable game name
2. Add player names (minimum 2 players required)
3. Set the starting chip amount
4. Tap "Start Game" to begin

### Features in Development
- **Chip Management**: Track each player's current chip count
- **Quick Actions**: Fast chip transfer between players
- **Game Summary**: End-of-game statistics and winner tracking

## Color Scheme

The app uses a refined, sophisticated color palette designed for premium poker environments:

### Core Theme
- **Background**: Deep blacks (#0a0a0a, #111111) with subtle gradients
- **Cards/Surfaces**: Dark grays (#171717, #1f1f1f) with glassmorphic effects
- **Text**: High contrast whites and light grays for optimal readability

### Action Colors (Refined & Professional)
- **Raise/Active**: Deep Emerald (#059669) - sophisticated alternative to bright green
- **Call/Info**: Muted Slate Blue (#475569) - calm and informative for neutral actions  
- **Fold/Stop**: Deep Crimson (#b91c1c) - refined red that clearly signals stop without being jarring

### Accent Colors
- **Gold**: Warm amber (#f59e0b) for pot amounts and highlights
- **Teal**: Professional teal (#0f766e) for check actions
- **Status Indicators**: Contextual colors that maintain hierarchy without competing for attention

### Design Philosophy
- **Monochromatic Icons**: Professional Feather icons in consistent white/light gray
- **Subtle Position Badges**: Muted colors for BB/SB that provide information without distraction
- **Premium Feel**: Solid borders instead of glows, refined color choices throughout

## Contributing

This is a focused poker utility app. If you'd like to contribute:

1. Clone the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on mobile devices
5. Submit a pull request

## TODO
1. Organise game UI, clean up
2. BB, SB, dealer - comply with game rules


## License

MIT License - feel free to use this for your poker nights!

---

*Perfect for home games, tournaments, and any poker session where you need to track chips digitally.*
