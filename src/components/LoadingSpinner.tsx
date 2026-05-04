import React, { useEffect } from 'react';
import { grid } from 'ldrs';

interface LoadingSpinnerProps {
  size?: string | number;
  color?: string;
  speed?: string | number;
}

// Explicitly register the custom element
grid.register();

// Extend the JSX Intrinsic Elements so TypeScript recognizes <l-grid>
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'l-grid': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        size?: string | number;
        color?: string;
        speed?: string | number;
      };
    }
  }
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = "60", 
  color = "#99ec09", // Brand neon color
  speed = "1.5" 
}) => {
  return (
    <div className="flex h-full w-full items-center justify-center p-4 min-h-[150px]">
      <l-grid
        size={size}
        speed={speed}
        color={color}
      />
    </div>
  );
};

export const MatchCardSkeleton: React.FC = () => {
  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl shadow-lg overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-slate-800"></div>
      <div className="p-4">
        <div className="h-6 bg-slate-800 rounded w-3/4 mb-2"></div>
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-6 h-6 bg-slate-800 rounded-full"></div>
          <div className="w-6 h-6 bg-slate-800 rounded-full"></div>
        </div>
        <div className="h-4 bg-slate-800 rounded w-1/2 mb-3"></div>
        <div className="w-full h-10 bg-slate-800 rounded-md mt-4"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;