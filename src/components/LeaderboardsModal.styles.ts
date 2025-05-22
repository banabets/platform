// src/components/LeaderboardsModal.styles.ts
import styled, { css } from 'styled-components'

export const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  width: 100%;
  max-width: 420px;
  margin: auto;
  max-height: calc(90vh - 4rem);
  overflow-y: auto;

  background: rgba(21, 21, 31, 0.5); /* fondo más transparente */
  box-shadow: 0 0 20px rgba(0, 255, 164, 0.08); /* glow suave */

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.2);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-track { background: transparent; }

  @media (max-width: 480px) {
    padding: 1rem;
    max-height: calc(95vh - 2rem);
  }
`

export const HeaderSection = styled.div`text-align:center;`

export const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 6px rgba(0, 255, 164, 0.2);
`

export const Subtitle = styled.p`
  font-size: .9rem;
  color: #a0a0a0;
  margin: 0;
`

export const TabRow = styled.div`
  display: flex;
  gap: 4px;
  background: rgba(255,255,255,0.05);
  border-radius: 10px;
  padding: 4px;
  border: 1px solid rgba(255,255,255,0.08);
  margin: .5rem 0 1rem;
`

export const TabButton = styled.button<{ $selected: boolean }>`
  flex: 1;
  padding: .75rem 1rem;
  border: none;
  background: transparent;
  color: #a0a0a0;
  font-size: .95rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s, color 0.3s, transform 0.1s;

  &:hover:not(:disabled) {
    ${({ $selected }) => !$selected && css`
      background: rgba(255,255,255,0.1);
      color: #fff;
      transform: scale(1.02);
    `}
  }

  ${({ $selected }) => $selected && css`
    background: rgba(0, 255, 164, 0.2);
    color: #fff;
    font-weight: 600;
  `}

  &:disabled {
    opacity: .5;
    cursor: not-allowed;
  }
`

export const LeaderboardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: .5rem;
`

export const ListHeader = styled.div`
  display: flex;
  align-items: center;
  padding: .5rem 1rem;
  font-size: .8rem;
  color: #a0a0a0;
  text-transform: uppercase;
  letter-spacing: .5px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  margin-bottom: .5rem;
`

export const HeaderRank = styled.div`flex: 0 0 50px; text-align: center;`
export const HeaderPlayer = styled.div`flex: 1; padding-left: .5rem;`
export const HeaderVolume = styled.div`flex: 0 0 100px; text-align: right;`

export const RankItem = styled.div<{ $isTop3?: boolean }>`
  display: flex;
  align-items: center;
  padding: .75rem 1rem;
  background: rgba(255, 255, 255, 0.04); /* más transparente */
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  transition: background 0.3s, border-color 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(0, 255, 164, 0.3);
  }
`

export const RankNumber = styled.div<{ rank: number }>`
  flex: 0 0 50px;
  font-weight: 600;
  font-size: .95rem;
  color: #fff;
  text-align: center;

  ${({ rank }) => rank === 1 && css`
    &:before { content: '🥇'; margin-right: .5em; font-size: 1.1em; }
    color: #ffd700;
    text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
  `}
  ${({ rank }) => rank === 2 && css`
    &:before { content: '🥈'; margin-right: .5em; font-size: 1.1em; }
    color: #c0c0c0;
    text-shadow: 0 0 8px rgba(192, 192, 192, 0.4);
  `}
  ${({ rank }) => rank === 3 && css`
    &:before { content: '🥉'; margin-right: .5em; font-size: 1.1em; }
    color: #cd7f32;
    text-shadow: 0 0 8px rgba(205, 127, 50, 0.4);
  `}
`

export const PlayerInfo = styled.div`
  flex: 1;
  padding-left: .5rem;
  font-size: .95rem;
  color: #eee;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const VolumeAmount = styled.div`
  flex: 0 0 100px;
  text-align: right;
  font-size: .95rem;
  font-weight: 600;
  color: #03ffa4;
`

export const LoadingText = styled.p`
  text-align: center;
  color: #ccc;
  padding: 2rem 0;
`

export const ErrorText = styled.p`
  text-align: center;
  color: #ff8080;
  padding: 2rem 0;
`

export const EmptyStateText = styled.div`
  text-align: center;
  padding: 2rem;
  color: #a0a0a0;
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
