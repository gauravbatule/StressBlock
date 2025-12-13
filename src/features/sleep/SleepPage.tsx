import React, { useState } from 'react';
import { useNoise } from '../../hooks/useNoise';
import type { NoiseType } from '../../hooks/useNoise';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Volume2, MonitorOff, Waves } from 'lucide-react';

export const SleepPage: React.FC = () => {
    const { isPlaying, play, stop, volume, changeVolume, currentType } = useNoise();
    const [isScreenOff, setIsScreenOff] = useState(false);

    const toggleScreenOff = () => {
        setIsScreenOff(!isScreenOff);
    };

    const noiseOptions: { type: NoiseType; label: string; desc: string }[] = [
        { type: 'brown', label: 'Brown Noise', desc: 'Deep, rumbling tones' },
        { type: 'pink', label: 'Pink Noise', desc: 'Balanced, natural sound' },
        { type: 'white', label: 'White Noise', desc: 'Equal intensity frequencies' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-center"
            style={{ flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '600px' }}
        >
            {/* Screen Off Overlay */}
            <AnimatePresence>
                {isScreenOff && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleScreenOff}
                        style={{
                            position: 'fixed',
                            top: 0, left: 0, right: 0, bottom: 0,
                            background: '#000',
                            zIndex: 9999,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '1rem',
                            cursor: 'pointer'
                        }}
                    >
                        {isPlaying && (
                            <motion.div
                                animate={{ opacity: [0.2, 0.4, 0.2] }}
                                transition={{ duration: 3, repeat: Infinity }}
                            >
                                <Waves size={40} style={{ color: '#1e293b' }} />
                            </motion.div>
                        )}
                        <p style={{ color: '#1e293b', fontSize: '0.9rem' }}>Tap anywhere to wake</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="page-header">
                <h2 className="page-title text-gradient-purple">Sleep Aid</h2>
                <p className="page-subtitle">Drift off with soothing sounds</p>
            </div>

            {/* Moon Visualization */}
            <motion.div
                animate={{
                    scale: isPlaying ? [1, 1.05, 1] : 1,
                    opacity: isPlaying ? 1 : 0.7
                }}
                transition={{ duration: 3, repeat: isPlaying ? Infinity : 0 }}
                style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #c084fc, #818cf8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isPlaying
                        ? '0 0 60px rgba(192, 132, 252, 0.5), 0 0 100px rgba(129, 140, 248, 0.3)'
                        : '0 0 30px rgba(192, 132, 252, 0.3)',
                }}
            >
                <Moon size={50} color="white" fill="rgba(255,255,255,0.2)" />
            </motion.div>

            {/* Status */}
            {isPlaying && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        color: 'var(--color-accent-tertiary)',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <span style={{
                        width: '8px',
                        height: '8px',
                        background: 'var(--color-success)',
                        borderRadius: '50%',
                        animation: 'pulse 2s infinite'
                    }} />
                    Playing {currentType} noise
                </motion.p>
            )}

            {/* Noise Options */}
            <Card className="glass-panel" style={{ width: '100%', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
                    Ambient Soundscape
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    {noiseOptions.map(({ type, label, desc }) => {
                        const isActive = isPlaying && currentType === type;
                        return (
                            <motion.div
                                key={type}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => isActive ? stop() : play(type)}
                                className="glass-panel"
                                style={{
                                    padding: '1rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    borderColor: isActive ? 'var(--color-accent-tertiary)' : 'var(--glass-border)',
                                    background: isActive ? 'rgba(192, 132, 252, 0.1)' : 'var(--glass-bg-light)',
                                }}
                            >
                                <div>
                                    <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.15rem' }}>{label}</p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{desc}</p>
                                </div>
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: 'var(--radius-md)',
                                    background: isActive ? 'var(--color-accent-tertiary)' : 'var(--color-bg-tertiary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease',
                                }}>
                                    <Waves size={18} color={isActive ? 'white' : 'var(--color-text-muted)'} />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Volume */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Volume2 size={18} style={{ color: 'var(--color-text-muted)' }} />
                        <input
                            type="range"
                            min="0" max="1" step="0.01"
                            value={volume}
                            onChange={(e) => changeVolume(parseFloat(e.target.value))}
                            style={{ flex: 1 }}
                        />
                    </div>
                </div>

                {/* Screen Off */}
                <Button
                    variant="secondary"
                    onClick={toggleScreenOff}
                    style={{ width: '100%', gap: '0.5rem' }}
                >
                    <MonitorOff size={18} />
                    Screen Off Mode
                </Button>
            </Card>
        </motion.div>
    );
};
