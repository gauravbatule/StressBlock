import { useRef, useState, useEffect } from 'react';

export type NoiseType = 'white' | 'pink' | 'brown';

export function useNoise() {
    const audioContextRef = useRef<AudioContext | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentType, setCurrentType] = useState<NoiseType>('brown');
    const [volume, setVolume] = useState(0.5);

    const initAudio = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return audioContextRef.current;
    };

    const createNoiseBuffer = (ctx: AudioContext, type: NoiseType) => {
        const bufferSize = 2 * ctx.sampleRate; // 2 seconds buffer
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;

            if (type === 'white') {
                output[i] = white;
            } else if (type === 'pink') {
                output[i] = (Math.random() * 2 - 1) * 0.5;
            } else if (type === 'brown') {
                const lastOut = i > 0 ? output[i - 1] : 0;
                output[i] = (lastOut + (0.02 * white)) / 1.02;
                output[i] *= 3.5;
            }
        }
        return buffer;
    };

    const play = (type: NoiseType = currentType) => {
        const ctx = initAudio();
        if (ctx.state === 'suspended') ctx.resume();

        stop();
        setCurrentType(type);

        const buffer = createNoiseBuffer(ctx, type);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const gainNode = ctx.createGain();
        gainNode.gain.value = volume;
        source.connect(gainNode);
        gainNode.connect(ctx.destination);

        gainNodeRef.current = gainNode;
        (gainNodeRef.current as any).source = source; // Attach source for stopping
        source.start();
        setIsPlaying(true);
    };

    const stop = () => {
        if (gainNodeRef.current) {
            try {
                (gainNodeRef.current as any).source.stop();
            } catch (e) { /* ignore */ }
            gainNodeRef.current.disconnect();
            gainNodeRef.current = null;
        }
        setIsPlaying(false);
    };

    const toggle = () => isPlaying ? stop() : play();

    const changeVolume = (val: number) => {
        setVolume(val);
        if (gainNodeRef.current) {
            gainNodeRef.current.gain.value = val;
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => stop();
    }, []);

    return { isPlaying, play, stop, toggle, volume, changeVolume, currentType };
}
