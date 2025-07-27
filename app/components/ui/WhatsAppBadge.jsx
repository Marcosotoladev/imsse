"use client";

import { useState, useEffect } from 'react';
import { MessageCircle, X, Shield } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';

const WhatsAppBadge = ({ phoneNumber }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isAuthReady && !isAuthenticated) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isAuthReady, isAuthenticated]);

  useEffect(() => {
    if (isVisible) {
      const tooltipTimer = setTimeout(() => {
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 5000);
      }, 1000);

      return () => clearTimeout(tooltipTimer);
    }
  }, [isVisible]);

  // 🔁 NUEVO: ocultar el badge si el usuario se loguea luego de que ya está visible
  useEffect(() => {
    if (isAuthenticated && isVisible) {
      setIsVisible(false);
      setShowTooltip(false);
    }
  }, [isAuthenticated, isVisible]);

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      "¡Hola IMSSE! Me interesa conocer más sobre sus sistemas de protección contra incendios. Me gustaría recibir información sobre sus servicios."
    );
    const whatsappURL = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${message}`;
    window.open(whatsappURL, '_blank');
  };

  if (!isAuthReady || !isVisible) return null;

  return (
    <>
      {/* Tooltip flotante */}
      {showTooltip && (
        <div className="fixed z-50 bottom-32 right-6">
          <div className="relative max-w-xs p-4 bg-white border border-green-100 rounded-lg shadow-2xl">
            <button
              onClick={() => setShowTooltip(false)}
              className="absolute p-1 transition-colors bg-gray-200 rounded-full -top-2 -right-2 hover:bg-gray-300"
            >
              <X size={12} className="text-gray-600" />
            </button>

            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-full bg-gradient-imsse">
                <Shield size={16} className="text-white" />
              </div>
              <div>
                <h4 className="mb-1 text-sm font-bold text-gray-800">
                  IMSSE Protección
                </h4>
                <p className="text-xs leading-relaxed text-gray-600">
                  ¿Necesita protección contra incendios? ¡Estamos aquí para ayudarle!
                </p>
                <p className="mt-1 text-xs font-medium text-primary">
                  Consulta gratuita 24/7
                </p>
              </div>
            </div>

            <div className="absolute bottom-[-8px] right-8 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
          </div>
        </div>
      )}

      {/* Badge de WhatsApp */}
      <div className="fixed z-40 bottom-20 right-6">
        <button
          onClick={handleWhatsAppClick}
          className="relative p-4 text-white transition-all duration-300 transform bg-green-500 rounded-full shadow-2xl group hover:bg-green-600 hover:scale-110 animate-pulse hover:animate-none"
          aria-label="Contactar por WhatsApp"
        >
          <div className="absolute inset-0 bg-green-400 rounded-full opacity-75 animate-ping"></div>
          <div className="absolute inset-0 bg-green-400 rounded-full opacity-50 animate-pulse"></div>

          <div className="relative z-10">
            <MessageCircle size={28} className="transition-transform group-hover:scale-110" />
          </div>

          <div className="absolute flex items-center justify-center w-6 h-6 text-xs font-bold text-white rounded-full -top-1 -right-1 bg-primary">
            <Shield size={12} />
          </div>
        </button>

        <div className="absolute right-0 mb-2 transition-opacity duration-300 opacity-0 pointer-events-none bottom-full group-hover:opacity-100">
          <div className="px-4 py-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg whitespace-nowrap">
            <div className="font-semibold">Emergencias 24/7</div>
            <div className="text-xs text-gray-300">Protección contra incendios</div>
            <div className="absolute w-0 h-0 border-t-4 border-l-4 border-r-4 top-full right-4 border-l-transparent border-r-transparent border-t-gray-800"></div>
          </div>
        </div>
      </div>

      {/* Indicador de estado online */}
      <div className="fixed z-30 bottom-6 right-6">
        <div className="px-3 py-2 bg-white border border-green-100 rounded-full shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-gray-600">Online</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes wiggle {
          0%, 7% { transform: rotateZ(0deg); }
          15% { transform: rotateZ(-15deg); }
          20% { transform: rotateZ(10deg); }
          25% { transform: rotateZ(-10deg); }
          30% { transform: rotateZ(6deg); }
          35% { transform: rotateZ(-4deg); }
          40%, 100% { transform: rotateZ(0deg); }
        }

        .group:hover {
          animation: wiggle 0.8s ease-in-out;
        }
      `}</style>
    </>
  );
};

export default WhatsAppBadge;

