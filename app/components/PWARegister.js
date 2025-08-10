'use client'
import { useEffect } from 'react'

export default function PWARegister() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator
    ) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registrado:', registration)
          
          // Verificar actualizaciones
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Hay una nueva versión disponible
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

      // Manejar cuando el SW tome control
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload()
      })

      // Detectar cuando la app es instalable
      let deferredPrompt
      window.addEventListener('beforeinstallprompt', (e) => {
        console.log('💾 App es instalable')
        e.preventDefault()
        deferredPrompt = e
        
        // Opcional: mostrar tu propio botón de instalación
        // showInstallButton()
      })

      // Detectar cuando la app fue instalada
      window.addEventListener('appinstalled', () => {
        console.log('🎉 PWA instalada exitosamente')
        deferredPrompt = null
      })
    }
  }, [])

  return null // Este componente no renderiza nada
}