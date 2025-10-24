import React from 'react'
import styled from 'styled-components'
import { useTheme } from '../hooks/useTheme'

const ToggleButton = styled.button`
  background: var(--card-background);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  width: 60px;
  height: 30px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  padding: 2px;

  &:hover {
    border-color: var(--border-hover);
    background: var(--card-hover);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--gamba-ui-primary-color);
  }
`

const ToggleKnob = styled.div<{ $isDark: boolean }>`
  width: 24px;
  height: 24px;
  background: var(--gamba-ui-button-main-background);
  border-radius: 50%;
  position: relative;
  transition: transform 0.3s ease;
  transform: translateX(${props => props.$isDark ? '30px' : '0'});

  &::before {
    content: '${props => props.$isDark ? '🌙' : '☀️'}';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 12px;
    line-height: 1;
  }
`

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme()

  return (
    <ToggleButton
      onClick={toggleTheme}
      aria-label={`Cambiar a tema ${isDark ? 'claro' : 'oscuro'}`}
      title={`Cambiar a tema ${isDark ? 'claro' : 'oscuro'}`}
    >
      <ToggleKnob $isDark={isDark} />
    </ToggleButton>
  )
}
