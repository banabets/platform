import { useEffect, useState } from 'react'

interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)

  useEffect(() => {
    // Verificar soporte
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) return false

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result === 'granted'
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return false
    }
  }

  const subscribe = async (): Promise<boolean> => {
    if (!isSupported || permission !== 'granted') return false

    try {
      const registration = await navigator.serviceWorker.ready
      const existingSubscription = await registration.pushManager.getSubscription()

      if (existingSubscription) {
        setSubscription(existingSubscription)
        setIsSubscribed(true)
        return true
      }

      // Aquí iría la clave VAPID del servidor
      // Por ahora, usamos una configuración básica
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          // Esta sería la clave pública VAPID del servidor
          'BDefaultVAPIDKeyForDevelopmentOnly1234567890123456789012345678901234567890'
        )
      })

      setSubscription(newSubscription)
      setIsSubscribed(true)

      // Enviar la suscripción al servidor
      await sendSubscriptionToServer(newSubscription)

      return true
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      return false
    }
  }

  const unsubscribe = async (): Promise<boolean> => {
    if (!subscription) return false

    try {
      const result = await subscription.unsubscribe()
      if (result) {
        setSubscription(null)
        setIsSubscribed(false)
        await removeSubscriptionFromServer(subscription)
      }
      return result
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error)
      return false
    }
  }

  const sendSubscriptionToServer = async (subscription: PushSubscription) => {
    // Aquí se enviaría la suscripción al backend
    // Por ahora, solo la guardamos en localStorage para desarrollo
    const subscriptionData = JSON.stringify(subscription)
    localStorage.setItem('push-subscription', subscriptionData)

    // En producción, esto sería:
    // await fetch('/api/push/subscribe', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(subscription)
    // })
  }

  const removeSubscriptionFromServer = async (subscription: PushSubscription) => {
    localStorage.removeItem('push-subscription')

    // En producción:
    // await fetch('/api/push/unsubscribe', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(subscription)
    // })
  }

  // Función auxiliar para convertir VAPID key
  function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // Verificar estado de suscripción existente
  useEffect(() => {
    const checkExistingSubscription = async () => {
      if (!isSupported) return

      try {
        const registration = await navigator.serviceWorker.ready
        const existingSubscription = await registration.pushManager.getSubscription()
        if (existingSubscription) {
          setSubscription(existingSubscription)
          setIsSubscribed(true)
        }
      } catch (error) {
        console.error('Error checking existing subscription:', error)
      }
    }

    if (permission === 'granted') {
      checkExistingSubscription()
    }
  }, [isSupported, permission])

  return {
    isSupported,
    isSubscribed,
    permission,
    subscription,
    requestPermission,
    subscribe,
    unsubscribe,
    canSubscribe: isSupported && permission === 'granted' && !isSubscribed,
    canUnsubscribe: isSubscribed
  }
}
