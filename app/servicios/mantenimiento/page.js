// app/servicios/mantenimiento/page.js - PARTE 1 CORREGIDA
import Link from 'next/link';
import { 
  ArrowRight, 
  Shield, 
  Wrench, 
  CheckCircle, 
  Star, 
  Award, 
  Clock, 
  Users, 
  Zap, 
  AlertTriangle, 
  Phone, 
  Calendar, 
  Settings, 
  ToolCase,
  Volume2,
  Speaker,
  Bell
} from 'lucide-react';

export const metadata = {
  title: 'Mantenimiento de Sistemas - IMSSE Ingeniería SAS | Servicio 24/7',
  description: 'Mantenimiento preventivo y correctivo de sistemas de protección contra incendios. Servicio 24/7, técnicos certificados en Bosch y Mircom.',
  keywords: 'mantenimiento sistemas incendios, servicio técnico, reparaciones emergencia, mantenimiento preventivo, Bosch, Mircom',
};

export default function MantenimientoPage() {
  return (
    <div className="flex flex-col min-h-screen pt-20">
      
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden text-white bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 md:py-20">
        {/* Efectos de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute w-64 h-64 bg-white rounded-full top-10 right-10 blur-3xl"></div>
          <div className="absolute w-48 h-48 rounded-full bottom-10 left-10 bg-emerald-300 blur-2xl"></div>
        </div>
        
        <div className="container relative z-10 px-4 mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-6 py-3 mb-8 border rounded-full bg-white/20 backdrop-blur-sm border-white/30">
              <Wrench className="mr-2 text-emerald-300" size={20} />
              <span className="font-semibold">Servicio 24/7 • Técnicos Certificados</span>
            </div>
            
            <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl font-montserrat">
              Mantenimiento
              <span className="block text-transparent bg-gradient-to-r from-emerald-300 to-green-300 bg-clip-text">
                Especializado
              </span>
            </h1>
            
            <p className="mb-8 text-xl leading-relaxed md:text-2xl text-white/90">
              Encargados de obras y mantenimientos preventivos y correctivos. 
              Inspecciones regulares y certificaciones técnicas para garantizar el funcionamiento óptimo.
            </p>
            
            {/* Certificaciones destacadas */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <span className="px-4 py-2 font-medium text-white border rounded-full bg-white/20 backdrop-blur-sm border-white/30">
                Bosch Certified
              </span>
              <span className="px-4 py-2 font-medium text-white border rounded-full bg-white/20 backdrop-blur-sm border-white/30">
                Mircom Partner
              </span>
              <span className="px-4 py-2 font-medium text-white border rounded-full bg-white/20 backdrop-blur-sm border-white/30">
                Servicio 24/7
              </span>
              <span className="px-4 py-2 font-medium text-white border rounded-full bg-white/20 backdrop-blur-sm border-white/30">
                Respuesta Inmediata
              </span>
            </div>
            
            <Link 
              href="/contacto" 
              className="inline-flex items-center px-8 py-4 text-lg font-bold text-green-600 transition-all duration-300 transform bg-white shadow-2xl rounded-xl hover:bg-gray-100 hover:scale-105"
            >
              <Wrench size={24} className="mr-3" />
              Solicitar Mantenimiento
              <ArrowRight size={20} className="ml-3" />
            </Link>
          </div>
        </div>
      </section>
      {/* Tipos de Mantenimiento */}
      <section className="py-16 bg-white md:py-20">
        <div className="container px-4 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-bold md:text-5xl font-montserrat text-primary">
              Servicios de Mantenimiento
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              Programas integrales para mantener sus sistemas de protección en óptimas condiciones
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 mx-auto mb-16 lg:grid-cols-2 max-w-7xl">
            
            {/* Mantenimiento Preventivo */}
            <div className="p-8 border border-green-100 shadow-lg bg-gradient-to-br from-green-50 to-white rounded-2xl">
              <div className="flex items-start space-x-6">
                <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl">
                  <Calendar size={32} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-2xl font-bold text-green-600 font-montserrat">
                    Mantenimiento Preventivo
                  </h3>
                  <p className="mb-6 leading-relaxed text-gray-600">
                    Programas de mantenimiento programados para prevenir fallas y garantizar el funcionamiento óptimo de sus sistemas.
                  </p>
                  
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Inspecciones programadas</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Limpieza de componentes</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Calibración de equipos</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Reemplazo de componentes</span>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-green-50">
                    <h4 className="mb-2 font-semibold text-green-800">Frecuencia:</h4>
                    <p className="text-sm text-green-700">
                      Mensual, trimestral, semestral y anual según tipo de sistema y normativas.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mantenimiento Correctivo */}
            <div className="p-8 border border-orange-100 shadow-lg bg-gradient-to-br from-orange-50 to-white rounded-2xl">
              <div className="flex items-start space-x-6">
                <div className="p-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl">
                  <ToolCase size={32} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-2xl font-bold text-orange-600 font-montserrat">
                    Mantenimiento Correctivo
                  </h3>
                  <p className="mb-6 leading-relaxed text-gray-600">
                    Reparaciones inmediatas y servicio de emergencia 24/7 para resolver fallas y restablecer el funcionamiento.
                  </p>
                  
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Respuesta inmediata 24/7</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Diagnóstico especializado</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Reparación de fallas</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Repuestos originales</span>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-orange-50">
                    <h4 className="mb-2 font-semibold text-orange-800">Disponibilidad:</h4>
                    <p className="text-sm text-orange-700">
                      Servicio de emergencia disponible las 24 horas, los 365 días del año.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Certificaciones Técnicas */}
            <div className="p-8 border border-blue-100 shadow-lg bg-gradient-to-br from-blue-50 to-white rounded-2xl">
              <div className="flex items-start space-x-6">
                <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl">
                  <Award size={32} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-2xl font-bold text-blue-600 font-montserrat">
                    Certificaciones Técnicas
                  </h3>
                  <p className="mb-6 leading-relaxed text-gray-600">
                    Emisión de certificados de funcionamiento y documentación técnica requerida por autoridades competentes.
                  </p>
                  
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Certificados de funcionamiento</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Informes técnicos detallados</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Documentación normativa</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Habilitaciones municipales</span>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-blue-50">
                    <h4 className="mb-2 font-semibold text-blue-800">Validez:</h4>
                    <p className="text-sm text-blue-700">
                      Certificaciones anuales con validez ante autoridades competentes.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actualización de Sistemas */}
            <div className="p-8 border border-purple-100 shadow-lg bg-gradient-to-br from-purple-50 to-white rounded-2xl">
              <div className="flex items-start space-x-6">
                <div className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl">
                  <Settings size={32} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-2xl font-bold text-purple-600 font-montserrat">
                    Actualización de Sistemas
                  </h3>
                  <p className="mb-6 leading-relaxed text-gray-600">
                    Modernización y actualización de sistemas existentes para mejorar su rendimiento y cumplir nuevas normativas.
                  </p>
                  
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Evaluación de sistemas existentes</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Actualización de firmware</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Migración de tecnología</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Mejoras de capacidad</span>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-purple-50">
                    <h4 className="mb-2 font-semibold text-purple-800">Beneficios:</h4>
                    <p className="text-sm text-purple-700">
                      Mayor confiabilidad, nuevas funciones, cumplimiento normativo actualizado.
                    </p>
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
              Marcas Certificadas para Mantenimiento
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              Técnicos especializados y certificados en las principales marcas del mercado
            </p>
          </div>
          
          <div className="grid max-w-4xl grid-cols-1 gap-8 mx-auto md:grid-cols-2">
            
            {/* Bosch */}
            <div className="p-8 text-center transition-all duration-300 transform bg-white shadow-lg rounded-2xl group hover:shadow-2xl hover:-translate-y-2">
              <div className="flex items-center justify-center w-20 h-20 p-4 mx-auto mb-6 transition-transform bg-red-100 rounded-2xl group-hover:scale-110">
                <Shield className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-red-600 font-montserrat">Bosch</h3>
              <p className="mb-6 text-lg leading-relaxed text-gray-600">
                Técnicos certificados para mantenimiento de sistemas de detección Bosch con tecnología de vanguardia.
              </p>
              <div className="mb-6 space-y-3">
                <div className="flex items-center justify-center text-gray-700">
                  <CheckCircle size={16} className="mr-3 text-green-500" />
                  <span>Centrales FPA-5000</span>
                </div>
                <div className="flex items-center justify-center text-gray-700">
                  <CheckCircle size={16} className="mr-3 text-green-500" />
                  <span>Detectores inteligentes</span>
                </div>
                <div className="flex items-center justify-center text-gray-700">
                  <CheckCircle size={16} className="mr-3 text-green-500" />
                  <span>Software Building Integration</span>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-red-50">
                <span className="font-semibold text-red-700">Certified Service Partner</span>
              </div>
            </div>
            
            {/* Mircom */}
            <div className="p-8 text-center transition-all duration-300 transform bg-white shadow-lg rounded-2xl group hover:shadow-2xl hover:-translate-y-2">
              <div className="flex items-center justify-center w-20 h-20 p-4 mx-auto mb-6 transition-transform bg-blue-100 rounded-2xl group-hover:scale-110">
                <Wrench className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-blue-600 font-montserrat">Mircom</h3>
              <p className="mb-6 text-lg leading-relaxed text-gray-600">
                Especialistas en mantenimiento de sistemas Mircom con capacitación oficial y acceso a repuestos originales.
              </p>
              <div className="mb-6 space-y-3">
                <div className="flex items-center justify-center text-gray-700">
                  <CheckCircle size={16} className="mr-3 text-green-500" />
                  <span>Centrales FX-2000</span>
                </div>
                <div className="flex items-center justify-center text-gray-700">
                  <CheckCircle size={16} className="mr-3 text-green-500" />
                  <span>Sistemas de evacuación por voz</span>
                </div>
                <div className="flex items-center justify-center text-gray-700">
                  <CheckCircle size={16} className="mr-3 text-green-500" />
                  <span>Módulos de comunicación</span>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-blue-50">
                <span className="font-semibold text-blue-700">Authorized Service Provider</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proceso de Mantenimiento */}
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-bold md:text-5xl font-montserrat text-primary">
              Proceso de Mantenimiento
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              Metodología sistemática para garantizar el máximo rendimiento de sus sistemas
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
              
              {/* Paso 1 */}
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-2xl font-bold text-white rounded-full bg-gradient-to-r from-green-500 to-green-600">
                  1
                </div>
                <h3 className="mb-4 text-xl font-bold text-green-600 font-montserrat">Inspección</h3>
                <p className="text-gray-600">
                  Revisión completa de todos los componentes del sistema según protocolos establecidos.
                </p>
              </div>
              
              {/* Paso 2 */}
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-2xl font-bold text-white rounded-full bg-gradient-to-r from-blue-500 to-blue-600">
                  2
                </div>
                <h3 className="mb-4 text-xl font-bold text-blue-600 font-montserrat">Diagnóstico</h3>
                <p className="text-gray-600">
                  Análisis detallado del estado y funcionamiento de cada componente del sistema.
                </p>
              </div>
              
              {/* Paso 3 */}
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-2xl font-bold text-white rounded-full bg-gradient-to-r from-orange-500 to-orange-600">
                  3
                </div>
                <h3 className="mb-4 text-xl font-bold text-orange-600 font-montserrat">Intervención</h3>
                <p className="text-gray-600">
                  Limpieza, calibración, ajustes y reemplazo de componentes según sea necesario.
                </p>
              </div>
              
              {/* Paso 4 */}
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-2xl font-bold text-white rounded-full bg-gradient-to-r from-purple-500 to-purple-600">
                  4
                </div>
                <h3 className="mb-4 text-xl font-bold text-purple-600 font-montserrat">Documentación</h3>
                <p className="text-gray-600">
                  Registro completo de actividades y emisión de certificados de funcionamiento.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Planes de Mantenimiento */}
      <section className="py-16 bg-gray-50">
        <div className="container px-4 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-bold md:text-5xl font-montserrat text-primary">
              Planes de Mantenimiento
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              Programas diseñados para diferentes tipos de sistemas y necesidades
            </p>
          </div>
          
          <div className="grid max-w-6xl grid-cols-1 gap-8 mx-auto md:grid-cols-3">
            
            {/* Plan Básico */}
            <div className="p-8 transition-all duration-300 transform bg-white shadow-lg rounded-2xl hover:shadow-2xl hover:-translate-y-2">
              <div className="mb-6 text-center">
                <div className="flex items-center justify-center w-20 h-20 p-4 mx-auto mb-4 bg-green-100 rounded-2xl">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="mb-2 text-2xl font-bold text-green-600 font-montserrat">Plan Básico</h3>
                <p className="text-gray-600">Para sistemas residenciales y comerciales pequeños</p>
              </div>
              
              <div className="mb-8 space-y-4">
                <div className="flex items-center text-gray-700">
                  <CheckCircle size={16} className="mr-3 text-green-500" />
                  <span>Inspección semestral</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircle size={16} className="mr-3 text-green-500" />
                  <span>Limpieza de detectores</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircle size={16} className="mr-3 text-green-500" />
                  <span>Pruebas de funcionamiento</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircle size={16} className="mr-3 text-green-500" />
                  <span>Certificado anual</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircle size={16} className="mr-3 text-green-500" />
                  <span>Soporte técnico</span>
                </div>
              </div>
              
              <Link 
                href="/contacto"
                className="block w-full py-3 font-bold text-center text-white transition-all duration-300 bg-green-600 hover:bg-green-700 rounded-xl"
              >
                Contratar Plan
              </Link>
            </div>
            
            {/* Plan Profesional */}
            <div className="p-8 transition-all duration-300 transform bg-white border-2 border-blue-200 shadow-lg rounded-2xl hover:shadow-2xl hover:-translate-y-2">
              <div className="mb-6 text-center">
                <div className="flex items-center justify-center w-20 h-20 p-4 mx-auto mb-4 bg-blue-100 rounded-2xl">
                  <Star className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="mb-2 text-2xl font-bold text-blue-600 font-montserrat">Plan Profesional</h3>
                <p className="text-gray-600">Para edificios comerciales e industriales</p>
                <div className="inline-block px-3 py-1 mt-2 rounded-full bg-blue-50">
                  <span className="text-sm font-semibold text-blue-700">Más Popular</span>
                </div>
              </div>
              
              <div className="mb-8 space-y-4">
                <div className="flex items-center text-gray-700">
                  <CheckCircle size={16} className="mr-3 text-green-500" />
                  <span>Inspección trimestral</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircle size={16} className="mr-3 text-green-500" />
                  <span>Mantenimiento preventivo completo</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircle size={16} className="mr-3 text-green-500" />
                  <span>Servicio correctivo incluido</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircle size={16} className="mr-3 text-green-500" />
                  <span>Respuesta 24/7</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircle size={16} className="mr-3 text-green-500" />
                  <span>Certificaciones trimestrales</span>
                </div>
                </div>
              
              <Link 
                href="/contacto"
                className="block w-full py-3 font-bold text-center text-white transition-all duration-300 bg-blue-600 hover:bg-blue-700 rounded-xl"
              >
                Contratar Plan
              </Link>
            </div>
            
            {/* Plan Premium */}
            <div className="p-8 transition-all duration-300 transform bg-white shadow-lg rounded-2xl hover:shadow-2xl hover:-translate-y-2">
              <div className="mb-6 text-center">
                <div className="flex items-center justify-center w-20 h-20 p-4 mx-auto mb-4 bg-purple-100 rounded-2xl">
                  <Award className="w-10 h-10 text-purple-600" />
                </div>
                <h3 className="mb-2 text-2xl font-bold text-purple-600 font-montserrat">Plan Premium</h3>
                <p className="text-gray-600">Para instalaciones críticas y alta complejidad</p>
              </div>
              
              <div className="mb-8 space-y-4">
                <div className="flex items-center text-gray-700">
                  <CheckCircle size={16} className="mr-3 text-green-500" />
                  <span>Inspección mensual</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircle size={16} className="mr-3 text-green-500" />
                  <span>Mantenimiento predictivo</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircle size={16} className="mr-3 text-green-500" />
                  <span>Monitoreo remoto</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircle size={16} className="mr-3 text-green-500" />
                  <span>Técnico dedicado</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircle size={16} className="mr-3 text-green-500" />
                  <span>Actualizaciones incluidas</span>
                </div>
              </div>
              
              <Link 
                href="/contacto"
                className="block w-full py-3 font-bold text-center text-white transition-all duration-300 bg-purple-600 hover:bg-purple-700 rounded-xl"
              >
                Contratar Plan
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Servicio de Emergencia */}
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="p-8 text-white shadow-2xl bg-gradient-to-r from-red-600 via-red-700 to-red-800 md:p-12 rounded-2xl">
              <div className="flex flex-col items-center space-y-6 lg:flex-row lg:space-y-0 lg:space-x-8">
                <div className="p-4 border bg-white/20 backdrop-blur-sm rounded-2xl border-white/30">
                  <AlertTriangle size={48} className="text-white" />
                </div>
                <div className="flex-1 text-center lg:text-left">
                  <h3 className="mb-4 text-3xl font-bold text-white font-montserrat">
                    Servicio de Emergencia 24/7
                  </h3>
                  <p className="mb-6 text-xl leading-relaxed text-gray-200">
                    Respuesta inmediata ante fallas en sistemas de protección contra incendios. 
                    Nuestro equipo está disponible las 24 horas para garantizar su seguridad.
                  </p>
                  
                  <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2">
                    <div className="flex items-center text-gray-200">
                      <Clock size={16} className="mr-3 text-yellow-400" />
                      <span>Respuesta en menos de 2 horas</span>
                    </div>
                    <div className="flex items-center text-gray-200">
                      <Users size={16} className="mr-3 text-yellow-400" />
                      <span>Técnicos especializados</span>
                    </div>
                    <div className="flex items-center text-gray-200">
                      <Wrench size={16} className="mr-3 text-yellow-400" />
                      <span>Herramientas y repuestos</span>
                    </div>
                    <div className="flex items-center text-gray-200">
                      <Shield size={16} className="mr-3 text-yellow-400" />
                      <span>Garantía de servicio</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                    <a 
                      href="tel:+5493516810777" 
                      className="inline-flex items-center px-8 py-4 text-lg font-bold text-red-600 transition-all duration-300 transform bg-white rounded-xl hover:bg-gray-100 hover:scale-105"
                    >
                      <Phone size={24} className="mr-3" />
                      Llamar Emergencia
                    </a>
                    <Link 
                      href="/contacto"
                      className="inline-flex items-center px-8 py-4 text-lg font-bold text-white transition-all duration-300 border-2 border-white rounded-xl hover:bg-white hover:text-red-600"
                    >
                      <AlertTriangle size={20} className="mr-3" />
                      Contactar Ahora
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Sistemas que Mantenemos */}
      <section className="py-16 bg-gray-50">
        <div className="container px-4 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-bold md:text-5xl font-montserrat text-primary">
              Sistemas que Mantenemos
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              Servicio especializado para todos los tipos de sistemas de protección contra incendios
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              
              {/* Detección */}
              <div className="p-6 transition-all bg-white shadow-lg rounded-xl hover:shadow-2xl">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 mr-3 bg-red-500 rounded-full"></div>
                  <h4 className="font-bold text-gray-800">Sistemas de Detección</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Centrales de detección</li>
                  <li>• Detectores de humo y calor</li>
                  <li>• Detectores de llama</li>
                  <li>• Módulos de entrada/salida</li>
                </ul>
              </div>
              
              {/* Alarma */}
              <div className="p-6 transition-all bg-white shadow-lg rounded-xl hover:shadow-2xl">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 mr-3 bg-orange-500 rounded-full"></div>
                  <h4 className="font-bold text-gray-800">Sistemas de Alarma</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Centrales de notificación</li>
                  <li>• Sirenas y altavoces</li>
                  <li>• Sistemas de evacuación por voz</li>
                  <li>• Señalización visual</li>
                </ul>
              </div>
              
              {/* Rociadores */}
              <div className="p-6 transition-all bg-white shadow-lg rounded-xl hover:shadow-2xl">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 mr-3 bg-blue-500 rounded-full"></div>
                  <h4 className="font-bold text-gray-800">Rociadores Automáticos</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Sistemas húmedos y secos</li>
                  <li>• Válvulas y accesorios</li>
                  <li>• Bombas contra incendios</li>
                  <li>• Tableros de control</li>
                </ul>
              </div>
              
              {/* Extinción */}
              <div className="p-6 transition-all bg-white shadow-lg rounded-xl hover:shadow-2xl">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 mr-3 bg-green-500 rounded-full"></div>
                  <h4 className="font-bold text-gray-800">Sistemas de Extinción</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Sistemas de gas limpio</li>
                  <li>• Agua nebulizada</li>
                  <li>• Sistemas de espuma</li>
                  <li>• Válvulas de diluvio</li>
                </ul>
              </div>
              
              {/* Monitoreo */}
              <div className="p-6 transition-all bg-white shadow-lg rounded-xl hover:shadow-2xl">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 mr-3 bg-purple-500 rounded-full"></div>
                  <h4 className="font-bold text-gray-800">Sistemas de Monitoreo</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Comunicadores de alarma</li>
                  <li>• Sistemas de transmisión</li>
                  <li>• Monitoreo remoto</li>
                  <li>• Interfaces de red</li>
                </ul>
              </div>
              
              {/* Accesorios */}
              <div className="p-6 transition-all bg-white shadow-lg rounded-xl hover:shadow-2xl">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 mr-3 bg-yellow-500 rounded-full"></div>
                  <h4 className="font-bold text-gray-800">Accesorios y Componentes</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Estaciones manuales</li>
                  <li>• Módulos de control</li>
                  <li>• Fuentes de alimentación</li>
                  <li>• Baterías de respaldo</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Beneficios del Mantenimiento */}
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-bold md:text-5xl font-montserrat text-primary">
              Beneficios del Mantenimiento Preventivo
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              La inversión en mantenimiento preventivo genera importantes beneficios a largo plazo
            </p>
          </div>
          
          <div className="grid max-w-6xl grid-cols-1 gap-8 mx-auto md:grid-cols-2 lg:grid-cols-4">
            
            {/* Confiabilidad */}
            <div className="text-center">
              <div className="flex items-center justify-center w-20 h-20 p-4 mx-auto mb-6 bg-green-100 rounded-2xl">
                <Shield className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-green-600 font-montserrat">Mayor Confiabilidad</h3>
              <p className="text-gray-600">
                Sistemas que funcionan correctamente cuando más se necesitan, reduciendo riesgos de seguridad.
              </p>
            </div>
            
            {/* Vida Útil */}
            <div className="text-center">
              <div className="flex items-center justify-center w-20 h-20 p-4 mx-auto mb-6 bg-blue-100 rounded-2xl">
                <Clock className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-blue-600 font-montserrat">Vida Útil Extendida</h3>
              <p className="text-gray-600">
                El mantenimiento regular prolonga significativamente la vida útil de los equipos y componentes.
              </p>
            </div>
            
            {/* Costos */}
            <div className="text-center">
              <div className="flex items-center justify-center w-20 h-20 p-4 mx-auto mb-6 bg-orange-100 rounded-2xl">
                <Award className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-orange-600 font-montserrat">Menores Costos</h3>
              <p className="text-gray-600">
                Prevenir fallas es más económico que repararlas. Evita costosas reparaciones de emergencia.
              </p>
            </div>
            
            {/* Cumplimiento */}
            <div className="text-center">
              <div className="flex items-center justify-center w-20 h-20 p-4 mx-auto mb-6 bg-purple-100 rounded-2xl">
                <CheckCircle className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-purple-600 font-montserrat">Cumplimiento Normativo</h3>
              <p className="text-gray-600">
                Garantiza el cumplimiento de normativas y regulaciones de seguridad vigentes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 text-white bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800">
        <div className="container px-4 mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="mb-6 text-3xl font-bold md:text-5xl font-montserrat">
              ¿Necesita Mantenimiento para sus Sistemas?
            </h2>
            <p className="mb-8 text-xl leading-relaxed text-white/90">
              No espere a que falle su sistema de protección. Contrate nuestro servicio de mantenimiento 
              preventivo y mantenga su inversión protegida las 24 horas del día.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link 
                href="/contacto" 
                className="inline-flex items-center px-8 py-4 text-lg font-bold text-green-600 transition-all duration-300 transform bg-white rounded-xl hover:bg-gray-100 hover:scale-105"
              >
                <Wrench size={24} className="mr-3" />
                Contratar Mantenimiento
                <ArrowRight size={20} className="ml-3" />
              </Link>
              <a 
                href="tel:+5493516810777" 
                className="inline-flex items-center px-8 py-4 text-lg font-bold text-white transition-all duration-300 border-2 border-white rounded-xl hover:bg-white hover:text-green-600"
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
      
            