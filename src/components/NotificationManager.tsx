import React, { useState } from 'react'
import styled from 'styled-components'
import { usePushNotifications } from '../hooks/usePushNotifications'

const NotificationButton = styled.button<{ $enabled: boolean }>`
  background: var(--card-background);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    border-color: var(--border-hover);
    background: var(--card-hover);
  }

  &::before {
    content: '${props => props.$enabled ? '🔔' : '🔕'}';
    font-size: 18px;
    filter: ${props => props.$enabled ? 'none' : 'grayscale(100%)'};
  }
`

const NotificationModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--card-background);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  z-index: 1000;
  box-shadow: 0 8px 32px var(--shadow);
`

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  backdrop-filter: blur(4px);
`

const ModalTitle = styled.h3`
  margin: 0 0 16px 0;
  color: var(--text-color);
  font-size: 18px;
  font-weight: 600;
`

const ModalText = styled.p`
  margin: 0 0 20px 0;
  color: var(--text-secondary);
  line-height: 1.5;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`

const ModalButton = styled.button<{ $primary?: boolean }>`
  flex: 1;
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  ${props => props.$primary ? `
    background: var(--gamba-ui-button-main-background);
    color: var(--gamba-ui-button-main-color);

    &:hover {
      filter: brightness(1.1);
    }
  ` : `
    background: transparent;
    color: var(--text-secondary);
    border: 1px solid var(--border-color);

    &:hover {
      background: var(--card-hover);
      border-color: var(--border-hover);
    }
  `}
`

export const NotificationManager: React.FC = () => {
  const {
    isSupported,
    isSubscribed,
    permission,
    requestPermission,
    subscribe,
    unsubscribe,
    canSubscribe,
    canUnsubscribe
  } = usePushNotifications()

  const [showModal, setShowModal] = useState(false)

  const handleClick = async () => {
    if (!isSupported) {
      alert('Las notificaciones push no están soportadas en este navegador.')
      return
    }

    if (permission === 'denied') {
      alert('Las notificaciones están bloqueadas. Habilítalas en la configuración del navegador.')
      return
    }

    if (permission === 'default') {
      const granted = await requestPermission()
      if (granted) {
        const subscribed = await subscribe()
        if (subscribed) {
          alert('¡Notificaciones habilitadas! Recibirás actualizaciones sobre juegos y promociones.')
        }
      }
      return
    }

    if (canSubscribe) {
      const subscribed = await subscribe()
      if (subscribed) {
        alert('¡Notificaciones habilitadas!')
      }
      return
    }

    if (canUnsubscribe) {
      setShowModal(true)
    }
  }

  const handleUnsubscribe = async () => {
    const unsubscribed = await unsubscribe()
    if (unsubscribed) {
      alert('Notificaciones deshabilitadas.')
    }
    setShowModal(false)
  }

  if (!isSupported) return null

  return (
    <>
      <NotificationButton
        $enabled={isSubscribed}
        onClick={handleClick}
        title={isSubscribed ? 'Deshabilitar notificaciones' : 'Habilitar notificaciones'}
        aria-label={isSubscribed ? 'Deshabilitar notificaciones' : 'Habilitar notificaciones'}
      />

      {showModal && (
        <>
          <ModalOverlay onClick={() => setShowModal(false)} />
          <NotificationModal>
            <ModalTitle>¿Deshabilitar notificaciones?</ModalTitle>
            <ModalText>
              Ya no recibirás actualizaciones sobre juegos activos, promociones especiales
              ni recordatorios importantes.
            </ModalText>
            <ButtonGroup>
              <ModalButton onClick={() => setShowModal(false)}>
                Cancelar
              </ModalButton>
              <ModalButton $primary onClick={handleUnsubscribe}>
                Deshabilitar
              </ModalButton>
            </ButtonGroup>
          </NotificationModal>
        </>
      )}
    </>
  )
}
