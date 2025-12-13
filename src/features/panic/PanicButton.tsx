import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';

export const PanicButton: React.FC = () => {
    const navigate = useNavigate();

    const handlePanic = () => {
        // Navigate to breathing with panic mode state or query param
        // For now, we will just navigate and let the user select or default
        // In a real app, we'd pass state: { mode: 'panic' }
        navigate('/breathing');
        // Ideally we would force the state, but our BreathingPage currently sets state locally.
        // We can refactor BreathingPage later to read from location state if needed.
    };

    return (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 100 }}>
            <Button
                variant="danger"
                size="lg"
                onClick={handlePanic}
                style={{
                    borderRadius: '50px',
                    padding: '1rem 2rem',
                    boxShadow: '0 4px 20px rgba(239, 68, 68, 0.5)',
                    fontWeight: 800,
                    letterSpacing: '1px'
                }}
            >
                PANIC
            </Button>
        </div>
    );
};
