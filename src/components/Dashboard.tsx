import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from './Card';
import { Wind, Timer, BookOpen, Moon, Brain, ChevronRight, Sun, Calendar, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { getFocusStats, getMemoryScores, getMoodHistory } from '../lib/storage';

// New "Flow" Dashboard Item Component
const FlowItem = ({ title, desc, icon: Icon, color, path, delay }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5, ease: 'easeOut' }}
    >
        <Link to={path} style={{ display: 'block', marginBottom: '1rem' }}>
            <div className="glass-panel" style={{
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                transition: 'transform 0.2s ease',
                cursor: 'pointer'
            }}>
                <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '20px',
                    background: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0f1115', // Dark icon on bright bg
                    boxShadow: `0 8px 16px -4px ${color}60`,
                    flexShrink: 0
                }}>
                    <Icon size={26} strokeWidth={2} />
                </div>

                <div style={{ flex: 1 }}>
                    <h3 style={{
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        marginBottom: '0.2rem',
                        letterSpacing: '-0.01em'
                    }}>{title}</h3>
                    <p style={{
                        fontSize: '0.9rem',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.4
                    }}>{desc}</p>
                </div>

                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--color-bg-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-text-muted)'
                }}>
                    <ChevronRight size={18} />
                </div>
            </div>
        </Link>
    </motion.div>
);

export const Dashboard: React.FC = () => {
    const [greeting, setGreeting] = useState('');
    const [date, setDate] = useState('');
    const [stats, setStats] = useState({ focus: 0, games: 0, mood: 0 });

    useEffect(() => {
        // Time & Greeting Logic
        const hours = new Date().getHours();
        if (hours < 12) setGreeting('Good Morning');
        else if (hours < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');

        const now = new Date();
        setDate(now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));

        // Load Stats
        const focus = getFocusStats();
        const memory = getMemoryScores();
        const mood = getMoodHistory();
        setStats({
            focus: focus.totalMinutes,
            games: memory.length,
            mood: mood.length
        });
    }, []);

    return (
        <div style={{ width: '100%', maxWidth: '540px', paddingBottom: '2rem' }}>

            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ padding: '1rem 0.5rem 2rem' }}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--color-text-muted)',
                    fontSize: '0.85rem',
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 600
                }}>
                    <Calendar size={14} />
                    {date}
                </div>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: 500,
                    letterSpacing: '-0.03em',
                    lineHeight: 1.1,
                    marginBottom: '0.5rem'
                }}>
                    {greeting},<br />
                    <span style={{ color: 'var(--color-text-muted)' }}>Ready to flow?</span>
                </h1>
            </motion.div>

            {/* Daily Snapshot */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="glass-panel"
                style={{
                    padding: '1.5rem',
                    marginBottom: '2rem',
                    background: 'linear-gradient(145deg, rgba(30,32,40,0.6), rgba(20,22,28,0.8))'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Daily Snapshot</h2>
                    <Sparkles size={16} color="var(--color-accent-tertiary)" />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1, padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}>
                        <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-accent-primary)' }}>{stats.focus}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Focus Mins</span>
                    </div>
                    <div style={{ flex: 1, padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}>
                        <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-accent-secondary)' }}>{stats.mood}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Mood Logs</span>
                    </div>
                    <div style={{ flex: 1, padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}>
                        <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-accent-tertiary)' }}>{stats.games}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Brain Tens</span>
                    </div>
                </div>
            </motion.div>

            {/* Feature Flow List */}
            <div>
                <FlowItem
                    title="Breathing Studio"
                    desc="Regulate your nervous system"
                    icon={Wind}
                    color="#818cf8"
                    path="/breathing"
                    delay={0.2}
                />
                <FlowItem
                    title="Focus Zone"
                    desc="Immersive timer & soundscapes"
                    icon={Timer}
                    color="#f472b6"
                    path="/focus"
                    delay={0.3}
                />
                <FlowItem
                    title="Daily Diary"
                    desc="Track your journey & mood"
                    icon={BookOpen}
                    color="#4ade80"
                    path="/journal"
                    delay={0.4}
                />
                <FlowItem
                    title="Brain Training"
                    desc="Sharpen your cognitive skills"
                    icon={Brain}
                    color="#fbbf24"
                    path="/games"
                    delay={0.5}
                />
                <FlowItem
                    title="Sleep Aid"
                    desc="Drift off peacefully"
                    icon={Moon}
                    color="#c084fc"
                    path="/sleep"
                    delay={0.6}
                />
            </div>

        </div>
    );
};
