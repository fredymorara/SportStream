import React from "react";
import { Cardio } from "ldrs/react";
import "ldrs/react/Cardio.css";

interface LoadingSpinnerProps {
  size?: string;
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "96",
  color = "#00f076",
}) => {
  const numericSize = size.replace(/\D/g, "") || "96";
  const validColor = color.startsWith("#") ? color : "#00f076";

  return (
    <div className="flex h-full w-full items-center justify-center p-4 min-h-[150px]">
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
