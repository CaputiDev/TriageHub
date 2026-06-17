import React, { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, className = '', ...props }, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-[9px] font-semibold text-text-muted uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={`w-full px-3 py-2 text-xs bg-bg-panel border border-border-subtle rounded focus:outline-none focus:border-secondary text-text-main placeholder-text-muted resize-none transition-colors ${className}`}
        {...props}
      />
    </div>
  );
});

Textarea.displayName = 'Textarea';
export default Textarea;
