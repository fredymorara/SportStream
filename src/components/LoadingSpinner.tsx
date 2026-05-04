import React from 'react';

interface LoadingSpinnerProps {
  size?: string;
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = "h-12 w-12", 
  color = "border-emerald-500" 
}) => {
  return (
    <div className="flex h-full w-full items-center justify-center p-4 min-h-[150px]">
      <div className={`${size} animate-spin rounded-full border-4 border-slate-800 ${color} border-t-transparent`}></div>
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