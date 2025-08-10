// app/servicios/deteccion-incendios/page.js
import Link from 'next/link';
import { ArrowRight, Shield, Eye, CheckCircle, Star, Award, Clock, Users, Zap, AlertTriangle, Phone } from 'lucide-react';

export const metadata = {
  title: 'Detección de Incendios - IMSSE Ingeniería SAS | Sistemas Certificados',
  description: 'Especialistas en proyectos, instalación y programación de sistemas de detección de incendios. Certificados en Notifier, Mircom, Bosch, Inim y Secutron.',
  keywords: 'detección incendios, sensores humo, sistemas detección, Notifier, Mircom, Inim, Secutron, programación centrales',
};

export default function DeteccionIncendiosPage() {
  return (
    <div className="flex flex-col min-h-screen pt-20">
      
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden text-white bg-gradient-to-br from-slate-900 via-gray-800 to-slate-800">
        {/* Efectos de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute w-64 h-64 bg-white rounded-full top-10 right-10 blur-3xl"></div>
          <div className="absolute w-48 h-48 bg-yellow-300 rounded-full bottom-10 left-10 blur-2xl"></div>
        </div>
        
        <div className="container relative z-10 px-4 mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-6 py-3 mb-8 border rounded-full bg-white/20 backdrop-blur-sm border-white/30">
              <Eye className="mr-2 text-yellow-300" size={20} />
              <span className="font-semibold">Especialistas Certificados • Desde 1994</span>
            </div>
            
            <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl font-montserrat">
              Sistemas de
              <span className="block text-transparent bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text">
                Detección de Incendios
              </span>
            </h1>
            
            <p className="mb-8 text-xl leading-relaxed md:text-2xl text-white/90">
              Especialistas en proyectos, instalación y programación de sistemas de detección de incendios. 
              Nuestro equipo técnico está certificado en marcas de nivel internacional.
            </p>
            
            {/* Certificaciones destacadas */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <span className="px-4 py-2 font-medium text-white border rounded-full bg-white/20 backdrop-blur-sm border-white/30">
                Notifier Certified
              </span>
              <span className="px-4 py-2 font-medium text-white border rounded-full bg-white/20 backdrop-blur-sm border-white/30">
                Mircom Authorized
              </span>
              <span className="px-4 py-2 font-medium text-white border rounded-full bg-white/20 backdrop-blur-sm border-white/30">
                Inim Expert
              </span>
              <span className="px-4 py-2 font-medium text-white border rounded-full bg-white/20 backdrop-blur-sm border-white/30">
                Secutron Partner
              </span>
            </div>
            
            <Link 
              href="/contacto" 
              className="inline-flex items-center px-8 py-4 text-lg font-bold text-red-600 transition-all duration-300 transform bg-white shadow-2xl rounded-xl hover:bg-gray-100 hover:scale-105"
            >
              <Eye size={24} className="mr-3" />
              Solicitar Cotización
              <ArrowRight size={20} className="ml-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Servicios Específicos */}
      <section className="py-16 bg-white md:py-20">
        <div className="container px-4 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-bold md:text-5xl font-montserrat text-primary">
              Nuestros Servicios de Detección
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              Tecnología avanzada para la detección temprana de incendios en todo tipo de espacios
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 mx-auto mb-16 lg:grid-cols-2 max-w-7xl">
            
            {/* Proyectos y Diseño */}
            <div className="p-8 border border-red-100 shadow-lg bg-gradient-to-br from-red-50 to-white rounded-2xl">
              <div className="flex items-start space-x-6">
                <div className="p-4 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl">
                  <AlertTriangle size={32} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-2xl font-bold text-red-600 font-montserrat">
                    Proyectos y Diseño
                  </h3>
                  <p className="mb-6 leading-relaxed text-gray-600">
                    Desarrollo de proyectos integrales de detección de incendios adaptados a las necesidades específicas de cada cliente.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Análisis de riesgos específicos</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Diseño de arquitectura de sistema</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Selección de equipos certificados</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Documentación técnica completa</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Instalación Especializada */}
            <div className="p-8 border border-blue-100 shadow-lg bg-gradient-to-br from-blue-50 to-white rounded-2xl">
              <div className="flex items-start space-x-6">
                <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl">
                  <Users size={32} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-2xl font-bold text-blue-600 font-montserrat">
                    Instalación Especializada
                  </h3>
                  <p className="mb-6 leading-relaxed text-gray-600">
                    Instalación profesional realizada por técnicos certificados con experiencia en múltiples marcas internacionales.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Técnicos certificados internacionalmente</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Instalación según normativas</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Pruebas de funcionamiento</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Certificación de obra</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Programación de Centrales */}
            <div className="p-8 border border-green-100 shadow-lg bg-gradient-to-br from-green-50 to-white rounded-2xl">
              <div className="flex items-start space-x-6">
                <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl">
                  <Zap size={32} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-2xl font-bold text-green-600 font-montserrat">
                    Programación de Centrales
                  </h3>
                  <p className="mb-6 leading-relaxed text-gray-600">
                    Configuración y programación especializada de centrales de detección para optimizar la respuesta del sistema.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Programación de zonas y sectores</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Configuración de algoritmos de detección</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Integración con otros sistemas</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Pruebas y validación del sistema</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tipos de Sensores */}
            <div className="p-8 border border-purple-100 shadow-lg bg-gradient-to-br from-purple-50 to-white rounded-2xl">
              <div className="flex items-start space-x-6">
                <div className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl">
                  <Eye size={32} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-2xl font-bold text-purple-600 font-montserrat">
                    Tipos de Sensores
                  </h3>
                  <p className="mb-6 leading-relaxed text-gray-600">
                    Amplia gama de sensores especializados para diferentes tipos de riesgo y ambientes de instalación.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Sensores de humo ópticos</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Detectores de calor</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Detectores de llama UV/IR</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Detectores lineales de humo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marcas Certificadas */}
      <section className="py-16 bg-gray-50">
        <div className="container px-4 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-bold md:text-5xl font-montserrat text-primary">
              Marcas Certificadas
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              Trabajamos con las marcas líderes mundiales en sistemas de detección de incendios
            </p>
          </div>
          
          <div className="grid max-w-6xl grid-cols-1 gap-8 mx-auto md:grid-cols-2 lg:grid-cols-4">
            
            {/* Notifier */}
            <div className="p-8 text-center transition-all duration-300 transform bg-white shadow-lg rounded-2xl group hover:shadow-2xl hover:-translate-y-2">
              <div className="flex items-center justify-center w-20 h-20 p-4 mx-auto mb-6 transition-transform bg-red-100 rounded-2xl group-hover:scale-110">
                <Shield className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-red-600 font-montserrat">Notifier</h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Sistemas inteligentes de detección con tecnología avanzada y alta confiabilidad.
              </p>
              <div className="p-3 mt-4 rounded-lg bg-red-50">
                <span className="text-sm font-semibold text-red-700">Certified Partner</span>
              </div>
            </div>
            
            {/* Mircom */}
            <div className="p-8 text-center transition-all duration-300 transform bg-white shadow-lg rounded-2xl group hover:shadow-2xl hover:-translate-y-2">
              <div className="flex items-center justify-center w-20 h-20 p-4 mx-auto mb-6 transition-transform bg-blue-100 rounded-2xl group-hover:scale-110">
                <Eye className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-blue-600 font-montserrat">Mircom</h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Soluciones innovadoras en detección y comunicación de emergencias.
              </p>
              <div className="p-3 mt-4 rounded-lg bg-blue-50">
                <span className="text-sm font-semibold text-blue-700">Authorized Dealer</span>
              </div>
            </div>
            
            {/* Inim */}
            <div className="p-8 text-center transition-all duration-300 transform bg-white shadow-lg rounded-2xl group hover:shadow-2xl hover:-translate-y-2">
              <div className="flex items-center justify-center w-20 h-20 p-4 mx-auto mb-6 transition-transform bg-green-100 rounded-2xl group-hover:scale-110">
                <Zap className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-green-600 font-montserrat">Inim</h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Tecnología europea de precisión para detección de incendios.
              </p>
              <div className="p-3 mt-4 rounded-lg bg-green-50">
                <span className="text-sm font-semibold text-green-700">Expert Level</span>
              </div>
            </div>
            
            {/* Secutron */}
            <div className="p-8 text-center transition-all duration-300 transform bg-white shadow-lg rounded-2xl group hover:shadow-2xl hover:-translate-y-2">
              <div className="flex items-center justify-center w-20 h-20 p-4 mx-auto mb-6 transition-transform bg-purple-100 rounded-2xl group-hover:scale-110">
                <AlertTriangle className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-purple-600 font-montserrat">Secutron</h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Sistemas robustos y confiables para aplicaciones industriales.
              </p>
              <div className="p-3 mt-4 rounded-lg bg-purple-50">
                <span className="text-sm font-semibold text-purple-700">Certified Partner</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proceso de Trabajo */}
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-bold md:text-5xl font-montserrat text-primary">
              Nuestro Proceso de Trabajo
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              Metodología probada para garantizar la máxima eficiencia y calidad en cada proyecto
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
              
              {/* Paso 1 */}
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-2xl font-bold text-white rounded-full bg-gradient-to-r from-red-500 to-red-600">
                  1
                </div>
                <h3 className="mb-4 text-xl font-bold text-red-600 font-montserrat">Evaluación</h3>
                <p className="text-gray-600">
                  Análisis detallado del sitio y evaluación de riesgos específicos.
                </p>
              </div>
              
              {/* Paso 2 */}
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-2xl font-bold text-white rounded-full bg-gradient-to-r from-blue-500 to-blue-600">
                  2
                </div>
                <h3 className="mb-4 text-xl font-bold text-blue-600 font-montserrat">Diseño</h3>
                <p className="text-gray-600">
                  Desarrollo del proyecto técnico y selección de equipos certificados.
                </p>
              </div>
              
              {/* Paso 3 */}
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-2xl font-bold text-white rounded-full bg-gradient-to-r from-green-500 to-green-600">
                  3
                </div>
                <h3 className="mb-4 text-xl font-bold text-green-600 font-montserrat">Instalación</h3>
                <p className="text-gray-600">
                  Implementación profesional y programación especializada del sistema.
                </p>
              </div>
              
              {/* Paso 4 */}
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-2xl font-bold text-white rounded-full bg-gradient-to-r from-purple-500 to-purple-600">
                  4
                </div>
                <h3 className="mb-4 text-xl font-bold text-purple-600 font-montserrat">Certificación</h3>
                <p className="text-gray-600">
                  Pruebas finales, documentación y certificación del sistema.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 text-white bg-gradient-to-r from-slate-500 to-slate-600">
        <div className="container px-4 mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="mb-6 text-3xl font-bold md:text-5xl font-montserrat">
              ¿Necesita un Sistema de Detección?
            </h2>
            <p className="mb-8 text-xl leading-relaxed text-white/90">
              Solicite una evaluación gratuita. Nuestros especialistas certificados diseñarán 
              la solución de detección de incendios ideal para su proyecto.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link 
                href="/contacto" 
                className="inline-flex items-center px-8 py-4 text-lg font-bold text-red-600 transition-all duration-300 transform bg-white rounded-xl hover:bg-gray-100 hover:scale-105"
              >
                <Eye size={24} className="mr-3" />
                Solicitar Evaluación
                <ArrowRight size={20} className="ml-3" />
              </Link>
              <a 
                href="tel:+5493516810777" 
                className="inline-flex items-center px-8 py-4 text-lg font-bold text-white transition-all duration-300 border-2 border-white rounded-xl hover:bg-white hover:text-red-600"
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