import { useState, useEffect, useRef, useCallback } from 'react';

export type BreathingMode = 'box' | 'relax' | 'balance' | 'panic';

export interface BreathingConfig {
    inhale: number;
    holdIn?: number;
    exhale: number;
    holdOut?: number;
    name: string;
}

const CONFIGS: Record<BreathingMode, BreathingConfig> = {
    box: { inhale: 4000, holdIn: 4000, exhale: 4000, holdOut: 4000, name: 'Box Breathing' },
    relax: { inhale: 4000, holdIn: 7000, exhale: 8000, name: '4-7-8 Relax' },
    balance: { inhale: 5500, exhale: 5500, name: 'Coherent' },
    panic: { inhale: 3000, exhale: 6000, holdOut: 1000, name: 'Calm Down' }
};

export type BreathingPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out' | 'idle';

export function useBreathing(mode: BreathingMode = 'box') {
    const [phase, setPhase] = useState<BreathingPhase>('idle');
    const [isActive, setIsActive] = useState(false);
    const config = CONFIGS[mode];
    const timeoutRef = useRef<number | null>(null);
    const isActiveRef = useRef(isActive);

    // Keep ref in sync with state
    useEffect(() => {
        isActiveRef.current = isActive;
    }, [isActive]);

    const getNextPhaseAndDuration = useCallback((currentPhase: BreathingPhase): { next: BreathingPhase; duration: number } => {
        switch (currentPhase) {
            case 'inhale':
                return {
                    duration: config.inhale,
                    next: config.holdIn ? 'hold-in' : 'exhale'
                };
            case 'hold-in':
                return { duration: config.holdIn || 0, next: 'exhale' };
            case 'exhale':
                return {
                    duration: config.exhale,
                    next: config.holdOut ? 'hold-out' : 'inhale'
                };
            case 'hold-out':
                return { duration: config.holdOut || 0, next: 'inhale' };
            default:
                return { duration: 0, next: 'idle' };
        }
    }, [config]);

    const runCycle = useCallback((nextPhase: BreathingPhase) => {
        if (!isActiveRef.current) return;

        setPhase(nextPhase);
        const { duration, next } = getNextPhaseAndDuration(nextPhase);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = window.setTimeout(() => {
            if (isActiveRef.current) {
                runCycle(next);
            }
        }, duration);
    }, [getNextPhaseAndDuration]);

    const start = useCallback(() => {
        setIsActive(true);
        isActiveRef.current = true;
        runCycle('inhale');
    }, [runCycle]);

    const stop = useCallback(() => {
        setIsActive(false);
        isActiveRef.current = false;
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setPhase('idle');
    }, []);

    // Reset when mode changes
    useEffect(() => {
        stop();
    }, [mode, stop]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return { phase, isActive, start, stop, config };
}
