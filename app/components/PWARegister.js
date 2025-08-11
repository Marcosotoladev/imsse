// app/components/PWARegister.js

'use client'
import { useEffect, useState } from 'react'

export default function PWARegister() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallButton, setShowInstallButton] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    // Registrar el service worker
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registrado:', registration)

        // Detectar actualización del SW
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                if (confirm('¡Nueva versión disponible! ¿Actualizar ahora?')) {
                  newWorker.postMessage({ action: 'skipWaiting' })
                  window.location.reload()
                }
              }
            })
          }
        })
      })
      .catch((error) => {
        console.error('❌ Error al registrar Service Worker:', error)
      })

    // Cuando SW tome control, recargar
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload()
    })

    // Detectar si app es instalable
    const beforeInstallPromptHandler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallButton(true)
      console.log('💾 App es instalable')
    }
    window.addEventListener('beforeinstallprompt', beforeInstallPromptHandler)

    // Detectar cuando la app fue instalada
    const appInstalledHandler = () => {
      console.log('🎉 PWA instalada exitosamente')
      setDeferredPrompt(null)
      setShowInstallButton(false)
    }
    window.addEventListener('appinstalled', appInstalledHandler)

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstallPromptHandler)
      window.removeEventListener('appinstalled', appInstalledHandler)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const choiceResult = await deferredPrompt.userChoice
    if (choiceResult.outcome === 'accepted') {
      console.log('Usuario aceptó la instalación')
    } else {
      console.log('Usuario rechazó la instalación')
    }
    setDeferredPrompt(null)
    setShowInstallButton(false)
  }

  return (
    <>
      {showInstallButton && (
        <button
          onClick={handleInstallClick}
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            padding: '12px 20px',
            backgroundColor: '#DC2626',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            zIndex: 9999,
          }}
        >
          Instalar App
        </button>
      )}
    </>
  )
}
