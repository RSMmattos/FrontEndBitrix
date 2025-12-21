
import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ children, className = "", icon }) => {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-sm transition-all duration-300 gap-2 ${className}`}>
      {icon && <span className="opacity-80">{icon}</span>}
      {children}
    </span>
  );
};
