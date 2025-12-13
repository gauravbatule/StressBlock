import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BreathingPhase, BreathingConfig } from '../../hooks/useBreathing';

interface BreathingVisualizerProps {
    phase: BreathingPhase;
    config: BreathingConfig;
}

export const BreathingVisualizer: React.FC<BreathingVisualizerProps> = ({ phase, config }) => {
    const getScale = () => {
        switch (phase) {
            case 'inhale': return 1.6;
            case 'hold-in': return 1.6;
            case 'exhale': return 1.0;
            case 'hold-out': return 1.0;
            default: return 1.0;
        }
    };

    const getDuration = () => {
        switch (phase) {
            case 'inhale': return config.inhale / 1000;
            case 'exhale': return config.exhale / 1000;
            case 'hold-in': return 0.3;
            case 'hold-out': return 0.3;
            default: return 0.3;
        }
    };

    const getText = () => {
        switch (phase) {
            case 'inhale': return 'Breathe In';
            case 'hold-in': return 'Hold';
            case 'exhale': return 'Breathe Out';
            case 'hold-out': return 'Hold';
            default: return 'Tap Start';
        }
    };

    const isActive = phase !== 'idle';

    return (
        <div style={{
            position: 'relative',
            width: '280px',
            height: '280px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {/* Ambient Glow Layers */}
            <motion.div
                animate={{
                    scale: isActive ? [1, 1.15, 1] : 1,
                    opacity: isActive ? 0.4 : 0.2,
                }}
                transition={{
                    duration: 3,
                    repeat: isActive ? Infinity : 0,
                    ease: "easeInOut"
                }}
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(56, 189, 248, 0.3) 0%, transparent 70%)',
                    filter: 'blur(30px)',
                    zIndex: 0
                }}
            />

            {/* Secondary Glow */}
            <motion.div
                animate={{
                    scale: isActive ? (phase === 'inhale' || phase === 'hold-in' ? 1.3 : 1) : 1,
                    opacity: isActive ? 0.5 : 0.25,
                }}
                transition={{ duration: getDuration(), ease: "easeInOut" }}
                style={{
                    position: 'absolute',
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(129, 140, 248, 0.25) 0%, transparent 60%)',
                    filter: 'blur(20px)',
                    zIndex: 1
                }}
            />

            {/* Main Circle */}
            <motion.div
                animate={{
                    scale: getScale(),
                }}
                transition={{
                    duration: getDuration(),
                    ease: [0.4, 0, 0.2, 1]
                }}
                style={{
                    width: '140px',
                    height: '140px',
                    borderRadius: '50%',
                    background: 'linear-gradient(145deg, #38bdf8, #818cf8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isActive
                        ? '0 0 50px rgba(56, 189, 248, 0.6), inset 0 0 30px rgba(255,255,255,0.15)'
                        : '0 0 30px rgba(56, 189, 248, 0.3)',
                    zIndex: 10,
                    position: 'relative'
                }}
            >
                {/* Inner Pulse Ring */}
                <motion.div
                    animate={{
                        scale: isActive ? [1, 1.1, 1] : 1,
                        opacity: isActive ? [0.3, 0.6, 0.3] : 0.2,
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.3)',
                    }}
                />

                {/* Text */}
                <AnimatePresence mode="wait">
                    <motion.span
                        key={phase}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            color: 'white',
                            textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                            letterSpacing: '-0.02em'
                        }}
                    >
                        {getText()}
                    </motion.span>
                </AnimatePresence>
            </motion.div>

            {/* Ripple Effects for Exhale */}
            <AnimatePresence>
                {phase === 'exhale' && (
                    <>
                        <motion.div
                            key="ripple1"
                            initial={{ scale: 1, opacity: 0.6 }}
                            animate={{ scale: 2.5, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                            style={{
                                position: 'absolute',
                                width: '140px',
                                height: '140px',
                                borderRadius: '50%',
                                border: '2px solid var(--color-accent-secondary)',
                                zIndex: 5
                            }}
                        />
                        <motion.div
                            key="ripple2"
                            initial={{ scale: 1, opacity: 0.4 }}
                            animate={{ scale: 2.2, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 2, delay: 0.5, repeat: Infinity, ease: "easeOut" }}
                            style={{
                                position: 'absolute',
                                width: '140px',
                                height: '140px',
                                borderRadius: '50%',
                                border: '1px solid var(--color-accent-primary)',
                                zIndex: 4
                            }}
                        />
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
