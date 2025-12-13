import React, { useState } from 'react';
import { useTimer } from '../../hooks/useTimer';
import { useNoise } from '../../hooks/useNoise';
import type { NoiseType } from '../../hooks/useNoise';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Timer } from 'lucide-react';

export const FocusPage: React.FC = () => {
    const [duration, setDuration] = useState(25);
    const { formattedTime, isActive, start, pause, reset, progress } = useTimer(duration);
    const { isPlaying, play, stop, volume, changeVolume, currentType } = useNoise();

    const handleDurationChange = (min: number) => {
        setDuration(min);
        reset(min);
    };

    const toggleTimer = () => isActive ? pause() : start();

    // Circular Progress - Minimalist
    const radius = 100;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    const noiseTypes: { type: NoiseType; label: string; color: string }[] = [
        { type: 'brown', label: 'Brown Noise', color: '#a78bfa' },
        { type: 'pink', label: 'Pink Noise', color: '#f472b6' },
        { type: 'white', label: 'White Noise', color: '#94a3b8' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-center"
            style={{ flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: '500px', margin: '0 auto' }}
        >
            {/* Minimal Header */}
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'rgba(129, 140, 248, 0.1)',
                    color: 'var(--color-accent-primary)',
                    padding: '0.4rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: '1rem'
                }}>
                    <Timer size={14} /> Focus Zone
                </div>
            </div>

            {/* Timer Visualization - Clean */}
            <div style={{
                position: 'relative',
                width: '240px',
                height: '240px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <svg width="240" height="240" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
                    <circle
                        cx="120" cy="120" r={radius}
                        stroke="var(--color-bg-tertiary)"
                        strokeWidth="6"
                        fill="transparent"
                    />
                    <motion.circle
                        cx="120" cy="120" r={radius}
                        stroke="var(--color-accent-primary)"
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray={circumference}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 0.5, ease: "linear" }}
                        strokeLinecap="round"
                    />
                </svg>

                <div style={{ textAlign: 'center', zIndex: 10 }}>
                    <motion.div
                        style={{
                            fontSize: '3.5rem',
                            fontWeight: 600,
                            fontVariantNumeric: 'tabular-nums',
                            letterSpacing: '-0.03em',
                            lineHeight: 1
                        }}
                    >
                        {formattedTime}
                    </motion.div>
                    <div style={{
                        marginTop: '0.5rem',
                        color: 'var(--color-text-muted)',
                        fontSize: '0.9rem'
                    }}>
                        {isActive ? 'Focusing...' : 'Ready to start'}
                    </div>
                </div>
            </div>

            {/* Main Controls */}
            <div style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'center' }}>
                <Button
                    onClick={toggleTimer}
                    size="lg"
                    className="btn-primary"
                    style={{ minWidth: '160px', borderRadius: '30px' }}
                >
                    {isActive ? <><Pause size={20} style={{ marginRight: 8 }} /> Pause</> : <><Play size={20} fill="currentColor" style={{ marginRight: 8 }} /> Start Focus</>}
                </Button>
                <Button variant="secondary" onClick={() => reset()} style={{ borderRadius: '50%', width: '56px', height: '56px', padding: 0 }}>
                    <RotateCcw size={20} />
                </Button>
            </div>

            {/* Duration Pills */}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                {[15, 25, 45, 60].map(m => (
                    <button
                        key={m}
                        onClick={() => handleDurationChange(m)}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            border: `1px solid ${duration === m ? 'var(--color-accent-primary)' : 'transparent'}`,
                            background: duration === m ? 'rgba(129, 140, 248, 0.1)' : 'var(--color-bg-tertiary)',
                            color: duration === m ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {m} min
                    </button>
                ))}
            </div>

            {/* Soundscapes - Minimal Panel */}
            <div className="glass-panel" style={{ width: '100%', padding: '1.25rem', marginTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <Volume2 size={18} style={{ color: 'var(--color-text-muted)' }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Soundscapes</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                    {noiseTypes.map(({ type, label }) => (
                        <button
                            key={type}
                            onClick={() => play(type)}
                            style={{
                                padding: '0.75rem',
                                borderRadius: '12px',
                                background: isPlaying && currentType === type ? 'var(--color-text-primary)' : 'var(--color-bg-primary)',
                                color: isPlaying && currentType === type ? 'var(--color-bg-primary)' : 'var(--color-text-secondary)',
                                fontSize: '0.8rem',
                                fontWeight: 500,
                                border: '1px solid var(--glass-border)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {label.split(' ')[0]}
                        </button>
                    ))}
                </div>

                {isPlaying && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.25rem' }}>
                        <input
                            type="range"
                            min="0" max="1" step="0.01"
                            value={volume}
                            onChange={(e) => changeVolume(parseFloat(e.target.value))}
                            style={{ flex: 1, height: '4px' }}
                        />
                        <button onClick={stop} style={{ color: 'var(--color-text-muted)' }}><VolumeX size={18} /></button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
