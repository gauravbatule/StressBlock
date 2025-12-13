import React, { useState, useEffect } from 'react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, Meh, Frown, Trash2, Calendar, Edit3, BookOpen } from 'lucide-react';
import {
    getJournalEntries,
    saveJournalEntry,
    deleteJournalEntry,
    saveMoodEntry,
    getMoodHistory,
    type JournalEntry
} from '../../lib/storage';

export const JournalPage: React.FC = () => {
    // Renamed visually to "Diary" but component kept as JournalPage for routing safety
    const [mood, setMood] = useState(50);
    const [note, setNote] = useState('');
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [view, setView] = useState<'today' | 'timeline'>('today');

    // Date Logic
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    useEffect(() => {
        setEntries(getJournalEntries());
    }, []);

    const handleSave = () => {
        if (!note.trim()) return;
        const newEntry: JournalEntry = {
            id: Date.now(),
            text: note,
            mood,
            date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now(),
        };

        saveJournalEntry(newEntry);
        saveMoodEntry(mood);

        setEntries([newEntry, ...entries]);
        setNote('');
        setMood(50);
        // Optional: Switch to timeline view after saving
    };

    const handleDelete = (id: number) => {
        deleteJournalEntry(id);
        setEntries(entries.filter(e => e.id !== id));
    };

    const getMoodInfo = (val: number) => {
        if (val < 30) return { label: 'Heavy', color: '#fb7185', icon: Frown }; // Soft Red
        if (val < 60) return { label: 'Neutral', color: '#94a3b8', icon: Meh }; // Gray
        return { label: 'Vibrant', color: '#4ade80', icon: Smile }; // Soft Green
    };

    const moodInfo = getMoodInfo(mood);
    const MoodIcon = moodInfo.icon;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ width: '100%', maxWidth: '600px', margin: '0 auto', paddingBottom: '2rem' }}
        >
            {/* Soft Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
                padding: '0 0.5rem'
            }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Diary</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={12} /> {dateStr}
                    </p>
                </div>

                <div style={{ background: 'var(--color-bg-tertiary)', padding: '0.25rem', borderRadius: '12px', display: 'flex', gap: '0.25rem' }}>
                    <Button
                        size="sm"
                        variant={view === 'today' ? 'secondary' : 'ghost'}
                        onClick={() => setView('today')}
                        style={{ padding: '0.4rem 0.8rem', height: '32px', fontSize: '0.75rem' }}
                    >
                        <Edit3 size={14} style={{ marginRight: '4px' }} /> Today
                    </Button>
                    <Button
                        size="sm"
                        variant={view === 'timeline' ? 'secondary' : 'ghost'}
                        onClick={() => setView('timeline')}
                        style={{ padding: '0.4rem 0.8rem', height: '32px', fontSize: '0.75rem' }}
                    >
                        <BookOpen size={14} style={{ marginRight: '4px' }} /> timeline
                    </Button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {view === 'today' ? (
                    <motion.div
                        key="today"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {/* Writing Area */}
                        <Card className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>How's your spirit?</span>
                                    <span style={{
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        color: moodInfo.color,
                                        background: `${moodInfo.color}15`,
                                        padding: '0.2rem 0.6rem',
                                        borderRadius: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem'
                                    }}>
                                        <MoodIcon size={14} /> {moodInfo.label}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="100"
                                    value={mood}
                                    onChange={(e) => setMood(parseInt(e.target.value))}
                                    style={{ width: '100%' }}
                                />
                            </div>

                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Dear Diary..."
                                style={{
                                    width: '100%',
                                    height: '240px',
                                    background: 'transparent',
                                    border: 'none',
                                    padding: '1.5rem',
                                    fontSize: '1.05rem',
                                    lineHeight: 1.7,
                                    resize: 'none',
                                    color: 'var(--color-text-primary)'
                                }}
                            />

                            <div style={{
                                padding: '1rem',
                                borderTop: '1px solid var(--glass-border)',
                                display: 'flex',
                                justifyContent: 'flex-end',
                                background: 'rgba(0,0,0,0.1)'
                            }}>
                                <Button onClick={handleSave} disabled={!note.trim()} className="btn-primary" size="md">
                                    Save Entry
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div
                        key="timeline"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {entries.length > 0 ? (
                            <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                                {/* Timeline Line */}
                                <div style={{
                                    position: 'absolute',
                                    left: '0',
                                    top: '0',
                                    bottom: '0',
                                    width: '2px',
                                    background: 'var(--glass-border-light)'
                                }} />

                                {entries.map((entry, index) => {
                                    const entryMood = getMoodInfo(entry.mood);
                                    return (
                                        <div key={entry.id} style={{ position: 'relative', marginBottom: '2rem' }}>
                                            {/* Timeline Dot */}
                                            <div style={{
                                                position: 'absolute',
                                                left: '-1.5rem',
                                                top: '1rem',
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '50%',
                                                background: entryMood.color,
                                                transform: 'translateX(-50%)',
                                                boxShadow: `0 0 0 4px var(--color-bg-primary)`
                                            }} />

                                            <Card className="glass-panel" style={{ padding: '1.25rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                                                        {new Date(entry.timestamp).toLocaleDateString()} · {entry.date}
                                                    </span>
                                                    <button
                                                        onClick={() => handleDelete(entry.id)}
                                                        style={{ color: 'var(--color-text-muted)', transition: 'color 0.2s' }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                <p style={{
                                                    fontSize: '0.95rem',
                                                    lineHeight: 1.6,
                                                    color: 'var(--color-text-secondary)',
                                                    whiteSpace: 'pre-wrap'
                                                }}>
                                                    {entry.text}
                                                </p>
                                                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--glass-border)' }}>
                                                    <span style={{ fontSize: '0.75rem', color: entryMood.color, fontWeight: 600 }}>
                                                        Feeling {entryMood.label.toLowerCase()}
                                                    </span>
                                                </div>
                                            </Card>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
                                <BookOpen size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                <p>Your timeline is empty. Write your first entry today.</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
