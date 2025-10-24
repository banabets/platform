import { GameBundle } from 'gamba-react-ui-v2'
import React from 'react'

export const GAMES: GameBundle[] = [
  
  {
    id: 'jackpot',
    meta: {
      background: '#38acc9ff',
      name: 'JackPot',
      image: '/games/jackpot.png',
      description: `
        Jackpot con bote común entre jugadores. Entra, aporta al bote y mira si te lo llevas.
      `,
      tag: 'Multiplayer',
    },
    app: React.lazy(() => import('./Jackpot')),
  },
  {
    id: 'plinkorace',
    meta: {
      background: '#62cc34ff',
      name: 'PlinkoRace',
      image: '/games/plinko2.webp',
      description: `
        Plinko en modo carrera con lobby y partidas compartidas.
      `,
      tag: 'Multiplayer',
    },
    app: React.lazy(() => import('./PlinkoRace')),
  },

  {
    id: 'pp',
    meta: {
      background: '#004aad',
      image: '/games/pp.png',
      name: 'Progressive Power Poker',
      description: `Un clásico reinventado: combina la emoción del poker con apuestas progresivas. Forma tu mejor mano y gana recompensas crecientes.`,
    },
    app: React.lazy(() => import('./pp')),
  },
  {
    id: 'dice',
    meta: {
      background: '#ffffffdf',
      name: 'Dice',
      image: '/games/dice.png',
      description: `Dice challenges players to predict the outcome of a roll with a unique twist. Select a number and aim to roll below it to win. Adjusting your choice affects potential payouts, balancing risk and reward.`,
    },
    app: React.lazy(() => import('./Dice')),
  },
  {
    id: 'slots',
    meta: {
      background: '#000000CC',
      name: 'Slots',
      image: '/games/slots.png',
      description: `Slots is the quintessential game of luck and anticipation. Spin the reels and match symbols to win, with potential rewards displayed upfront. Classic casino experience.`,
    },
    app: React.lazy(() => import('./Slots')),
  },
  {
    id: 'flip',
    meta: {
      name: 'Flip',
      image: '/games/flip.png',
      background: '#ffffffdf',
      description: `Flip offers a simple gamble: choose Heads or Tails and double your money or lose it all. High-stakes and fast.`,
    },
    app: React.lazy(() => import('./Flip')),
  },
  {
    id: 'hilo',
    meta: {
      name: 'HiLo',
      image: '/games/hilo.png',
      background: '#000000CC',
      description: `HiLo tests your foresight: guess if the next card is higher or lower. Consecutive correct guesses multiply your rewards.`,
    },
    app: React.lazy(() => import('./HiLo')),
  },
  {
    id: 'mines',
    meta: {
      name: 'Mines',
      image: '/games/mines.png',
      background: '#000000CC',
      description: `Reveal squares for rewards, but avoid hidden mines. Risk increases as you uncover more. Cash out anytime.`,
    },
    app: React.lazy(() => import('./Mines')),
  },
  {
    id: 'roulette',
    meta: {
      name: 'Roulette',
      image: '/games/roulette.png',
      background: '#ffffffdf',
      description: `Bet on where the ball will land. Watch the wheel spin in this classic game of chance.`,
    },
    app: React.lazy(() => import('./Roulette')),
  },
  {
    id: 'plinko',
    meta: {
      background: '#0d1117',
      image: '/games/plinko.png',
      name: 'Plinko',
      description: `Drop chips down the board, watch them bounce into slots with varying win amounts. A game of luck and anticipation.`,
    },
    app: React.lazy(() => import('./Plinko')),
  },
  {
    id: 'crash',
    meta: {
      background: '#ffffffdf',
      image: '/games/crash.png',
      name: 'Crash',
      description: `Predict a multiplier target and watch a rocket climb. Cash out before it crashes!`,
    },
    app: React.lazy(() => import('./CrashGame')),
  },
  {
    id: 'blackjack',
    meta: {
      background: '#000000CC',
      image: '/games/blackjack.png',
      name: 'BlackJack',
      description: `A simplified blackjack: beat the dealer without exceeding 21. Quick and rewarding rounds.`,
    },
    app: React.lazy(() => import('./BlackJack')),
  },
  {
    id: 'crypto-chart',
    meta: {
      background: '#000000CC',
      image: '/games/cryptochart.png',
      name: 'Sol Crash',
      description: `A crypto-inspired twist on Crash. Watch the chart rise with candlestick animations. Cash out before it crashes.`,
    },
    app: React.lazy(() => import('./CryptoChartGame')),
  },
  {
    id: 'pvp-flip',
    meta: {
      background: '#FFD700',
      name: 'PvP Flip',
      image: '/games/pvp-flip.png',
      description: `Challenge other players in real-time coin flip battles! Create or join games and compete for prizes.`,
      tag: 'Multiplayer',
    },
    app: React.lazy(() => import('./PvpFlip')),
  },

]
