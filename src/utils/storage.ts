export interface Player {
    id: string;
    name: string;
    chips: number;
}

export interface GameData {
    gameName: string;
    players: Player[];
    startingChips: number;
    createdAt: number;
}

const STORAGE_KEYS = {
    CURRENT_GAME: 'currentGame',
    GAME_SETUP: 'gameSetup',
    GAME_HISTORY: 'gameHistory'
};

export const storage = {
    // Game setup data
    saveGameSetup: (gameName: string, players: { id: string; name: string }[], startingChips: number) => {
        const setupData = { gameName, players, startingChips };
        localStorage.setItem(STORAGE_KEYS.GAME_SETUP, JSON.stringify(setupData));
    },

    getGameSetup: () => {
        const data = localStorage.getItem(STORAGE_KEYS.GAME_SETUP);
        return data ? JSON.parse(data) : null;
    },

    // Current game
    saveCurrentGame: (gameData: GameData) => {
        localStorage.setItem(STORAGE_KEYS.CURRENT_GAME, JSON.stringify(gameData));
    },

    getCurrentGame: (): GameData | null => {
        const data = localStorage.getItem(STORAGE_KEYS.CURRENT_GAME);
        return data ? JSON.parse(data) : null;
    },

    clearCurrentGame: () => {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_GAME);
    },

    // Game history
    saveToHistory: (gameData: GameData) => {
        const history = storage.getGameHistory();
        const gameToSave = { ...gameData, completedAt: Date.now() };
        history.push(gameToSave);
        // Keep only last 20 games
        const trimmedHistory = history.slice(-20);
        localStorage.setItem(STORAGE_KEYS.GAME_HISTORY, JSON.stringify(trimmedHistory));
    },

    getGameHistory: () => {
        const data = localStorage.getItem(STORAGE_KEYS.GAME_HISTORY);
        return data ? JSON.parse(data) : [];
    },

    clearHistory: () => {
        localStorage.removeItem(STORAGE_KEYS.GAME_HISTORY);
    },

    // Clear all data
    clearAll: () => {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    }
}; 