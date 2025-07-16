// components/ui/WhatsAppBadge.js
"use client";

import { useState, useEffect } from 'react';
import { MessageCircle, X, Shield } from 'lucide-react';

const WhatsAppBadge = ({ phoneNumber }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Mostrar el badge después de 3 segundos
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Mostrar tooltip automáticamente después de que aparezca el badge
    if (isVisible) {
      const tooltipTimer = setTimeout(() => {
        setShowTooltip(true);
        // Ocultar tooltip después de 5 segundos
        setTimeout(() => setShowTooltip(false), 5000);
      }, 1000);

      return () => clearTimeout(tooltipTimer);
    }
  }, [isVisible]);

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      "¡Hola IMSSE! Me interesa conocer más sobre sus sistemas de protección contra incendios. Me gustaría recibir información sobre sus servicios."
    );
    const whatsappURL = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${message}`;
    window.open(whatsappURL, '_blank');
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Tooltip flotante - controlado por estado */}
      {showTooltip && (
        <div className="fixed bottom-32 right-6 z-50">
          <div className="bg-white rounded-lg shadow-2xl p-4 max-w-xs border border-green-100 relative">
            <button
              onClick={() => setShowTooltip(false)}
              className="absolute -top-2 -right-2 bg-gray-200 hover:bg-gray-300 rounded-full p-1 transition-colors"
            >
              <X size={12} className="text-gray-600" />
            </button>
            
            <div className="flex items-start space-x-3">
              <div className="bg-gradient-imsse p-2 rounded-full">
                <Shield size={16} className="text-white" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-sm mb-1">
                  IMSSE Protección
                </h4>
                <p className="text-gray-600 text-xs leading-relaxed">
                  ¿Necesita protección contra incendios? ¡Estamos aquí para ayudarle!
                </p>
                <p className="text-xs text-primary font-medium mt-1">
                  Consulta gratuita 24/7
                </p>
              </div>
            </div>
            
            {/* Flecha del tooltip */}
            <div className="absolute bottom-[-8px] right-8 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
          </div>
        </div>
      )}

      {/* Badge principal de WhatsApp */}
      <div className="fixed bottom-20 right-6 z-40">
        <button
          onClick={handleWhatsAppClick}
          className="group relative bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 animate-pulse hover:animate-none"
          aria-label="Contactar por WhatsApp"
        >
          {/* Efecto de ondas */}
          <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"></div>
          <div className="absolute inset-0 rounded-full bg-green-400 animate-pulse opacity-50"></div>
          
          {/* Icono */}
          <div className="relative z-10">
            <MessageCircle size={28} className="group-hover:scale-110 transition-transform" />
          </div>
          
          {/* Badge de notificación fijo */}
          <div className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
            <Shield size={12} />
          </div>
        </button>

        {/* Texto descriptivo al hover */}
        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg shadow-lg whitespace-nowrap">
            <div className="font-semibold">Emergencias 24/7</div>
            <div className="text-xs text-gray-300">Protección contra incendios</div>
            {/* Flecha */}
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800"></div>
          </div>
        </div>
      </div>

      {/* Indicador de estado online - separado */}
      <div className="fixed bottom-6 right-6 z-30">
        <div className="bg-white rounded-full px-3 py-2 shadow-lg border border-green-100">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-600 font-medium">Online</span>
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