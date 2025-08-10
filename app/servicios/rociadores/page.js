// app/servicios/rociadores/page.js
import Link from 'next/link';
import { ArrowRight, Shield, Droplets, CheckCircle, Star, Award, Clock, Users, Zap, AlertTriangle, Phone, Thermometer, Settings } from 'lucide-react';

export const metadata = {
  title: 'Rociadores Automáticos - IMSSE Ingeniería SAS | Sistemas Sprinkler',
  description: 'Diseño, instalación y mantenimiento de sistemas de rociadores automáticos. Sprinklers, válvulas, bombas y cálculo hidráulico especializado.',
  keywords: 'rociadores automáticos, sprinklers, sistemas húmedos, sistemas secos, válvulas, bombas contra incendios',
};

export default function RociadoresPage() {
  return (
    <div className="flex flex-col min-h-screen pt-20">
      
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden text-white bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 md:py-20">
        {/* Efectos de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute w-64 h-64 bg-white rounded-full top-10 right-10 blur-3xl"></div>
          <div className="absolute w-48 h-48 rounded-full bottom-10 left-10 bg-cyan-300 blur-2xl"></div>
        </div>
        
        <div className="container relative z-10 px-4 mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-6 py-3 mb-8 border rounded-full bg-white/20 backdrop-blur-sm border-white/30">
              <Droplets className="mr-2 text-cyan-300" size={20} />
              <span className="font-semibold">Protección Hidráulica • Sistemas Certificados</span>
            </div>
            
            <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl font-montserrat">
              Sistemas de
              <span className="block text-transparent bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text">
                Rociadores Automáticos
              </span>
            </h1>
            
            <p className="mb-8 text-xl leading-relaxed md:text-2xl text-white/90">
              Diseño, instalación y mantenimiento de sistemas de rociadores automáticos (sprinklers) 
              para protección efectiva contra incendios en todo tipo de edificaciones.
            </p>
            
            {/* Tipos de sistemas destacados */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <span className="px-4 py-2 font-medium text-white border rounded-full bg-white/20 backdrop-blur-sm border-white/30">
                Sistemas Húmedos
              </span>
              <span className="px-4 py-2 font-medium text-white border rounded-full bg-white/20 backdrop-blur-sm border-white/30">
                Sistemas Secos
              </span>
              <span className="px-4 py-2 font-medium text-white border rounded-full bg-white/20 backdrop-blur-sm border-white/30">
                Pre-acción
              </span>
              <span className="px-4 py-2 font-medium text-white border rounded-full bg-white/20 backdrop-blur-sm border-white/30">
                Diluvio
              </span>
            </div>
            
            <Link 
              href="/contacto" 
              className="inline-flex items-center px-8 py-4 text-lg font-bold transition-all duration-300 transform bg-white shadow-2xl text-cyan-600 rounded-xl hover:bg-gray-100 hover:scale-105"
            >
              <Droplets size={24} className="mr-3" />
              Solicitar Diseño
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
              Tipos de Sistemas de Rociadores
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              Soluciones especializadas para diferentes aplicaciones y condiciones ambientales
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 mx-auto mb-16 lg:grid-cols-2 max-w-7xl">
            
            {/* Sistemas Húmedos */}
            <div className="p-8 border border-blue-100 shadow-lg bg-gradient-to-br from-blue-50 to-white rounded-2xl">
              <div className="flex items-start space-x-6">
                <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl">
                  <Droplets size={32} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-2xl font-bold text-blue-600 font-montserrat">
                    Sistemas Húmedos
                  </h3>
                  <p className="mb-6 leading-relaxed text-gray-600">
                    El tipo más común y confiable. Las tuberías contienen agua a presión lista para descarga inmediata.
                  </p>
                  
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Respuesta inmediata</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Sistema más simple y confiable</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Menor costo de instalación</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Mantenimiento mínimo</span>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-blue-50">
                    <h4 className="mb-2 font-semibold text-blue-800">Aplicaciones:</h4>
                    <p className="text-sm text-blue-700">
                      Oficinas, hoteles, hospitales, centros comerciales, residencias.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sistemas Secos */}
            <div className="p-8 border border-orange-100 shadow-lg bg-gradient-to-br from-orange-50 to-white rounded-2xl">
              <div className="flex items-start space-x-6">
                <div className="p-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl">
                  <Thermometer size={32} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-2xl font-bold text-orange-600 font-montserrat">
                    Sistemas Secos
                  </h3>
                  <p className="mb-6 leading-relaxed text-gray-600">
                    Las tuberías contienen aire o nitrógeno a presión. Ideal para áreas con riesgo de congelamiento.
                  </p>
                  
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Protección contra congelamiento</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Válvula de diluvio automática</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Supervisión por aire/nitrógeno</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Activación automática</span>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-orange-50">
                    <h4 className="mb-2 font-semibold text-orange-800">Aplicaciones:</h4>
                    <p className="text-sm text-orange-700">
                      Depósitos sin calefacción, estacionamientos, áticos, áreas exteriores cubiertas.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sistemas de Pre-acción */}
            <div className="p-8 border border-green-100 shadow-lg bg-gradient-to-br from-green-50 to-white rounded-2xl">
              <div className="flex items-start space-x-6">
                <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl">
                  <Settings size={32} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-2xl font-bold text-green-600 font-montserrat">
                    Sistemas de Pre-acción
                  </h3>
                  <p className="mb-6 leading-relaxed text-gray-600">
                    Sistema híbrido que requiere dos eventos independientes antes de la descarga de agua.
                  </p>
                  
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Doble seguridad contra descargas accidentales</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Detección anticipada de incendios</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Protección de equipos sensibles</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Supervisión avanzada</span>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-green-50">
                    <h4 className="mb-2 font-semibold text-green-800">Aplicaciones:</h4>
                    <p className="text-sm text-green-700">
                      Centros de datos, archivos, museos, bibliotecas, laboratorios.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sistemas de Diluvio */}
            <div className="p-8 border border-purple-100 shadow-lg bg-gradient-to-br from-purple-50 to-white rounded-2xl">
              <div className="flex items-start space-x-6">
                <div className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl">
                  <Zap size={32} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-2xl font-bold text-purple-600 font-montserrat">
                    Sistemas de Diluvio
                  </h3>
                  <p className="mb-6 leading-relaxed text-gray-600">
                    Todos los rociadores se abren simultáneamente para descarga masiva en riesgos de alta propagación.
                  </p>
                  
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Descarga simultánea total</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Control de incendios rápidos</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Rociadores abiertos</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Activación por detección externa</span>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-purple-50">
                    <h4 className="mb-2 font-semibold text-purple-800">Aplicaciones:</h4>
                    <p className="text-sm text-purple-700">
                      Transformadores, hangares, depósitos de líquidos inflamables.
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
              Equipos de alta calidad para sistemas de rociadores confiables y eficientes
            </p>
          </div>
          
          <div className="grid max-w-6xl grid-cols-1 gap-6 mx-auto md:grid-cols-2 lg:grid-cols-4">
            
            {/* Rociadores */}
            <div className="p-6 text-center transition-all duration-300 transform bg-white shadow-lg rounded-xl hover:shadow-2xl hover:-translate-y-1">
              <div className="flex items-center justify-center w-16 h-16 p-3 mx-auto mb-4 bg-blue-100 rounded-xl">
                <Droplets className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="mb-3 font-bold text-gray-800">Rociadores</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Rociadores estándar</li>
                <li>• Respuesta rápida</li>
                <li>• Ocultos y decorativos</li>
                <li>• Sidewall y upright</li>
              </ul>
            </div>
            
            {/* Válvulas */}
            <div className="p-6 text-center transition-all duration-300 transform bg-white shadow-lg rounded-xl hover:shadow-2xl hover:-translate-y-1">
              <div className="flex items-center justify-center w-16 h-16 p-3 mx-auto mb-4 bg-green-100 rounded-xl">
                <Settings className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="mb-3 font-bold text-gray-800">Válvulas de Control</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Válvulas de gobierno</li>
                <li>• Válvulas check</li>
                <li>• Válvulas de alarma</li>
                <li>• Válvulas de control</li>
              </ul>
            </div>
            
            {/* Bombas */}
            <div className="p-6 text-center transition-all duration-300 transform bg-white shadow-lg rounded-xl hover:shadow-2xl hover:-translate-y-1">
              <div className="flex items-center justify-center w-16 h-16 p-3 mx-auto mb-4 bg-orange-100 rounded-xl">
                <Zap className="w-8 h-8 text-orange-600" />
              </div>
              <h4 className="mb-3 font-bold text-gray-800">Bombas Contra Incendios</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Bombas eléctricas</li>
                <li>• Bombas diesel</li>
                <li>• Bombas jockey</li>
                <li>• Sistemas de control</li>
              </ul>
            </div>
            
            {/* Tanques */}
            <div className="p-6 text-center transition-all duration-300 transform bg-white shadow-lg rounded-xl hover:shadow-2xl hover:-translate-y-1">
              <div className="flex items-center justify-center w-16 h-16 p-3 mx-auto mb-4 bg-purple-100 rounded-xl">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="mb-3 font-bold text-gray-800">Tanques y Reserva</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Tanques de reserva</li>
                <li>• Tanques de presión</li>
                <li>• Conexiones siamesas</li>
                <li>• Medidores de flujo</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Servicios Especializados */}
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-bold md:text-5xl font-montserrat text-primary">
              Servicios Especializados
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              Servicios completos desde el diseño hasta el mantenimiento
            </p>
          </div>
          
          <div className="grid max-w-6xl grid-cols-1 gap-8 mx-auto md:grid-cols-3">
            
            {/* Cálculo Hidráulico */}
            <div className="p-8 text-center transition-all duration-300 transform bg-white shadow-lg rounded-2xl group hover:shadow-2xl hover:-translate-y-2">
              <div className="flex items-center justify-center w-20 h-20 p-4 mx-auto mb-6 transition-transform bg-blue-100 rounded-2xl group-hover:scale-110">
                <AlertTriangle className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-blue-600 font-montserrat">Cálculo Hidráulico</h3>
              <p className="mb-6 leading-relaxed text-gray-600">
                Cálculos hidráulicos especializados según normativas NFPA para dimensionamiento correcto del sistema.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-center">
                  <CheckCircle size={14} className="mr-2 text-green-500" />
                  <span>Análisis de demanda</span>
                </div>
                <div className="flex items-center justify-center">
                  <CheckCircle size={14} className="mr-2 text-green-500" />
                  <span>Dimensionamiento de tuberías</span>
                </div>
                <div className="flex items-center justify-center">
                  <CheckCircle size={14} className="mr-2 text-green-500" />
                  <span>Selección de bombas</span>
                </div>
              </div>
            </div>
            
            {/* Instalación */}
            <div className="p-8 text-center transition-all duration-300 transform bg-white shadow-lg rounded-2xl group hover:shadow-2xl hover:-translate-y-2">
              <div className="flex items-center justify-center w-20 h-20 p-4 mx-auto mb-6 transition-transform bg-green-100 rounded-2xl group-hover:scale-110">
                <Users className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-green-600 font-montserrat">Instalación Profesional</h3>
              <p className="mb-6 leading-relaxed text-gray-600">
                Instalación realizada por técnicos especializados con experiencia en sistemas de rociadores.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-center">
                  <CheckCircle size={14} className="mr-2 text-green-500" />
                  <span>Técnicos certificados</span>
                </div>
                <div className="flex items-center justify-center">
                  <CheckCircle size={14} className="mr-2 text-green-500" />
                  <span>Pruebas hidrostáticas</span>
                </div>
                <div className="flex items-center justify-center">
                  <CheckCircle size={14} className="mr-2 text-green-500" />
                  <span>Certificación final</span>
                </div>
              </div>
            </div>
            
            {/* Mantenimiento */}
            <div className="p-8 text-center transition-all duration-300 transform bg-white shadow-lg rounded-2xl group hover:shadow-2xl hover:-translate-y-2">
              <div className="flex items-center justify-center w-20 h-20 p-4 mx-auto mb-6 transition-transform bg-orange-100 rounded-2xl group-hover:scale-110">
                <Clock className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-orange-600 font-montserrat">Mantenimiento Preventivo</h3>
              <p className="mb-6 leading-relaxed text-gray-600">
                Programas de mantenimiento preventivo y correctivo para asegurar el funcionamiento óptimo.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-center">
                  <CheckCircle size={14} className="mr-2 text-green-500" />
                  <span>Inspecciones periódicas</span>
                </div>
                <div className="flex items-center justify-center">
                  <CheckCircle size={14} className="mr-2 text-green-500" />
                  <span>Pruebas de funcionamiento</span>
                </div>
                <div className="flex items-center justify-center">
                  <CheckCircle size={14} className="mr-2 text-green-500" />
                  <span>Servicio 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Normativas y Estándares */}
      <section className="py-16 bg-gray-50">
        <div className="container px-4 mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="p-8 text-white shadow-2xl bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 md:p-12 rounded-2xl">
              <div className="mb-12 text-center">
                <h2 className="mb-6 text-3xl font-bold md:text-4xl font-montserrat">
                  Normativas y Estándares
                </h2>
                <p className="max-w-3xl mx-auto text-xl text-gray-200">
                  Cumplimos con las normativas internacionales más exigentes para sistemas de rociadores
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-6 border bg-white/10 backdrop-blur-sm rounded-xl border-white/20">
                  <div className="flex items-center mb-4">
                    <Shield className="w-8 h-8 mr-3 text-blue-400" />
                    <h3 className="text-xl font-bold">NFPA 13</h3>
                  </div>
                  <p className="mb-4 text-gray-300">
                    Estándar para instalación de sistemas de rociadores automáticos.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Diseño hidráulico</li>
                    <li>• Clasificación de ocupaciones</li>
                    <li>• Espaciamiento de rociadores</li>
                  </ul>
                </div>
                
                <div className="p-6 border bg-white/10 backdrop-blur-sm rounded-xl border-white/20">
                  <div className="flex items-center mb-4">
                    <Zap className="w-8 h-8 mr-3 text-green-400" />
                    <h3 className="text-xl font-bold">NFPA 20</h3>
                  </div>
                  <p className="mb-4 text-gray-300">
                    Estándar para instalación de bombas contra incendios estacionarias.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Bombas centrífugas</li>
                    <li>• Sistemas de control</li>
                    <li>• Pruebas de aceptación</li>
                  </ul>
                </div>
                
                <div className="p-6 border bg-white/10 backdrop-blur-sm rounded-xl border-white/20">
                  <div className="flex items-center mb-4">
                    <Settings className="w-8 h-8 mr-3 text-yellow-400" />
                    <h3 className="text-xl font-bold">NFPA 25</h3>
                  </div>
                  <p className="mb-4 text-gray-300">
                    Estándar para inspección, prueba y mantenimiento de sistemas de protección.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Programas de mantenimiento</li>
                    <li>• Frecuencia de inspecciones</li>
                    <li>• Documentación requerida</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <div className="inline-flex items-center px-6 py-3 border rounded-full bg-white/20 backdrop-blur-sm border-white/30">
                  <Award className="mr-2 text-yellow-300" size={20} />
                  <span className="font-semibold">Certificaciones Internacionales • Cumplimiento Total</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Aplicaciones por Sector */}
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-bold md:text-5xl font-montserrat text-primary">
              Aplicaciones por Sector
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              Sistemas de rociadores especializados para diferentes industrias y aplicaciones
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              
              {/* Comercial */}
              <div className="p-6 transition-all border border-blue-200 bg-gradient-to-br from-blue-50 to-white rounded-xl hover:shadow-lg">
                <h4 className="mb-3 font-bold text-blue-800">Comercial</h4>
                <ul className="space-y-2 text-sm text-blue-600">
                  <li>• Centros comerciales</li>
                  <li>• Oficinas corporativas</li>
                  <li>• Hoteles y restaurantes</li>
                  <li>• Bancos y financieras</li>
                </ul>
              </div>
              
              {/* Industrial */}
              <div className="p-6 transition-all border border-orange-200 bg-gradient-to-br from-orange-50 to-white rounded-xl hover:shadow-lg">
                <h4 className="mb-3 font-bold text-orange-800">Industrial</h4>
                <ul className="space-y-2 text-sm text-orange-600">
                  <li>• Plantas manufactureras</li>
                  <li>• Depósitos y almacenes</li>
                  <li>• Plantas petroquímicas</li>
                  <li>• Fábricas textiles</li>
                </ul>
              </div>
              
              {/* Institucional */}
              <div className="p-6 transition-all border border-green-200 bg-gradient-to-br from-green-50 to-white rounded-xl hover:shadow-lg">
                <h4 className="mb-3 font-bold text-green-800">Institucional</h4>
                <ul className="space-y-2 text-sm text-green-600">
                  <li>• Hospitales y clínicas</li>
                  <li>• Escuelas y universidades</li>
                  <li>• Edificios gubernamentales</li>
                  <li>• Asilos y geriátricos</li>
                </ul>
              </div>
              
              {/* Residencial */}
              <div className="p-6 transition-all border border-purple-200 bg-gradient-to-br from-purple-50 to-white rounded-xl hover:shadow-lg">
                <h4 className="mb-3 font-bold text-purple-800">Residencial</h4>
                <ul className="space-y-2 text-sm text-purple-600">
                  <li>• Torres de departamentos</li>
                  <li>• Condominios</li>
                  <li>• Casas unifamiliares</li>
                  <li>• Residencias de lujo</li>
                </ul>
              </div>
              
              {/* Especial */}
              <div className="p-6 transition-all border border-red-200 bg-gradient-to-br from-red-50 to-white rounded-xl hover:shadow-lg">
                <h4 className="mb-3 font-bold text-red-800">Aplicaciones Especiales</h4>
                <ul className="space-y-2 text-sm text-red-600">
                  <li>• Hangares de aviación</li>
                  <li>• Centros de datos</li>
                  <li>• Túneles vehiculares</li>
                  <li>• Plataformas marinas</li>
                </ul>
              </div>
              
              {/* Riesgo Alto */}
              <div className="p-6 transition-all border border-yellow-200 bg-gradient-to-br from-yellow-50 to-white rounded-xl hover:shadow-lg">
                <h4 className="mb-3 font-bold text-yellow-800">Alto Riesgo</h4>
                <ul className="space-y-2 text-sm text-yellow-600">
                  <li>• Depósitos de plásticos</li>
                  <li>• Almacenes de caucho</li>
                  <li>• Industrias químicas</li>
                  <li>• Procesamiento de madera</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 text-white bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800">
        <div className="container px-4 mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="mb-6 text-3xl font-bold md:text-5xl font-montserrat">
              ¿Necesita Rociadores Automáticos?
            </h2>
            <p className="mb-8 text-xl leading-relaxed text-white/90">
              Diseñamos e instalamos sistemas de rociadores automáticos adaptados 
              a su tipo de ocupación y nivel de riesgo específico.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link 
                href="/contacto" 
                className="inline-flex items-center px-8 py-4 text-lg font-bold transition-all duration-300 transform bg-white text-cyan-600 rounded-xl hover:bg-gray-100 hover:scale-105"
              >
                <Droplets size={24} className="mr-3" />
                Solicitar Cálculo
                <ArrowRight size={20} className="ml-3" />
              </Link>
              <a 
                href="tel:+5493516810777" 
                className="inline-flex items-center px-8 py-4 text-lg font-bold text-white transition-all duration-300 border-2 border-white rounded-xl hover:bg-white hover:text-cyan-600"
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