import React from 'react'
import styled, { keyframes } from 'styled-components'

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`

const SkeletonBase = styled.div<{ width?: string; height?: string; borderRadius?: string }>`
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.08) 25%,
    rgba(255, 255, 255, 0.12) 50%,
    rgba(255, 255, 255, 0.08) 75%
  );
  background-size: 200px 100%;
  animation: ${shimmer} 2s infinite;
  border-radius: ${props => props.borderRadius || '8px'};
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '20px'};
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.05);
`

const GameCardSkeleton = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  animation: fadeInScale 0.5s ease-out;
`

const GameGridSkeleton = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (min-width: 600px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (min-width: 800px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  @media (min-width: 1200px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`

export const LoadingSkeleton = {
  Text: (props: { width?: string; height?: string }) => (
    <SkeletonBase width={props.width} height={props.height} />
  ),

  Avatar: () => (
    <SkeletonBase width="40px" height="40px" borderRadius="50%" />
  ),

  GameCard: () => (
    <GameCardSkeleton>
      <SkeletonBase width="80px" height="80px" borderRadius="50%" />
      <SkeletonBase width="120px" height="16px" />
      <SkeletonBase width="80px" height="12px" />
    </GameCardSkeleton>
  ),

  GameGrid: ({ count = 8 }: { count?: number }) => (
    <GameGridSkeleton>
      {Array.from({ length: count }, (_, i) => (
        <LoadingSkeleton.GameCard key={i} />
      ))}
    </GameGridSkeleton>
  ),

  Sidebar: () => (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <SkeletonBase width="100%" height="60px" borderRadius="12px" />
      <SkeletonBase width="100%" height="40px" borderRadius="8px" />
      {Array.from({ length: 8 }, (_, i) => (
        <SkeletonBase key={i} width="100%" height="40px" borderRadius="8px" />
      ))}
    </div>
  ),

  TrollBox: () => (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <SkeletonBase width="120px" height="20px" />
      <div style={{ display: 'flex', gap: '12px' }}>
        <SkeletonBase width="40px" height="40px" borderRadius="50%" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SkeletonBase width="100px" height="16px" />
          <SkeletonBase width="80%" height="14px" />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <SkeletonBase width="40px" height="40px" borderRadius="50%" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SkeletonBase width="120px" height="16px" />
          <SkeletonBase width="90%" height="14px" />
        </div>
      </div>
    </div>
  )
}
