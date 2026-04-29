import React, { useId } from 'react';

interface DownloadWalletBadgeProps {
  text: string;
  width?: number | string;
  height?: number | string;
}

const DownloadWalletBadge: React.FC<DownloadWalletBadgeProps> = ({
  text,
  width = 58,
  height = 20,
}) => {
  const id = useId(); // Generate unique ID for each instance
  const gradientId = `paint0_linear_${id}`;
  
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 58 20" fill="none">
      <path
        d="M4 4C4 1.79086 5.79086 0 8 0H54C56.2091 0 58 1.79086 58 4V16C58 18.2091 56.2091 20 54 20H8C5.79086 20 4 18.2091 4 16V12.7273L1.2118 10.8262C0.629583 10.4293 0.629583 9.57074 1.2118 9.17377L4 7.27273V4Z"
        fill={`url(#${gradientId})`}
      />
      <text
        x="30.5"
        y="11"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="10"
        fontFamily="Arial, sans-serif"
        fill="#141414"
      >
        {text}
      </text>
      <defs>
        <linearGradient
          id={gradientId}
          x1="6.5"
          y1="19.8864"
          x2="38.6691"
          y2="-16.2318"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E843FE" />
          <stop offset="0.235423" stopColor="white" />
          <stop offset="0.474546" stopColor="white" />
          <stop offset="0.766517" stopColor="white" />
          <stop offset="1" stopColor="#00FFCD" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default DownloadWalletBadge;