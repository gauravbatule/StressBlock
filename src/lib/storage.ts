// Local Storage utilities for StressBlock

const STORAGE_KEYS = {
    JOURNAL_ENTRIES: 'stressblock_journal_entries',
    JOURNAL_MOOD_HISTORY: 'stressblock_mood_history',
    FOCUS_STATS: 'stressblock_focus_stats',
    MEMORY_SCORES: 'stressblock_memory_scores',
    USER_PREFERENCES: 'stressblock_preferences',
} as const;

export interface JournalEntry {
    id: number;
    text: string;
    mood: number;
    date: string;
    timestamp: number;
}

export interface MoodHistoryEntry {
    date: string;
    mood: number;
    timestamp: number;
}

export interface FocusStats {
    totalMinutes: number;
    sessionsCompleted: number;
    lastSession: string | null;
}

export interface MemoryScore {
    game: string;
    score: number;
    date: string;
    timestamp: number;
}

export interface UserPreferences {
    preferredBreathingMode: string;
    preferredNoise: string;
    focusDuration: number;
}

// Generic get/set functions
function getFromStorage<T>(key: string, defaultValue: T): T {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch {
        return defaultValue;
    }
}

function setToStorage<T>(key: string, value: T): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error('Failed to save to localStorage:', e);
    }
}

// Journal Entries
export function getJournalEntries(): JournalEntry[] {
    return getFromStorage(STORAGE_KEYS.JOURNAL_ENTRIES, []);
}

export function saveJournalEntry(entry: JournalEntry): void {
    const entries = getJournalEntries();
    entries.unshift(entry);
    setToStorage(STORAGE_KEYS.JOURNAL_ENTRIES, entries.slice(0, 100)); // Keep last 100
}

export function deleteJournalEntry(id: number): void {
    const entries = getJournalEntries().filter(e => e.id !== id);
    setToStorage(STORAGE_KEYS.JOURNAL_ENTRIES, entries);
}

export function clearAllJournalEntries(): void {
    setToStorage(STORAGE_KEYS.JOURNAL_ENTRIES, []);
}

// Mood History
export function getMoodHistory(): MoodHistoryEntry[] {
    return getFromStorage(STORAGE_KEYS.JOURNAL_MOOD_HISTORY, []);
}

export function saveMoodEntry(mood: number): void {
    const history = getMoodHistory();
    history.unshift({
        date: new Date().toLocaleDateString(),
        mood,
        timestamp: Date.now(),
    });
    setToStorage(STORAGE_KEYS.JOURNAL_MOOD_HISTORY, history.slice(0, 30)); // Keep last 30 days
}

// Focus Stats
export function getFocusStats(): FocusStats {
    return getFromStorage(STORAGE_KEYS.FOCUS_STATS, {
        totalMinutes: 0,
        sessionsCompleted: 0,
        lastSession: null,
    });
}

export function addFocusSession(minutes: number): void {
    const stats = getFocusStats();
    stats.totalMinutes += minutes;
    stats.sessionsCompleted += 1;
    stats.lastSession = new Date().toISOString();
    setToStorage(STORAGE_KEYS.FOCUS_STATS, stats);
}

// Memory Game Scores
export function getMemoryScores(): MemoryScore[] {
    return getFromStorage(STORAGE_KEYS.MEMORY_SCORES, []);
}

export function saveMemoryScore(game: string, score: number): void {
    const scores = getMemoryScores();
    scores.unshift({
        game,
        score,
        date: new Date().toLocaleString(),
        timestamp: Date.now(),
    });
    setToStorage(STORAGE_KEYS.MEMORY_SCORES, scores.slice(0, 50)); // Keep last 50
}

export function getHighScore(game: string): number {
    const scores = getMemoryScores().filter(s => s.game === game);
    return scores.length > 0 ? Math.max(...scores.map(s => s.score)) : 0;
}

// User Preferences
export function getPreferences(): UserPreferences {
    return getFromStorage(STORAGE_KEYS.USER_PREFERENCES, {
        preferredBreathingMode: 'box',
        preferredNoise: 'brown',
        focusDuration: 25,
    });
}

export function savePreferences(prefs: Partial<UserPreferences>): void {
    const current = getPreferences();
    setToStorage(STORAGE_KEYS.USER_PREFERENCES, { ...current, ...prefs });
}
