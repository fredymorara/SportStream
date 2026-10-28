import React from "react";
import { Cardio } from "ldrs/react";
import "ldrs/react/Cardio.css";

interface LoadingSpinnerProps {
  size?: string;
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "500",
  color = "#10B981",
}) => {
  // Ensure size is just numbers, otherwise default to 50
  const numericSize = size.replace(/\D/g, "") || "500";
  // Ensure color is hex
  const validColor = color.startsWith("#") ? color : "#10B981";

  return (
    <div className="flex h-full w-full items-center justify-center p-4 min-h-[150px]">
      <div
        role="status"
        aria-label="Loading"
        className="cardio-loader-scale flex items-center justify-center"
      >
        <Cardio size={numericSize} stroke="2" speed="1" color={validColor} />
      </div>
    </div>
  );
};

export const MatchCardSkeleton: React.FC = () => {
  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl shadow-lg overflow-hidden">
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
