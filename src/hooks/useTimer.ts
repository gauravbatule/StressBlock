import { useState, useEffect, useRef } from 'react';

export function useTimer(initialMinutes: number, onComplete?: () => void) {
    const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
    const [isActive, setIsActive] = useState(false);
    const [initialTime, setInitialTime] = useState(initialMinutes * 60);

    const timerRef = useRef<number | null>(null);

    const start = () => setIsActive(true);
    const pause = () => setIsActive(false);
    const reset = (newDescriptionMinutes?: number) => {
        setIsActive(false);
        const time = (newDescriptionMinutes || initialMinutes) * 60;
        setInitialTime(time);
        setTimeLeft(time);
    };

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = window.setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            if (onComplete) onComplete();
            if (timerRef.current) clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive, timeLeft, onComplete]);

    const progress = ((initialTime - timeLeft) / initialTime) * 100;

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return {
        timeLeft,
        isActive,
        start,
        pause,
        reset,
        progress,
        formattedTime: formatTime(timeLeft)
    };
}
