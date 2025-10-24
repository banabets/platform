// src/components/LeaderboardsModal.tsx
import React, { useState } from 'react'
import { Modal } from './Modal'
import {
  useLeaderboardData,
  Period,
  Player,            // exported from the hook
} from '../hooks/useLeaderboardData'

import {
  ModalContent,
  HeaderSection,
  Title,
  Subtitle,
  TabRow,
  TabButton,
  LeaderboardList,
  ListHeader,
  HeaderRank,
  HeaderPlayer,
  HeaderVolume,
  RankItem,
  RankNumber,
  PlayerInfo,
  PlayerAvatar,
  VolumeAmount,
  formatVolume,
  LoadingText,
  ErrorText,
  EmptyStateText,
} from './LeaderboardsModal.styles'

// Función para generar avatar (igual que en TrollBox)
const AVATAR_COUNT = 12
function getAvatar(user: string, total = AVATAR_COUNT) {
  if (total <= 0) return ''
  let hash = 0
  for (let i = 0; i < user.length; i++) hash = user.charCodeAt(i) + ((hash << 5) - hash)
  const index = Math.abs(hash) % total
  return `/avatars/${index + 1}.png`
}

interface LeaderboardsModalProps {
  onClose: () => void
  creator: string
}

const LeaderboardsModal: React.FC<LeaderboardsModalProps> = ({
  onClose,
  creator,
}) => {
  const [period, setPeriod] = useState<Period>('weekly') // default

  const {
    data: leaderboard,
    loading,
    error,
  } = useLeaderboardData(period, creator)

  return (
    <Modal onClose={onClose}>
      <ModalContent>
        {/* ────── header ────── */}
        <HeaderSection>
          <Title>Leaderboard</Title>
          <Subtitle>
            Top players by volume{' '}
            {period === 'weekly' ? 'this week' : 'this month'} (USD)
          </Subtitle>
        </HeaderSection>

        {/* ────── tabs ────── */}
        <TabRow>
          <TabButton
            $selected={period === 'weekly'}
            onClick={() => setPeriod('weekly')}
            disabled={loading}
          >
            Weekly
          </TabButton>

          <TabButton
            $selected={period === 'monthly'}
            onClick={() => setPeriod('monthly')}
            disabled={loading}
          >
            Monthly
          </TabButton>
        </TabRow>

        {/* ────── body ────── */}
        {loading ? (
          <LoadingText>Loading...</LoadingText>
        ) : error ? (
          <ErrorText>{error}</ErrorText>
        ) : leaderboard && leaderboard.length > 0 ? (
          <LeaderboardList>
            <ListHeader>
              <HeaderRank>Rank</HeaderRank>
              <HeaderPlayer>Player</HeaderPlayer>
              <HeaderVolume>Volume&nbsp;(USD)</HeaderVolume>
            </ListHeader>

            {leaderboard.map((entry: Player, index) => {
              const rank = index + 1
              const avatar = getAvatar(entry.user)

              const getRankDisplay = (rank: number) => {
                switch (rank) {
                  case 1:
                    return (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3em' }}>
                        <span style={{ fontSize: '1.4em', filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' }}>🥇</span>
                        <span>{rank}</span>
                      </span>
                    )
                  case 2:
                    return (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3em' }}>
                        <span style={{ fontSize: '1.4em', filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' }}>🥈</span>
                        <span>{rank}</span>
                      </span>
                    )
                  case 3:
                    return (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3em' }}>
                        <span style={{ fontSize: '1.4em', filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' }}>🥉</span>
                        <span>{rank}</span>
                      </span>
                    )
                  default:
                    return rank
                }
              }

              return (
              <RankItem key={entry.user} $isTop3={rank <= 3}>
                <RankNumber rank={rank}>{getRankDisplay(rank)}</RankNumber>
                  <PlayerInfo title={entry.user}>
                    <PlayerAvatar src={avatar} alt={`${entry.user} avatar`} />
                    {entry.user}
                  </PlayerInfo>
                  <VolumeAmount>{formatVolume(entry.usd_volume)}</VolumeAmount>
                </RankItem>
              )
            })}
          </LeaderboardList>
        ) : (
          <EmptyStateText>No leaderboard data for this period.</EmptyStateText>
        )}
      </ModalContent>
    </Modal>
  )
}

export default LeaderboardsModal
