import React from 'react';
import '../styles/components.css';

interface CardProps {
    children: React.ReactNode;
    title?: string;
    className?: string;
    onClick?: () => void;
    style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ children, title, className, onClick, style }) => {
    return (
        <div className={`card glass-panel ${className || ''}`} onClick={onClick} style={style}>
            {title && <h3 className="card-title">{title}</h3>}
            <div className="card-content">
                {children}
            </div>
        </div>
    );
};
