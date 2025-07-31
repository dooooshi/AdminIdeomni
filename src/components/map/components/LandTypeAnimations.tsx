import React from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import { MapTile } from '../types';
import { findAdjacentSameLandType, getDirectionAngle } from '../utils/hexUtils';

interface LandTypeAnimationsProps {
  tile: MapTile;
  allTiles: MapTile[];
  position: { x: number; y: number };
  hexSize: number;
}

/**
 * Component for rendering business-sense animations for land tiles
 * - Marine tiles: Ocean wave connections between adjacent marine tiles
 * - Coastal tiles: Shoreline shimmer effects
 * - Plain tiles: Wind-through-grass animation for adjacent plain areas
 */
const LandTypeAnimations: React.FC<LandTypeAnimationsProps> = ({
  tile,
  allTiles,
  position,
  hexSize
}) => {
  const theme = useTheme();
  const adjacentSameTiles = findAdjacentSameLandType(tile, allTiles);

  // Only render animations if there are adjacent tiles of the same type
  if (adjacentSameTiles.length === 0) {
    return null;
  }

  const renderMarineAnimations = () => {
    return (
      <g>
        {/* Ocean wave patterns connecting to adjacent marine tiles */}
        {adjacentSameTiles.map((adjacentTile, index) => {
          const angle = getDirectionAngle(tile, adjacentTile);
          const waveId = `marine-wave-${tile.id}-${adjacentTile.id}`;
          
          return (
            <g key={adjacentTile.id}>
              {/* Flowing wave animation toward adjacent marine tile */}
              <defs>
                <linearGradient id={waveId} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={alpha('#1e3a8a', 0.3)}>
                    <animate
                      attributeName="stop-opacity"
                      values="0.1;0.6;0.1"
                      dur="3s"
                      repeatCount="indefinite"
                      begin={`${index * 0.5}s`}
                    />
                  </stop>
                  <stop offset="50%" stopColor={alpha('#3b82f6', 0.4)}>
                    <animate
                      attributeName="stop-opacity"
                      values="0.2;0.8;0.2"
                      dur="3s"
                      repeatCount="indefinite"
                      begin={`${index * 0.5}s`}
                    />
                  </stop>
                  <stop offset="100%" stopColor={alpha('#1e3a8a', 0.2)}>
                    <animate
                      attributeName="stop-opacity"
                      values="0.1;0.5;0.1"
                      dur="3s"
                      repeatCount="indefinite"
                      begin={`${index * 0.5}s`}
                    />
                  </stop>
                </linearGradient>
              </defs>
              
              {/* Wave flow line toward adjacent tile */}
              <line
                x1={position.x}
                y1={position.y}
                x2={position.x + Math.cos((angle - 90) * Math.PI / 180) * hexSize * 0.7}
                y2={position.y + Math.sin((angle - 90) * Math.PI / 180) * hexSize * 0.7}
                stroke={`url(#${waveId})`}
                strokeWidth="2"
                opacity="0.6"
              >
                <animate
                  attributeName="stroke-width"
                  values="1;3;1"
                  dur="4s"
                  repeatCount="indefinite"
                  begin={`${index * 0.3}s`}
                />
              </line>
              
              {/* Small wave ripples */}
              <circle
                cx={position.x + Math.cos((angle - 90) * Math.PI / 180) * hexSize * 0.4}
                cy={position.y + Math.sin((angle - 90) * Math.PI / 180) * hexSize * 0.4}
                r="2"
                fill={alpha('#3b82f6', 0.3)}
              >
                <animate
                  attributeName="r"
                  values="1;4;1"
                  dur="2.5s"
                  repeatCount="indefinite"
                  begin={`${index * 0.7}s`}
                />
                <animate
                  attributeName="opacity"
                  values="0.8;0.2;0.8"
                  dur="2.5s"
                  repeatCount="indefinite"
                  begin={`${index * 0.7}s`}
                />
              </circle>
            </g>
          );
        })}
      </g>
    );
  };

  const renderCoastalAnimations = () => {
    return (
      <g>
        {/* Shoreline shimmer effects connecting to adjacent coastal tiles */}
        {adjacentSameTiles.map((adjacentTile, index) => {
          const angle = getDirectionAngle(tile, adjacentTile);
          const shimmerId = `coastal-shimmer-${tile.id}-${adjacentTile.id}`;
          
          return (
            <g key={adjacentTile.id}>
              {/* Shoreline connection with shimmer effect */}
              <defs>
                <linearGradient id={shimmerId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={alpha('#2196F3', 0.2)}>
                    <animate
                      attributeName="stop-opacity"
                      values="0.1;0.7;0.1"
                      dur="4s"
                      repeatCount="indefinite"
                      begin={`${index * 0.6}s`}
                    />
                  </stop>
                  <stop offset="50%" stopColor={alpha('#81D4FA', 0.4)}>
                    <animate
                      attributeName="stop-opacity"
                      values="0.2;0.9;0.2"
                      dur="4s"
                      repeatCount="indefinite"
                      begin={`${index * 0.6}s`}
                    />
                  </stop>
                  <stop offset="100%" stopColor={alpha('#2196F3', 0.3)}>
                    <animate
                      attributeName="stop-opacity"
                      values="0.1;0.6;0.1"
                      dur="4s"
                      repeatCount="indefinite"
                      begin={`${index * 0.6}s`}
                    />
                  </stop>
                </linearGradient>
              </defs>
              
              {/* Curved shoreline effect */}
              <path
                d={`M ${position.x} ${position.y} Q ${position.x + Math.cos((angle - 90) * Math.PI / 180) * hexSize * 0.5} ${position.y + Math.sin((angle - 90) * Math.PI / 180) * hexSize * 0.3} ${position.x + Math.cos((angle - 90) * Math.PI / 180) * hexSize * 0.8} ${position.y + Math.sin((angle - 90) * Math.PI / 180) * hexSize * 0.8}`}
                stroke={`url(#${shimmerId})`}
                strokeWidth="1.5"
                fill="none"
                opacity="0.7"
              >
                <animate
                  attributeName="stroke-width"
                  values="1;2.5;1"
                  dur="3.5s"
                  repeatCount="indefinite"
                  begin={`${index * 0.4}s`}
                />
              </path>
              
              {/* Foam bubbles */}
              <ellipse
                cx={position.x + Math.cos((angle - 90) * Math.PI / 180) * hexSize * 0.3}
                cy={position.y + Math.sin((angle - 90) * Math.PI / 180) * hexSize * 0.3}
                rx="1.5"
                ry="1"
                fill={alpha('#E1F5FE', 0.6)}
              >
                <animate
                  attributeName="rx"
                  values="0.5;2.5;0.5"
                  dur="3s"
                  repeatCount="indefinite"
                  begin={`${index * 0.8}s`}
                />
                <animate
                  attributeName="opacity"
                  values="0.9;0.3;0.9"
                  dur="3s"
                  repeatCount="indefinite"
                  begin={`${index * 0.8}s`}
                />
              </ellipse>
            </g>
          );
        })}
      </g>
    );
  };

  const renderPlainAnimations = () => {
    return (
      <g>
        {/* Wind-through-grass effects connecting to adjacent plain tiles */}
        {adjacentSameTiles.map((adjacentTile, index) => {
          const angle = getDirectionAngle(tile, adjacentTile);
          const windId = `plain-wind-${tile.id}-${adjacentTile.id}`;
          
          return (
            <g key={adjacentTile.id}>
              {/* Wind flow pattern */}
              <defs>
                <linearGradient id={windId} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={alpha('#4CAF50', 0.2)}>
                    <animate
                      attributeName="stop-opacity"
                      values="0.1;0.5;0.1"
                      dur="5s"
                      repeatCount="indefinite"
                      begin={`${index * 0.7}s`}
                    />
                  </stop>
                  <stop offset="50%" stopColor={alpha('#8BC34A', 0.3)}>
                    <animate
                      attributeName="stop-opacity"
                      values="0.2;0.7;0.2"
                      dur="5s"
                      repeatCount="indefinite"
                      begin={`${index * 0.7}s`}
                    />
                  </stop>
                  <stop offset="100%" stopColor={alpha('#4CAF50', 0.1)}>
                    <animate
                      attributeName="stop-opacity"
                      values="0.1;0.4;0.1"
                      dur="5s"
                      repeatCount="indefinite"
                      begin={`${index * 0.7}s`}
                    />
                  </stop>
                </linearGradient>
              </defs>
              
              {/* Curved wind path */}
              <path
                d={`M ${position.x} ${position.y} Q ${position.x + Math.cos((angle - 90) * Math.PI / 180) * hexSize * 0.4} ${position.y + Math.sin((angle - 90) * Math.PI / 180) * hexSize * 0.2} ${position.x + Math.cos((angle - 90) * Math.PI / 180) * hexSize * 0.7} ${position.y + Math.sin((angle - 90) * Math.PI / 180) * hexSize * 0.7}`}
                stroke={`url(#${windId})`}
                strokeWidth="1"
                fill="none"
                opacity="0.5"
                strokeDasharray="2,1"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  values="0;6;0"
                  dur="4s"
                  repeatCount="indefinite"
                  begin={`${index * 0.5}s`}
                />
              </path>
              
              {/* Grass sway indicators */}
              <g transform={`translate(${position.x + Math.cos((angle - 90) * Math.PI / 180) * hexSize * 0.35}, ${position.y + Math.sin((angle - 90) * Math.PI / 180) * hexSize * 0.35})`}>
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="-3"
                  stroke={alpha('#66BB6A', 0.4)}
                  strokeWidth="0.8"
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    values="0;8;-5;0"
                    dur="6s"
                    repeatCount="indefinite"
                    begin={`${index * 0.9}s`}
                  />
                </line>
                <line
                  x1="2"
                  y1="0"
                  x2="2"
                  y2="-2.5"
                  stroke={alpha('#66BB6A', 0.3)}
                  strokeWidth="0.6"
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    values="0;-6;10;0"
                    dur="6.5s"
                    repeatCount="indefinite"
                    begin={`${index * 0.9 + 0.3}s`}
                  />
                </line>
              </g>
            </g>
          );
        })}
      </g>
    );
  };

  // Render animations based on land type
  switch (tile.landType) {
    case 'MARINE':
      return renderMarineAnimations();
    case 'COASTAL':
      return renderCoastalAnimations();
    case 'PLAIN':
      return renderPlainAnimations();
    default:
      return null;
  }
};

export default LandTypeAnimations;