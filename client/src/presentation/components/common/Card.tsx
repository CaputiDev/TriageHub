import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`p-6 bg-bg-panel border border-border-subtle rounded-lg ${className}`}>
      {children}
    </div>
  );
};
export default Card;
