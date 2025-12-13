import React, { useState } from 'react';
import { BreathingVisualizer } from './BreathingVisualizer';
import { useBreathing } from '../../hooks/useBreathing';
import type { BreathingMode } from '../../hooks/useBreathing';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { motion } from 'framer-motion';
import { Play, Square, Box, Moon, Heart, Zap, Wind } from 'lucide-react';

const modeIcons: Record<BreathingMode, React.ElementType> = {
    box: Box,
    relax: Moon,
    balance: Heart,
    panic: Zap,
};

const modeColors: Record<BreathingMode, string> = {
    box: '#38bdf8',
    relax: '#c084fc',
    balance: '#22c55e',
    panic: '#f97316',
};

export const BreathingPage: React.FC = () => {
    const [mode, setMode] = useState<BreathingMode>('box');
    const { phase, isActive, start, stop, config } = useBreathing(mode);

    const handleToggle = () => {
        if (isActive) {
            stop();
        } else {
            start();
        }
    };

    const modes: { key: BreathingMode; title: string; desc: string }[] = [
        { key: 'box', title: 'Box Breathing', desc: 'Focus & Clarity' },
        { key: 'relax', title: '4-7-8 Relax', desc: 'Sleep & Calm' },
        { key: 'balance', title: 'Coherence', desc: 'Heart Balance' },
        { key: 'panic', title: 'Calm Down', desc: 'Anxiety Relief' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-center"
            style={{ flexDirection: 'column', width: '100%', maxWidth: '600px', margin: '0 auto' }}
        >
            {/* Header */}
            <div style={{ textAlign: 'center', marginTop: '1rem', marginBottom: '2rem' }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'rgba(56, 189, 248, 0.1)',
                    color: 'var(--color-accent-primary)',
                    padding: '0.4rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem'
                }}>
                    <Wind size={14} /> Breathing Studio
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 600 }}>{config.name}</h2>
            </div>

            {/* Visualizer Area */}
            <div style={{ marginBottom: '2rem' }}>
                <BreathingVisualizer phase={phase} config={config} />
            </div>

            {/* Main Action */}
            <motion.div whileTap={{ scale: 0.97 }} style={{ marginBottom: '2rem' }}>
                <Button
                    onClick={handleToggle}
                    className={isActive ? 'btn-secondary' : 'btn-primary'}
                    size="lg"
                    style={{
                        minWidth: '200px',
                        gap: '0.75rem',
                        borderRadius: '30px',
                        boxShadow: isActive ? 'none' : '0 10px 30px -10px var(--color-accent-glow)'
                    }}
                >
                    {isActive ? (
                        <> stop session</>
                    ) : (
                        <> start breathing</>
                    )}
                </Button>
            </motion.div>

            {/* Mode Selector - Clean List */}
            <div style={{ width: '100%' }}>
                <p style={{
                    fontSize: '0.85rem',
                    color: 'var(--color-text-muted)',
                    marginBottom: '1rem',
                    paddingLeft: '0.5rem',
                    fontWeight: 500
                }}>SELECT PATTERN</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                    {modes.map((m, index) => {
                        const Icon = modeIcons[m.key];
                        const isSelected = mode === m.key;
                        const color = modeColors[m.key];

                        return (
                            <motion.div
                                key={m.key}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => { stop(); setMode(m.key); }}
                            >
                                <div
                                    className="glass-panel"
                                    style={{
                                        padding: '1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        cursor: 'pointer',
                                        background: isSelected ? `linear-gradient(90deg, ${color}15, transparent)` : 'var(--glass-bg)',
                                        border: `1px solid ${isSelected ? color : 'var(--glass-border)'}`,
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '12px',
                                        background: isSelected ? color : 'var(--color-bg-tertiary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: isSelected ? '#0f1115' : 'var(--color-text-muted)',
                                        transition: 'all 0.2s ease',
                                    }}>
                                        <Icon size={20} strokeWidth={2} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            color: isSelected ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                                            marginBottom: '0.1rem'
                                        }}>
                                            {m.title}
                                        </h4>
                                        <p style={{
                                            fontSize: '0.8rem',
                                            color: 'var(--color-text-muted)'
                                        }}>
                                            {m.desc}
                                        </p>
                                    </div>
                                    {isSelected && (
                                        <div style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            background: color
                                        }} />
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
};
