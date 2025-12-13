import React, { useState } from 'react';
import { Button } from '../../components/Button';
import { motion, AnimatePresence } from 'framer-motion';

export const GroundingExercise: React.FC = () => {
    const [step, setStep] = useState(0);

    const steps = [
        { count: 5, text: "Acknowledge 5 things you see around you.", color: '#38bdf8' },
        { count: 4, text: "Acknowledge 4 things you can touch.", color: '#818cf8' },
        { count: 3, text: "Acknowledge 3 things you can hear.", color: '#c084fc' },
        { count: 2, text: "Acknowledge 2 things you can smell.", color: '#f472b6' },
        { count: 1, text: "Acknowledge 1 thing you can taste.", color: '#fb7185' }
    ];

    const currentStep = steps[step];
    const isFinished = step >= steps.length;

    const next = () => {
        if (step < steps.length) setStep(step + 1);
    };

    const reset = () => setStep(0);

    if (isFinished) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <h3 className="text-gradient">You are here. You are safe.</h3>
                <Button onClick={reset} style={{ marginTop: '1rem' }} variant="ghost">Restart</Button>
            </div>
        );
    }

    return (
        <div style={{ textAlign: 'center', padding: '1rem' }}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                >
                    <div style={{
                        fontSize: '4rem',
                        fontWeight: 800,
                        color: currentStep.color,
                        marginBottom: '0.5rem'
                    }}>
                        {currentStep.count}
                    </div>
                    <p style={{ fontSize: '1.2rem', marginBottom: '2rem', height: '60px' }}>
                        {currentStep.text}
                    </p>
                </motion.div>
            </AnimatePresence>
            <Button onClick={next} size="lg" className="btn-glow">Done</Button>
        </div>
    );
};
