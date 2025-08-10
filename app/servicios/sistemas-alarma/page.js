// app/servicios/sistemas-alarma/page.js - PARTE 1
import Link from 'next/link';
import { ArrowRight, Shield, Zap, CheckCircle, Star, Award, Clock, Users, AlertTriangle, Phone, Volume2, Speaker, Bell } from 'lucide-react';

export const metadata = {
  title: 'Sistemas de Alarma - IMSSE Ingeniería SAS | Notificación y Evacuación',
  description: 'Sistemas de alarma contra incendios, notificación masiva y evacuación. Centrales inteligentes, sistemas de audio y señalización visual.',
  keywords: 'sistemas alarma, notificación masiva, evacuación por voz, centrales alarma, señalización emergencia',
};

export default function SistemasAlarmaPage() {
  return (
    <div className="flex flex-col min-h-screen pt-20">
      
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden text-white bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 md:py-20">
        {/* Efectos de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute w-64 h-64 bg-white rounded-full top-10 right-10 blur-3xl"></div>
          <div className="absolute w-48 h-48 bg-yellow-300 rounded-full bottom-10 left-10 blur-2xl"></div>
        </div>
        
        <div className="container relative z-10 px-4 mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-6 py-3 mb-8 border rounded-full bg-white/20 backdrop-blur-sm border-white/30">
              <Zap className="mr-2 text-yellow-300" size={20} />
              <span className="font-semibold">Notificación Avanzada • Evacuación Inteligente</span>
            </div>
            
            <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl font-montserrat">
              Sistemas de
              <span className="block text-transparent bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text">
                Alarma y Notificación
              </span>
            </h1>
            
            <p className="mb-8 text-xl leading-relaxed md:text-2xl text-white/90">
              Centrales de alarma contra incendios, notificación masiva y evacuación 
              con sistemas de audio y señalización visual avanzada.
            </p>
            
            {/* Características destacadas */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <span className="px-4 py-2 font-medium text-white border rounded-full bg-white/20 backdrop-blur-sm border-white/30">
                Centrales Inteligentes
              </span>
              <span className="px-4 py-2 font-medium text-white border rounded-full bg-white/20 backdrop-blur-sm border-white/30">
                Evacuación por Voz
              </span>
              <span className="px-4 py-2 font-medium text-white border rounded-full bg-white/20 backdrop-blur-sm border-white/30">
                Señalización LED
              </span>
              <span className="px-4 py-2 font-medium text-white border rounded-full bg-white/20 backdrop-blur-sm border-white/30">
                Integración Total
              </span>
            </div>
            
            <Link 
              href="/contacto" 
              className="inline-flex items-center px-8 py-4 text-lg font-bold text-orange-600 transition-all duration-300 transform bg-white shadow-2xl rounded-xl hover:bg-gray-100 hover:scale-105"
            >
              <Zap size={24} className="mr-3" />
              Solicitar Sistema
              <ArrowRight size={20} className="ml-3" />
            </Link>
          </div>
        </div>
      </section>
      {/* Tipos de Sistemas */}
      <section className="py-16 bg-white md:py-20">
        <div className="container px-4 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-bold md:text-5xl font-montserrat text-primary">
              Sistemas de Notificación
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              Soluciones completas para alertar, comunicar y guiar en situaciones de emergencia
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 mx-auto mb-16 lg:grid-cols-2 max-w-7xl">
            
            {/* Centrales Inteligentes */}
            <div className="p-8 border border-orange-100 shadow-lg bg-gradient-to-br from-orange-50 to-white rounded-2xl">
              <div className="flex items-start space-x-6">
                <div className="p-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl">
                  <AlertTriangle size={32} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-2xl font-bold text-orange-600 font-montserrat">
                    Centrales Inteligentes
                  </h3>
                  <p className="mb-6 leading-relaxed text-gray-600">
                    Centrales de alarma de última generación con capacidades avanzadas de procesamiento y comunicación.
                  </p>
                  
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Procesamiento inteligente de señales</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Múltiples protocolos de comunicación</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Gestión por zonas y sectores</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Interfaz gráfica avanzada</span>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-orange-50">
                    <h4 className="mb-2 font-semibold text-orange-800">Características:</h4>
                    <p className="text-sm text-orange-700">
                      Reducción de falsas alarmas, diagnósticos automáticos, reportes detallados.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sistemas de Evacuación por Voz */}
            <div className="p-8 border border-blue-100 shadow-lg bg-gradient-to-br from-blue-50 to-white rounded-2xl">
              <div className="flex items-start space-x-6">
                <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl">
                  <Volume2 size={32} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-2xl font-bold text-blue-600 font-montserrat">
                    Evacuación por Voz
                  </h3>
                  <p className="mb-6 leading-relaxed text-gray-600">
                    Sistemas de comunicación por voz para evacuación masiva con mensajes claros y dirigidos por zonas.
                  </p>
                  
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Mensajes pre-grabados y en vivo</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Control por zonas independientes</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Alta inteligibilidad de audio</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Respaldo de energía integrado</span>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-blue-50">
                    <h4 className="mb-2 font-semibold text-blue-800">Aplicaciones:</h4>
                    <p className="text-sm text-blue-700">
                      Edificios altos, centros comerciales, aeropuertos, hospitales.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Señalización Visual */}
            <div className="p-8 border border-green-100 shadow-lg bg-gradient-to-br from-green-50 to-white rounded-2xl">
              <div className="flex items-start space-x-6">
                <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl">
                  <Bell size={32} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-2xl font-bold text-green-600 font-montserrat">
                    Señalización Visual
                  </h3>
                  <p className="mb-6 leading-relaxed text-gray-600">
                    Sistemas de señalización luminosa de emergencia y letreros LED para guiar la evacuación.
                  </p>
                  
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Letreros LED de salida</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Iluminación de rutas de escape</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Señales estroboscópicas</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Integración con sistemas de detección</span>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-green-50">
                    <h4 className="mb-2 font-semibold text-green-800">Beneficios:</h4>
                    <p className="text-sm text-green-700">
                      Guía visual clara, funcionamiento en condiciones de humo, accesibilidad.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notificación Masiva */}
            <div className="p-8 border border-purple-100 shadow-lg bg-gradient-to-br from-purple-50 to-white rounded-2xl">
              <div className="flex items-start space-x-6">
                <div className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl">
                  <Speaker size={32} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-2xl font-bold text-purple-600 font-montserrat">
                    Notificación Masiva
                  </h3>
                  <p className="mb-6 leading-relaxed text-gray-600">
                    Sistemas integrados para comunicación masiva en situaciones de emergencia y eventos especiales.
                  </p>
                  
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Comunicación bidireccional</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Integración con redes IP</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Control remoto y monitoreo</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Múltiples canales de comunicación</span>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-purple-50">
                    <h4 className="mb-2 font-semibold text-purple-800">Funciones:</h4>
                    <p className="text-sm text-purple-700">
                      Anuncios programados, alertas automáticas, comunicación de emergencia.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Componentes del Sistema */}
      <section className="py-16 bg-gray-50">
        <div className="container px-4 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-bold md:text-5xl font-montserrat text-primary">
              Componentes del Sistema
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              Equipos de alta calidad para sistemas de alarma y notificación confiables
            </p>
          </div>
          
          <div className="grid max-w-6xl grid-cols-1 gap-6 mx-auto md:grid-cols-2 lg:grid-cols-4">
            
            {/* Centrales */}
            <div className="p-6 text-center transition-all duration-300 transform bg-white shadow-lg rounded-xl hover:shadow-2xl hover:-translate-y-1">
              <div className="flex items-center justify-center w-16 h-16 p-3 mx-auto mb-4 bg-orange-100 rounded-xl">
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
              <h4 className="mb-3 font-bold text-gray-800">Centrales de Alarma</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Panels direccionables</li>
                <li>• Interfaces gráficas</li>
                <li>• Comunicación en red</li>
                <li>• Respaldo de energía</li>
              </ul>
            </div>
            
            {/* Dispositivos de Notificación */}
            <div className="p-6 text-center transition-all duration-300 transform bg-white shadow-lg rounded-xl hover:shadow-2xl hover:-translate-y-1">
              <div className="flex items-center justify-center w-16 h-16 p-3 mx-auto mb-4 bg-blue-100 rounded-xl">
                <Volume2 className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="mb-3 font-bold text-gray-800">Dispositivos Audio</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Altavoces cerámicos</li>
                <li>• Sirenas electrónicas</li>
                <li>• Amplificadores</li>
                <li>• Micrófonos de bombero</li>
              </ul>
            </div>
            
            {/* Señalización Visual */}
            <div className="p-6 text-center transition-all duration-300 transform bg-white shadow-lg rounded-xl hover:shadow-2xl hover:-translate-y-1">
              <div className="flex items-center justify-center w-16 h-16 p-3 mx-auto mb-4 bg-green-100 rounded-xl">
                <Bell className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="mb-3 font-bold text-gray-800">Señalización LED</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Letreros de salida</li>
                <li>• Luces estroboscópicas</li>
                <li>• Iluminación de emergencia</li>
                <li>• Señales direccionales</li>
              </ul>
            </div>
            
            {/* Dispositivos de Control */}
            <div className="p-6 text-center transition-all duration-300 transform bg-white shadow-lg rounded-xl hover:shadow-2xl hover:-translate-y-1">
              <div className="flex items-center justify-center w-16 h-16 p-3 mx-auto mb-4 bg-purple-100 rounded-xl">
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="mb-3 font-bold text-gray-800">Control Manual</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Estaciones manuales</li>
                <li>• Pulsadores de pánico</li>
                <li>• Módulos de control</li>
                <li>• Interfaces de red</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      {/* Integración con Otros Sistemas */}
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="p-8 text-white shadow-2xl bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 md:p-12 rounded-2xl">
              <div className="mb-12 text-center">
                <h2 className="mb-6 text-3xl font-bold md:text-4xl font-montserrat">
                  Integración Total de Sistemas
                </h2>
                <p className="max-w-3xl mx-auto text-xl text-gray-200">
                  Conectamos su sistema de alarma con otros sistemas de seguridad para una respuesta coordinada
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="p-6 border bg-white/10 backdrop-blur-sm rounded-xl border-white/20">
                  <div className="flex items-center mb-4">
                    <Shield className="w-8 h-8 mr-3 text-blue-400" />
                    <h3 className="text-xl font-bold">Detección de Incendios</h3>
                  </div>
                  <p className="mb-4 text-gray-300">
                    Integración directa con sistemas de detección para activación automática de alarmas.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Activación automática</li>
                    <li>• Localización de alarmas</li>
                    <li>• Secuencias programadas</li>
                  </ul>
                </div>
                
                <div className="p-6 border bg-white/10 backdrop-blur-sm rounded-xl border-white/20">
                  <div className="flex items-center mb-4">
                    <Users className="w-8 h-8 mr-3 text-green-400" />
                    <h3 className="text-xl font-bold">Control de Acceso</h3>
                  </div>
                  <p className="mb-4 text-gray-300">
                    Liberación automática de puertas y control de acceso en emergencias.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Liberación de puertas</li>
                    <li>• Control de ascensores</li>
                    <li>• Rutas de evacuación</li>
                  </ul>
                </div>
                
                <div className="p-6 border bg-white/10 backdrop-blur-sm rounded-xl border-white/20">
                  <div className="flex items-center mb-4">
                    <Zap className="w-8 h-8 mr-3 text-yellow-400" />
                    <h3 className="text-xl font-bold">Sistemas HVAC</h3>
                  </div>
                  <p className="mb-4 text-gray-300">
                    Control de ventilación y presurización para manejo de humo.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Control de dampers</li>
                    <li>• Extracción de humo</li>
                    <li>• Presurización de escaleras</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <Link 
                  href="/contacto"
                  className="inline-flex items-center px-8 py-4 text-lg font-bold text-white transition-all duration-300 transform shadow-lg bg-primary hover:bg-red-700 rounded-xl hover:scale-105"
                >
                  <AlertTriangle size={20} className="mr-3" />
                  Consultar Integración
                  <ArrowRight size={16} className="ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Aplicaciones */}
      <section className="py-16 bg-gray-50">
        <div className="container px-4 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-bold md:text-5xl font-montserrat text-primary">
              Aplicaciones Específicas
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              Sistemas diseñados para diferentes tipos de edificios y aplicaciones
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              
              {/* Edificios Altos */}
              <div className="p-6 transition-all bg-white shadow-lg rounded-xl hover:shadow-2xl">
                <h4 className="flex items-center mb-3 font-bold text-gray-800">
                  <div className="w-3 h-3 mr-2 bg-red-500 rounded-full"></div>
                  Edificios Altos
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Evacuación por fases</li>
                  <li>• Control de ascensores</li>
                  <li>• Comunicación por zonas</li>
                  <li>• Presurización de escaleras</li>
                </ul>
              </div>
              
              {/* Centros Comerciales */}
              <div className="p-6 transition-all bg-white shadow-lg rounded-xl hover:shadow-2xl">
                <h4 className="flex items-center mb-3 font-bold text-gray-800">
                  <div className="w-3 h-3 mr-2 bg-blue-500 rounded-full"></div>
                  Centros Comerciales
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Mensajes multiidioma</li>
                  <li>• Señalización dinámica</li>
                  <li>• Control de multitudes</li>
                  <li>• Evacuación masiva</li>
                </ul>
              </div>
              
              {/* Hospitales */}
              <div className="p-6 transition-all bg-white shadow-lg rounded-xl hover:shadow-2xl">
                <h4 className="flex items-center mb-3 font-bold text-gray-800">
                  <div className="w-3 h-3 mr-2 bg-green-500 rounded-full"></div>
                  Hospitales
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Evacuación horizontal</li>
                  <li>• Protección de pacientes</li>
                  <li>• Comunicación silenciosa</li>
                  <li>• Respaldo crítico</li>
                </ul>
              </div>
              
              {/* Escuelas */}
              <div className="p-6 transition-all bg-white shadow-lg rounded-xl hover:shadow-2xl">
                <h4 className="flex items-center mb-3 font-bold text-gray-800">
                  <div className="w-3 h-3 mr-2 bg-yellow-500 rounded-full"></div>
                  Instituciones Educativas
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Evacuación supervisada</li>
                  <li>• Señales visuales claras</li>
                  <li>• Puntos de encuentro</li>
                  <li>• Simulacros programados</li>
                </ul>
              </div>
              
              {/* Industrias */}
              <div className="p-6 transition-all bg-white shadow-lg rounded-xl hover:shadow-2xl">
                <h4 className="flex items-center mb-3 font-bold text-gray-800">
                  <div className="w-3 h-3 mr-2 bg-orange-500 rounded-full"></div>
                  Plantas Industriales
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Ambientes ruidosos</li>
                  <li>• Señales de alta potencia</li>
                  <li>• Comunicación de emergencia</li>
                  <li>• Protección IP65</li>
                </ul>
              </div>
              
              {/* Hoteles */}
              <div className="p-6 transition-all bg-white shadow-lg rounded-xl hover:shadow-2xl">
                <h4 className="flex items-center mb-3 font-bold text-gray-800">
                  <div className="w-3 h-3 mr-2 bg-purple-500 rounded-full"></div>
                  Hoteles y Resorts
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Evacuación nocturna</li>
                  <li>• Huéspedes internacionales</li>
                  <li>• Señalización luminosa</li>
                  <li>• Sistemas silenciosos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 text-white bg-gradient-to-r from-slate-600 via-slate-700 to-red-700">
        <div className="container px-4 mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="mb-6 text-3xl font-bold md:text-5xl font-montserrat">
              ¿Necesita un Sistema de Alarma?
            </h2>
            <p className="mb-8 text-xl leading-relaxed text-white/90">
              Diseñamos e instalamos sistemas de alarma y notificación adaptados 
              a las necesidades específicas de su edificio y ocupantes.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link 
                href="/contacto" 
                className="inline-flex items-center px-8 py-4 text-lg font-bold text-orange-600 transition-all duration-300 transform bg-white rounded-xl hover:bg-gray-100 hover:scale-105"
              >
                <Zap size={24} className="mr-3" />
                Diseñar Sistema
                <ArrowRight size={20} className="ml-3" />
              </Link>
              <a 
                href="tel:+5493516810777" 
                className="inline-flex items-center px-8 py-4 text-lg font-bold text-white transition-all duration-300 border-2 border-white rounded-xl hover:bg-white hover:text-orange-600"
              >
                <Phone size={24} className="mr-3" />
                Llamar Ahora
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
      
      