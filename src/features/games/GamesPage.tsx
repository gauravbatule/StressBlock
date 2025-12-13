import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../components/Card';
import { PatternMemoryGame, NumberMemoryGame, ReactionTimeGame } from './MemoryGames';
import { Hash, Grid3X3, ArrowLeft, Zap, Sparkles } from 'lucide-react';
import { Button } from '../../components/Button';
import { getMemoryScores } from '../../lib/storage';

type GameType = 'menu' | 'pattern' | 'number' | 'reaction';

export const GamesPage: React.FC = () => {
    const [currentGame, setCurrentGame] = useState<GameType>('menu');
    const [scores, setScores] = useState(getMemoryScores());

    useEffect(() => {
        if (currentGame === 'menu') {
            setScores(getMemoryScores());
        }
    }, [currentGame]);

    const games = [
        {
            id: 'pattern' as const,
            title: 'Pattern Memory',
            desc: 'Remember color sequences',
            icon: Grid3X3,
            gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
            benefit: 'Visual memory'
        },
        {
            id: 'number' as const,
            title: 'Number Recall',
            desc: 'Memorize digit sequences',
            icon: Hash,
            gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            benefit: 'Short-term memory'
        },
        {
            id: 'reaction' as const,
            title: 'Reaction Time',
            desc: 'Test your reflexes',
            icon: Zap,
            gradient: 'linear-gradient(135deg, #10b981, #059669)',
            benefit: 'Processing speed'
        },
    ];

    const renderGame = () => {
        switch (currentGame) {
            case 'pattern': return <PatternMemoryGame />;
            case 'number': return <NumberMemoryGame />;
            case 'reaction': return <ReactionTimeGame />;
            default: return null;
        }
    };

    const getGameHighScore = (gameId: string) => {
        const gameScores = scores.filter(s => s.game === `${gameId}_memory`);
        if (gameScores.length === 0) return null;
        return Math.max(...gameScores.map(s => s.score));
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ width: '100%', maxWidth: '500px' }}
        >
            {currentGame === 'menu' ? (
                <>
                    {/* Minimal Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        marginBottom: '1.25rem',
                    }}>
                        <Sparkles size={18} style={{ color: 'var(--color-accent-primary)' }} />
                        <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                            Train your brain daily
                        </span>
                    </div>

                    {/* Game Cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {games.map((game, index) => {
                            const Icon = game.icon;
                            const highScore = getGameHighScore(game.id);

                            return (
                                <motion.div
                                    key={game.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.06 }}
                                >
                                    <Card
                                        className="glass-panel clickable"
                                        onClick={() => setCurrentGame(game.id)}
                                        style={{ padding: '1rem', cursor: 'pointer' }}
                                    >
                                        <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                                            <div style={{
                                                width: '44px',
                                                height: '44px',
                                                borderRadius: 'var(--radius-md)',
                                                background: game.gradient,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                            }}>
                                                <Icon size={20} color="white" />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>
                                                        {game.title}
                                                    </h3>
                                                    {highScore !== null && (
                                                        <span style={{
                                                            fontSize: '0.7rem',
                                                            fontWeight: 600,
                                                            color: 'var(--color-text-muted)',
                                                            background: 'var(--color-bg-tertiary)',
                                                            padding: '0.2rem 0.5rem',
                                                            borderRadius: 'var(--radius-sm)'
                                                        }}>
                                                            Best: {game.id === 'reaction' ? `${1000 - highScore}ms` : highScore}
                                                        </span>
                                                    )}
                                                </div>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                                    {game.desc} · <span style={{ color: 'var(--color-accent-primary)' }}>{game.benefit}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Recent Activity - Compact */}
                    {scores.length > 0 && (
                        <div style={{ marginTop: '1.25rem' }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                                Recent
                            </p>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {scores.slice(0, 4).map((score, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            padding: '0.4rem 0.75rem',
                                            fontSize: '0.75rem',
                                            background: 'var(--color-bg-tertiary)',
                                            borderRadius: 'var(--radius-sm)',
                                            color: 'var(--color-text-secondary)'
                                        }}
                                    >
                                        {score.game === 'reaction_time' ? `${1000 - score.score}ms` : `Lv ${score.score}`}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentGame('menu')}
                        style={{ marginBottom: '1rem', gap: '0.4rem', padding: '0.5rem 0.75rem' }}
                    >
                        <ArrowLeft size={14} /> Back
                    </Button>

                    <Card className="glass-panel" style={{ padding: '1.25rem' }}>
                        {renderGame()}
                    </Card>
                </div>
            )}
        </motion.div>
    );
};
