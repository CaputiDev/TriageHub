import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'text';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading,
  children,
  className = '',
  ...props
}) => {
  const baseStyle = "font-semibold rounded transition-colors cursor-pointer inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizeStyles = {
    sm: "py-1.5 px-3 text-[10px]",
    md: "py-2 px-4 text-xs",
    lg: "py-2.5 px-6 text-sm"
  };

  const variantStyles = {
    primary: "bg-secondary hover:opacity-90 text-white border-0",
    outline: "bg-bg-panel border border-secondary text-secondary hover:bg-secondary/10",
    text: "text-secondary hover:opacity-85 bg-transparent border-0 shadow-none font-medium"
  };

  return (
    <button
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? 'Aguarde...' : children}
    </button>
  );
};
export default Button;
