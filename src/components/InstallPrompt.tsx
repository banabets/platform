import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { usePWA } from '../hooks/usePWA'

const PromptContainer = styled.div`
  position: fixed;
  top: 120px;
  left: 20px;
  right: 20px;
  z-index: 100;
  background: var(--card-background);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 20px var(--shadow);
  z-index: 1000;
  backdrop-filter: blur(10px);
  animation: slideDown 0.3s ease-out;

  @keyframes slideDown {
    from {
      transform: translateY(-100px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @media (min-width: 768px) {
    left: auto;
    right: 20px;
    width: 350px;
  }
`

const PromptContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const Icon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--gamba-ui-primary-color), var(--gamba-ui-button-main-background));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
`

const TextContent = styled.div`
  flex: 1;
  min-width: 0;
`

const Title = styled.h3`
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
`

const Description = styled.p`
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.4;
`

const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`

const InstallButton = styled.button`
  background: var(--gamba-ui-button-main-background);
  color: var(--gamba-ui-button-main-color);
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`

const DismissButton = styled.button`
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--card-hover);
    border-color: var(--border-hover);
  }
`

const STORAGE_KEY = 'pwa-install-dismissed'
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 días

export const InstallPrompt: React.FC = () => {
  const { isInstallable, isInstalled, install, canInstall } = usePWA()
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    if (isInstalled) return

    const dismissedAt = localStorage.getItem(STORAGE_KEY)
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10)
      const now = Date.now()
      if (now - dismissedTime < DISMISS_DURATION) {
        return // Aún no mostrar de nuevo
      }
    }

    // Mostrar el prompt después de 10 segundos de interacción
    const timer = setTimeout(() => {
      if (isInstallable && canInstall && !isInstalled) {
        setShowPrompt(true)
      }
    }, 10000)

    return () => clearTimeout(timer)
  }, [isInstallable, canInstall, isInstalled])

  const handleInstall = async () => {
    const success = await install()
    if (success) {
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString())
    setShowPrompt(false)
  }

  if (!showPrompt || isInstalled) {
    return null
  }

  return (
    <PromptContainer>
      <PromptContent>
        <Icon>📱</Icon>
        <TextContent>
          <Title>Install Banabets</Title>
          <Description>
            Play blockchain casino from your mobile. Fast access, no browser needed.
          </Description>
          <Actions>
            <InstallButton onClick={handleInstall}>
              Install
            </InstallButton>
            <DismissButton onClick={handleDismiss}>
              Later
            </DismissButton>
          </Actions>
        </TextContent>
      </PromptContent>
    </PromptContainer>
  )
}
