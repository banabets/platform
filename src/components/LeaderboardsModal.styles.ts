// src/components/LeaderboardsModal.styles.ts
import styled, { css } from 'styled-components'

export const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
  width: 100%;
  max-width: 550px;
  margin: auto;
  max-height: calc(90vh - 4rem);
  overflow-y: auto;

  background: linear-gradient(135deg, rgba(24, 25, 28, 0.95), rgba(32, 34, 37, 0.9));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #ffe42d, #ffb300);
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    margin: 4px;
  }

  @media (min-width: 769px) {
    margin-top: 100px; /* Espacio para el header fijo */
  }

  @media (max-width: 480px) {
    padding: 1.5rem;
    max-height: calc(95vh - 2rem);
    max-width: 95vw;
  }
`

export const HeaderSection = styled.div`text-align:center;`

export const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  color: #ffe42d;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  font-family: 'Russo One', sans-serif;
  letter-spacing: 1px;
  text-align: center;
  background: linear-gradient(135deg, #ffe42d, #ffb300);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;

  &::after {
    content: '🏆';
    position: absolute;
    top: -5px;
    right: -25px;
    font-size: 1.2em;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }

  @media (max-width: 480px) {
    font-size: 1.5rem;

    &::after {
      right: -20px;
      font-size: 1em;
    }
  }
`

export const Subtitle = styled.p`
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-weight: 500;
  text-align: center;
`

export const TabRow = styled.div`
  display: flex;
  gap: 6px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
  border-radius: 14px;
  padding: 6px;
  border: 1px solid rgba(255, 228, 45, 0.2);
  backdrop-filter: blur(10px);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  margin: 1rem 0 1.5rem;
`

export const TabButton = styled.button<{ $selected: boolean }>`
  flex: 1;
  padding: 12px 20px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: 'Russo One', sans-serif;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 228, 45, 0.2), transparent);
    transition: left 0.5s ease;
  }

  &:hover:not(:disabled) {
    ${({ $selected }) => !$selected && css`
      color: #ffffff;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

      &::before {
        left: 100%;
      }
    `}
  }

  ${({ $selected }) => $selected && css`
    background: linear-gradient(135deg, rgba(255, 228, 45, 0.2), rgba(255, 215, 0, 0.15));
    color: #ffe42d;
    font-weight: 700;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    box-shadow:
      0 0 20px rgba(255, 228, 45, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 228, 45, 0.4);
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 480px) {
    padding: 10px 16px;
    font-size: 0.9rem;
  }
`

export const LeaderboardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.01));
  border-radius: 14px;
  padding: 1rem;
  border: 1px solid rgba(255, 228, 45, 0.1);
  backdrop-filter: blur(5px);
`

export const ListHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  color: rgba(255, 228, 45, 0.8);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 700;
  font-family: 'Russo One', sans-serif;
  border-bottom: 2px solid rgba(255, 228, 45, 0.3);
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, rgba(255, 228, 45, 0.05), rgba(255, 215, 0, 0.03));
  border-radius: 8px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`

export const HeaderRank = styled.div`
  flex: 0 0 80px;
  text-align: center;
  font-weight: 800;
`
export const HeaderPlayer = styled.div`
  flex: 1;
  padding-left: 0.5rem;
  font-weight: 600;
`
export const HeaderVolume = styled.div`
  flex: 0 0 120px;
  text-align: right;
  font-weight: 600;
`

export const RankItem = styled.div<{ $isTop3?: boolean }>`
  display: flex;
  align-items: center;
  padding: 1rem 1.25rem;
  background: ${props => props.$isTop3
    ? 'linear-gradient(135deg, rgba(255, 228, 45, 0.08), rgba(255, 215, 0, 0.05))'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02))'};
  border: 1px solid ${props => props.$isTop3
    ? 'rgba(255, 228, 45, 0.4)'
    : 'rgba(255, 255, 255, 0.08)'};
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: ${props => props.$isTop3
    ? '0 4px 16px rgba(255, 228, 45, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
    : '0 2px 8px rgba(0, 0, 0, 0.1)'};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 228, 45, 0.1), transparent);
    transition: left 0.6s ease;
  }

  &:hover {
    background: ${props => props.$isTop3
      ? 'linear-gradient(135deg, rgba(255, 228, 45, 0.12), rgba(255, 215, 0, 0.08))'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.06))'};
    border-color: rgba(255, 228, 45, 0.5);
    transform: translateY(-2px);
    box-shadow: ${props => props.$isTop3
      ? '0 6px 24px rgba(255, 228, 45, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
      : '0 4px 16px rgba(0, 0, 0, 0.2)'};

    &::before {
      left: 100%;
    }
  }
`

export const RankNumber = styled.div<{ rank: number }>`
  font-weight: 700;
  font-size: 1rem;
  color: #ffffff;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Russo One', sans-serif;

  ${({ rank }) => rank <= 3 && css`
    flex: 0 0 80px; /* Más ancho para acomodar medalla + número */
  `}

  ${({ rank }) => rank > 3 && css`
    flex: 0 0 60px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
    border-radius: 50%;
    width: 36px;
    height: 36px;
    border: 2px solid rgba(255, 228, 45, 0.3);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  `}

  ${({ rank }) => rank <= 3 && css`
    font-size: 1.2rem;
  `}
`

export const PlayerInfo = styled.div`
  flex: 1;
  padding-left: 0.5rem;
  font-size: 0.95rem;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

export const PlayerAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid rgba(255, 228, 45, 0.3);
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(255, 228, 45, 0.6);
    transform: scale(1.1);
  }
`

export const VolumeAmount = styled.div`
  flex: 0 0 120px;
  text-align: right;
  font-size: 1rem;
  font-weight: 700;
  color: #00ff88;
  text-shadow: 0 0 8px rgba(0, 255, 136, 0.4);
  font-family: 'Russo One', sans-serif;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 255, 136, 0.05));
  border-radius: 8px;
  padding: 0.25rem 0.5rem;
  border: 1px solid rgba(0, 255, 136, 0.3);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.25rem;

  &::after {
    content: '💰';
    font-size: 0.9em;
    opacity: 0.8;
  }
`

export const LoadingText = styled.div`
  text-align: center;
  color: rgba(255, 228, 45, 0.8);
  padding: 3rem 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  font-family: 'Russo One', sans-serif;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  &::before {
    content: '🎰';
    font-size: 2.5em;
    animation: spin 2s linear infinite;
  }

  &::after {
    content: 'Loading Champions...';
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.6);
    text-transform: none;
    letter-spacing: normal;
    font-weight: 400;
    font-family: inherit;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`

export const ErrorText = styled.div`
  text-align: center;
  color: #ff6b6b;
  padding: 3rem 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  font-family: 'Russo One', sans-serif;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-shadow: 0 0 8px rgba(255, 107, 107, 0.4);

  &::before {
    content: '⚠️';
    font-size: 2.5em;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }

  &::after {
    content: 'Failed to load leaderboard';
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.6);
    text-transform: none;
    letter-spacing: normal;
    font-weight: 400;
    font-family: inherit;
  }
`

export const EmptyStateText = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  font-weight: 600;
  font-family: 'Russo One', sans-serif;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  &::before {
    content: '🏆';
    font-size: 2.5em;
    opacity: 0.6;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }

  &::after {
    content: 'No champions yet this period';
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.5);
    text-transform: none;
    letter-spacing: normal;
    font-weight: 400;
    font-family: inherit;
  }
`

export const formatVolume = (v: number): string =>
  typeof v !== 'number' || isNaN(v)
    ? '$NaN'
    : v.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
