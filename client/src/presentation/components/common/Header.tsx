import React from 'react';
import logoUrl from '../../../assets/logo.png';
import { ArrowLeft } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  userName?: string;
  onBack?: () => void;
  showThemeToggle?: boolean;
  rightActions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  userName,
  onBack,
  showThemeToggle = true,
  rightActions
}) => {
  return (
    <header className="border-b border-border-subtle bg-bg-panel px-6 py-3.5 flex items-center justify-between sticky top-0 z-10 transition-colors">
      <div className="flex items-center space-x-3">
        {onBack && (
          <button
            onClick={onBack}
            className="p-1 hover:bg-secondary/10 border border-transparent rounded transition-colors cursor-pointer flex items-center justify-center bg-transparent text-secondary"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div className="flex items-center space-x-2">
          <img src={logoUrl} alt="TriageHub" className="w-5 h-5 object-contain opacity-80" />
          <h1 className="text-xs font-bold text-text-main uppercase tracking-wider">TriageHub</h1>
        </div>
      </div>
      <div className="text-[11px] text-text-muted flex items-center gap-3">
        {userName && <span>{userName}</span>}
        {showThemeToggle && <ThemeToggle />}
        {rightActions}
      </div>
    </header>
  );
};
export default Header;
