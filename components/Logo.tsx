import React from 'react';

export const MedAILogo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      aria-label="Med AI Logo"
    >
      <defs>
        {/* Mask to create the keyhole cutout effect */}
        <mask id="keyhole-cutout">
          <rect x="0" y="0" width="100" height="100" fill="white" />
          <circle cx="65" cy="42" r="10" fill="black" />
          <rect x="62" y="50" width="6" height="35" rx="3" fill="black" />
        </mask>
      </defs>

      <g mask="url(#keyhole-cutout)">
        {/* Orange Human Head Profile (Left Side) */}
        <path 
          d="M45 10 C 25 10 15 30 15 45 C 15 50 5 55 5 65 C 5 70 12 72 12 75 C 12 80 15 82 15 90 L 30 90 L 30 95 C 35 100 55 100 60 95 V 90 L 60 10 Z" 
          fill="#FF5722"
          stroke="none"
        />

        {/* Green Brain Shape (Right Side/Back of Head) */}
        <path 
          d="M45 10 C 70 10 90 20 95 45 C 98 60 90 80 80 90 C 70 98 60 95 60 95 V 10 Z" 
          fill="#00C853" 
          stroke="none"
        />
      </g>
    </svg>
  );
};