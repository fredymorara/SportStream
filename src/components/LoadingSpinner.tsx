import React from "react";
import { Cardio } from "ldrs/react";
import "ldrs/react/Cardio.css";

interface LoadingSpinnerProps {
  size?: string;
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "96",
  color = "currentColor",
}) => {
  const numericSize = size.replace(/\D/g, "") || "96";
  const validColor = color;

  return (
    <div className="flex min-h-[150px] h-full w-full items-center justify-center p-4 text-accent">
      <div
        role="status"
        aria-label="Loading"
        className="loading-spinner flex items-center justify-center"
      >
        <Cardio size={numericSize} stroke="2" speed="1" color={validColor} />
      </div>
    </div>
  );
};

export default LoadingSpinner;
