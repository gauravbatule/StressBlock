import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/Button';
import { Trophy, RotateCcw, Zap, Clock, Target } from 'lucide-react';
import { saveMemoryScore, getHighScore } from '../../lib/storage';

// Better color palette for games
const GAME_COLORS = {
    cyan: '#06b6d4',
    purple: '#8b5cf6',
    emerald: '#10b981',
    amber: '#f59e0b',
};

// ===== CHUNKED PATTERN MEMORY =====
export const PatternMemoryGame: React.FC = () => {
    const [sequence, setSequence] = useState<number[]>([]);
    const [userSequence, setUserSequence] = useState<number[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isShowingPattern, setIsShowingPattern] = useState(false);
    const [activeCell, setActiveCell] = useState<number | null>(null);
    const [level, setLevel] = useState(1);
    const [chunk, setChunk] = useState(1);
    const [chunksPerLevel] = useState(3);
    const [gameOver, setGameOver] = useState(false);
    const [highScore, setHighScore] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);

    // Refined color palette
    const colors = [GAME_COLORS.cyan, GAME_COLORS.purple, GAME_COLORS.emerald, GAME_COLORS.amber];
    const patternLength = level + 2;

    useEffect(() => {
        setHighScore(getHighScore('pattern_memory'));
    }, []);

    const generateSequence = useCallback((length: number) => {
        return Array.from({ length }, () => Math.floor(Math.random() * 4));
    }, []);

    const startGame = () => {
        setLevel(1);
        setChunk(1);
        setGameOver(false);
        setUserSequence([]);
        const newSequence = generateSequence(3);
        setSequence(newSequence);
        setIsPlaying(true);
        showPattern(newSequence);
    };

    const showPattern = async (pattern: number[]) => {
        setIsShowingPattern(true);
        setActiveCell(null);
        await new Promise(r => setTimeout(r, 400));

        for (let i = 0; i < pattern.length; i++) {
            setActiveCell(pattern[i]);
            await new Promise(r => setTimeout(r, 450 - Math.min(level * 15, 150)));
            setActiveCell(null);
            await new Promise(r => setTimeout(r, 120));
        }

        setIsShowingPattern(false);
    };

    const handleCellClick = (index: number) => {
        if (isShowingPattern || gameOver || !isPlaying) return;

        const newUserSequence = [...userSequence, index];
        setUserSequence(newUserSequence);
        setActiveCell(index);
        setTimeout(() => setActiveCell(null), 100);

        if (sequence[newUserSequence.length - 1] !== index) {
            setGameOver(true);
            setIsPlaying(false);
            const score = (level - 1) * chunksPerLevel + chunk;
            if (score > highScore) {
                saveMemoryScore('pattern_memory', score);
                setHighScore(score);
            }
            return;
        }

        if (newUserSequence.length === sequence.length) {
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                setUserSequence([]);

                if (chunk >= chunksPerLevel) {
                    setLevel(prev => prev + 1);
                    setChunk(1);
                    const newSequence = generateSequence(patternLength + 1);
                    setSequence(newSequence);
                    showPattern(newSequence);
                } else {
                    setChunk(prev => prev + 1);
                    const newSequence = generateSequence(patternLength);
                    setSequence(newSequence);
                    showPattern(newSequence);
                }
            }, 500);
        }
    };

    return (
        <div className="game-area" style={{ textAlign: 'center' }}>
            {/* Compact Stats */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem',
                fontSize: '0.8rem'
            }}>
                <span style={{ color: 'var(--color-text-muted)' }}>
                    Lv <strong style={{ color: GAME_COLORS.cyan }}>{level}</strong>
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                    {Array.from({ length: chunksPerLevel }).map((_, i) => (
                        <div
                            key={i}
                            style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: i < chunk ? GAME_COLORS.cyan : 'var(--color-bg-tertiary)',
                            }}
                        />
                    ))}
                </div>
                <span style={{ color: 'var(--color-text-muted)' }}>
                    <Trophy size={12} style={{ marginRight: '2px' }} />{highScore}
                </span>
            </div>

            {/* Game Grid - Refined */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px',
                marginBottom: '1rem',
                maxWidth: '180px',
                margin: '0 auto 1rem',
            }}>
                {colors.map((color, index) => (
                    <motion.div
                        key={index}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCellClick(index)}
                        style={{
                            aspectRatio: '1',
                            borderRadius: '12px',
                            background: activeCell === index ? color : `${color}20`,
                            border: `2px solid ${color}50`,
                            cursor: isShowingPattern ? 'not-allowed' : 'pointer',
                            transition: 'all 0.08s ease',
                            boxShadow: activeCell === index ? `0 0 16px ${color}40` : 'none',
                        }}
                    />
                ))}
            </div>

            {/* Status */}
            <AnimatePresence mode="wait">
                {!isPlaying && !gameOver && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Button onClick={startGame} size="sm" style={{ gap: '0.4rem' }}>
                            <Zap size={14} /> Start
                        </Button>
                    </motion.div>
                )}
                {isShowingPattern && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ color: GAME_COLORS.cyan, fontSize: '0.85rem' }}>Watch...</motion.p>
                )}
                {isPlaying && !isShowingPattern && !gameOver && !showSuccess && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                        Tap ({userSequence.length}/{sequence.length})
                    </motion.p>
                )}
                {showSuccess && (
                    <motion.p initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                        style={{ color: GAME_COLORS.emerald, fontWeight: 600, fontSize: '0.85rem' }}>✓</motion.p>
                )}
                {gameOver && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <p style={{ color: '#ef4444', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                            Score: {(level - 1) * chunksPerLevel + chunk}
                        </p>
                        <Button onClick={startGame} variant="secondary" size="sm" style={{ gap: '0.3rem' }}>
                            <RotateCcw size={12} /> Retry
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ===== NUMBER MEMORY =====  
export const NumberMemoryGame: React.FC = () => {
    const [number, setNumber] = useState('');
    const [userInput, setUserInput] = useState('');
    const [phase, setPhase] = useState<'idle' | 'show' | 'input' | 'result'>('idle');
    const [level, setLevel] = useState(1);
    const [streak, setStreak] = useState(0);
    const [streakTarget] = useState(3);
    const [isCorrect, setIsCorrect] = useState(false);
    const [highScore, setHighScore] = useState(0);

    useEffect(() => {
        setHighScore(getHighScore('number_memory'));
    }, []);

    const generateNumber = (digits: number) => {
        let result = '';
        for (let i = 0; i < digits; i++) {
            result += Math.floor(Math.random() * 10).toString();
        }
        return result;
    };

    const startGame = () => {
        setLevel(1);
        setStreak(0);
        nextRound(1);
    };

    const nextRound = async (currentLevel: number) => {
        const digits = currentLevel + 2;
        const newNumber = generateNumber(digits);
        setNumber(newNumber);
        setUserInput('');
        setPhase('show');
        await new Promise(r => setTimeout(r, 700 + digits * 350));
        setPhase('input');
    };

    const handleSubmit = () => {
        if (userInput === number) {
            setIsCorrect(true);
            setPhase('result');
            const newStreak = streak + 1;
            setStreak(newStreak);

            setTimeout(() => {
                if (newStreak >= streakTarget) {
                    const nextLevel = level + 1;
                    setLevel(nextLevel);
                    setStreak(0);
                    nextRound(nextLevel);
                } else {
                    nextRound(level);
                }
            }, 600);
        } else {
            setIsCorrect(false);
            setPhase('result');
            const score = (level - 1) * streakTarget + streak;
            if (score > highScore) {
                saveMemoryScore('number_memory', score);
                setHighScore(score);
            }
        }
    };

    return (
        <div className="game-area" style={{ textAlign: 'center' }}>
            {/* Compact Stats */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem',
                fontSize: '0.8rem'
            }}>
                <span style={{ color: 'var(--color-text-muted)' }}>
                    <strong style={{ color: GAME_COLORS.purple }}>{level + 2}</strong> digits
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                    {Array.from({ length: streakTarget }).map((_, i) => (
                        <div
                            key={i}
                            style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: i < streak ? GAME_COLORS.purple : 'var(--color-bg-tertiary)',
                            }}
                        />
                    ))}
                </div>
                <span style={{ color: 'var(--color-text-muted)' }}>
                    <Trophy size={12} style={{ marginRight: '2px' }} />{highScore}
                </span>
            </div>

            <AnimatePresence mode="wait">
                {phase === 'idle' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Button onClick={startGame} size="sm" style={{ gap: '0.4rem' }}>
                            <Zap size={14} /> Start
                        </Button>
                    </motion.div>
                )}

                {phase === 'show' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            padding: '1.25rem',
                            background: 'var(--color-bg-tertiary)',
                            borderRadius: '12px',
                        }}
                    >
                        <p style={{
                            fontSize: Math.max(1.1, 2 - number.length * 0.1) + 'rem',
                            fontWeight: 700,
                            fontVariantNumeric: 'tabular-nums',
                            letterSpacing: '0.12em',
                            color: GAME_COLORS.purple
                        }}>
                            {number}
                        </p>
                    </motion.div>
                )}

                {phase === 'input' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <input
                            type="tel"
                            inputMode="numeric"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value.replace(/\D/g, ''))}
                            placeholder="?"
                            autoFocus
                            style={{
                                width: '100%',
                                maxWidth: '200px',
                                padding: '0.6rem',
                                fontSize: '1.1rem',
                                textAlign: 'center',
                                background: 'var(--color-bg-tertiary)',
                                border: `2px solid ${GAME_COLORS.purple}40`,
                                borderRadius: '10px',
                                color: 'var(--color-text-primary)',
                                marginBottom: '0.6rem',
                                fontVariantNumeric: 'tabular-nums',
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        />
                        <br />
                        <Button onClick={handleSubmit} disabled={!userInput} size="sm">Go</Button>
                    </motion.div>
                )}

                {phase === 'result' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {isCorrect ? (
                            <p style={{ color: GAME_COLORS.emerald, fontWeight: 600, fontSize: '0.85rem' }}>✓</p>
                        ) : (
                            <div>
                                <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>
                                    It was <strong>{number}</strong>
                                </p>
                                <Button onClick={startGame} variant="secondary" size="sm" style={{ marginTop: '0.5rem', gap: '0.3rem' }}>
                                    <RotateCcw size={12} /> Retry
                                </Button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ===== REACTION TIME =====
export const ReactionTimeGame: React.FC = () => {
    const [phase, setPhase] = useState<'idle' | 'wait' | 'click' | 'result' | 'early'>('idle');
    const [startTime, setStartTime] = useState(0);
    const [reactionTime, setReactionTime] = useState(0);
    const [attempts, setAttempts] = useState<number[]>([]);
    const [highScore, setHighScore] = useState(0);

    useEffect(() => {
        setHighScore(getHighScore('reaction_time'));
    }, []);

    const startGame = () => {
        setPhase('wait');
        const delay = 1200 + Math.random() * 2500;
        setTimeout(() => {
            setPhase('click');
            setStartTime(Date.now());
        }, delay);
    };

    const handleClick = () => {
        if (phase === 'wait') {
            setPhase('early');
            return;
        }
        if (phase === 'click') {
            const time = Date.now() - startTime;
            setReactionTime(time);
            setAttempts([...attempts, time]);
            setPhase('result');

            const bestTime = Math.min(...[...attempts, time]);
            if (highScore === 0 || bestTime < highScore) {
                saveMemoryScore('reaction_time', 1000 - bestTime);
                setHighScore(bestTime);
            }
        }
    };

    const avgTime = attempts.length > 0
        ? Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length)
        : 0;

    return (
        <div className="game-area" style={{ textAlign: 'center' }}>
            {/* Compact Stats */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem',
                fontSize: '0.8rem'
            }}>
                <span style={{ color: 'var(--color-text-muted)' }}>
                    <strong style={{ color: GAME_COLORS.emerald }}>{attempts.length}</strong> tries
                </span>
                <span style={{ color: 'var(--color-text-muted)' }}>
                    Avg: {avgTime}ms
                </span>
                <span style={{ color: 'var(--color-text-muted)' }}>
                    <Clock size={12} style={{ marginRight: '2px' }} />{highScore || '-'}ms
                </span>
            </div>

            <motion.div
                onClick={handleClick}
                whileTap={{ scale: 0.98 }}
                style={{
                    width: '100%',
                    height: '150px',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    background: phase === 'wait' ? '#ef4444' :
                        phase === 'click' ? GAME_COLORS.emerald :
                            phase === 'early' ? GAME_COLORS.amber : 'var(--color-bg-tertiary)',
                    transition: 'background 0.08s',
                }}
            >
                <AnimatePresence mode="wait">
                    {phase === 'idle' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Button onClick={(e) => { e.stopPropagation(); startGame(); }} size="sm">
                                <Target size={14} /> Start
                            </Button>
                        </motion.div>
                    )}
                    {phase === 'wait' && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            style={{ color: 'white', fontSize: '1rem', fontWeight: 600 }}>
                            Wait...
                        </motion.p>
                    )}
                    {phase === 'click' && (
                        <motion.p initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                            style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700 }}>
                            TAP!
                        </motion.p>
                    )}
                    {phase === 'early' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <p style={{ color: 'white', fontWeight: 600, marginBottom: '0.4rem' }}>Too early</p>
                            <Button onClick={(e) => { e.stopPropagation(); startGame(); }} variant="secondary" size="sm">
                                Retry
                            </Button>
                        </motion.div>
                    )}
                    {phase === 'result' && (
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                            <p style={{ color: GAME_COLORS.cyan, fontSize: '1.75rem', fontWeight: 700 }}>{reactionTime}ms</p>
                            <Button onClick={(e) => { e.stopPropagation(); startGame(); }} variant="ghost" size="sm">
                                Again
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};
