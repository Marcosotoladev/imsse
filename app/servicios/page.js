// app/servicios/page.js
import Link from 'next/link';
import { ArrowRight, Shield, Flame, Eye, Zap, Wrench, AlertTriangle, CheckCircle, Star, Award, Clock, Users } from 'lucide-react';

export const metadata = {
  title: 'Servicios - IMSSE Ingeniería SAS | Sistemas de Protección Contra Incendios',
  description: 'Servicios especializados en detección, extinción, sistemas de alarma, mantenimiento y consultoría en protección contra incendios. Certificados en Notifier, Mircom, Bosch, Inim y Secutron.',
  keywords: 'detección incendios, extinción incendios, sistemas alarma, mantenimiento, consultoría seguridad, rociadores automáticos',
};

export default function ServiciosPage() {
  return (
    <div className="flex flex-col min-h-screen pt-20">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-imsse text-white py-16 md:py-20 overflow-hidden">
        {/* Efectos de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-secondary rounded-full blur-2xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-8 border border-white/30">
              <Shield className="text-yellow-300 mr-2" size={20} />
              <span className="font-semibold">Servicios Certificados • Desde 1994</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-montserrat font-bold mb-6 leading-tight">
              Servicios Especializados en
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Protección Contra Incendios
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed">
              Somos especialistas en proyectos, instalación y programación de sistemas de detección de incendios. 
              Nuestro equipo técnico está certificado en marcas de nivel internacional.
            </p>
            
            {/* Certificaciones destacadas */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full font-medium border border-white/30">
                Notifier Certified
              </span>
              <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full font-medium border border-white/30">
                Mircom Authorized
              </span>
              <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full font-medium border border-white/30">
                Bosch Partner
              </span>
              <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full font-medium border border-white/30">
                Inim & Secutron
              </span>
            </div>
            
            <Link 
              href="/contacto" 
              className="inline-flex items-center bg-white text-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              <Shield size={24} className="mr-3" />
              Solicitar Consulta Técnica
              <ArrowRight size={20} className="ml-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Servicios Principales */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-montserrat font-bold mb-6 text-primary">
              Nuestros Servicios Especializados
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Más de 30 años de experiencia nos respaldan como líderes en sistemas de protección contra incendios
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            
            {/* Detección de Incendios */}
            <div className="group bg-gradient-to-br from-red-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-red-100">
              <div className="flex items-start space-x-6">
                <div className="bg-gradient-to-r from-primary to-red-600 p-4 rounded-2xl">
                  <Eye size={32} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-montserrat font-bold mb-4 text-primary">
                    Detección de Incendios
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    <strong>Especialistas en proyectos, instalación y programación</strong> de sistemas de detección de incendios. 
                    Utilizamos tecnología avanzada para identificar incendios en etapas iniciales.
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Sensores de humo, calor y llama</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Programación especializada de centrales</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Integración con sistemas existentes</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Certificaciones técnicas</span>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 p-4 rounded-lg mb-6">
                    <h4 className="font-semibold text-red-800 mb-2">Marcas Certificadas:</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-sm font-medium">Notifier</span>
                      <span className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-sm font-medium">Mircom</span>
                      <span className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-sm font-medium">Inim</span>
                      <span className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-sm font-medium">Secutron</span>
                    </div>
                  </div>
                  
                  <Link 
                    href="/servicios/deteccion-incendios"
                    className="group/link inline-flex items-center text-primary font-bold hover:text-red-600 transition-colors"
                  >
                    Ver detalles del servicio
                    <ArrowRight size={16} className="ml-2 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Extinción de Incendios */}
            <div className="group bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-blue-100">
              <div className="flex items-start space-x-6">
                <div className="bg-gradient-to-r from-secondary to-blue-600 p-4 rounded-2xl">
                  <Flame size={32} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-montserrat font-bold mb-4 text-secondary">
                    Extinción de Incendios
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    <strong>Encargada de aprobaciones y habilitaciones de obra, cálculo y diseño</strong> de sistemas de extinción de incendios. 
                    Soluciones especializadas para diferentes tipos de riesgo.
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Sistemas por gas limpio</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Agua nebulizada y espuma</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Cálculo hidráulico especializado</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Habilitaciones municipales</span>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <h4 className="font-semibold text-blue-800 mb-2">Especialización:</h4>
                    <p className="text-blue-700 text-sm">
                      Posgrado en higiene y seguridad. Cálculo y diseño de sistemas según normativas internacionales.
                    </p>
                  </div>
                  
                  <Link 
                    href="/servicios/extincion-incendios"
                    className="group/link inline-flex items-center text-secondary font-bold hover:text-blue-600 transition-colors"
                  >
                    Ver detalles del servicio
                    <ArrowRight size={16} className="ml-2 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Sistemas de Alarma */}
            <div className="group bg-gradient-to-br from-orange-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-orange-100">
              <div className="flex items-start space-x-6">
                <div className="bg-gradient-to-r from-warning to-orange-600 p-4 rounded-2xl">
                  <Zap size={32} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-montserrat font-bold mb-4 text-warning">
                    Sistemas de Alarma
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Centrales de alarma contra incendios, notificación masiva y evacuación 
                    con sistemas de audio y señalización visual avanzada.
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Centrales inteligentes</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Sistemas de evacuación por voz</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Señalización luminosa de emergencia</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Integración con protocolos de evacuación</span>
                    </div>
                  </div>
                  
                  <Link 
                    href="/servicios/sistemas-alarma"
                    className="group/link inline-flex items-center text-warning font-bold hover:text-orange-600 transition-colors"
                  >
                    Ver detalles del servicio
                    <ArrowRight size={16} className="ml-2 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Mantenimiento */}
            <div className="group bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-green-100">
              <div className="flex items-start space-x-6">
                <div className="bg-gradient-to-r from-success to-green-600 p-4 rounded-2xl">
                  <Wrench size={32} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-montserrat font-bold mb-4 text-success">
                    Mantenimiento Especializado
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    <strong>Encargado de obras y mantenimientos</strong> preventivos y correctivos. 
                    Inspecciones regulares y certificaciones técnicas para garantizar el funcionamiento óptimo.
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Mantenimiento preventivo programado</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Reparaciones de emergencia 24/7</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Certificaciones de funcionamiento</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Actualización de sistemas</span>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg mb-6">
                    <h4 className="font-semibold text-green-800 mb-2">Certificaciones:</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Bosch</span>
                      <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Mircom</span>
                    </div>
                  </div>
                  
                  <Link 
                    href="/servicios/mantenimiento"
                    className="group/link inline-flex items-center text-success font-bold hover:text-green-600 transition-colors"
                  >
                    Ver detalles del servicio
                    <ArrowRight size={16} className="ml-2 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Consultoría */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 text-white p-8 md:p-12 rounded-2xl shadow-2xl">
              <div className="flex flex-col lg:flex-row items-start space-y-6 lg:space-y-0 lg:space-x-8">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl border border-white/30">
                  <AlertTriangle size={48} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-montserrat font-bold mb-4 text-white">
                    Consultoría y Habilitaciones
                  </h3>
                  <p className="text-xl mb-6 text-gray-200 leading-relaxed">
                    Encargada de aprobaciones y habilitaciones de obra. Posgrado en higiene y seguridad. 
                    Asesoramiento integral en normativas de seguridad y evaluación de riesgos.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="flex items-center text-gray-200">
                      <CheckCircle size={16} className="mr-3 text-green-400" />
                      <span>Habilitaciones de obra municipales</span>
                    </div>
                    <div className="flex items-center text-gray-200">
                      <CheckCircle size={16} className="mr-3 text-green-400" />
                      <span>Evaluación de riesgos industriales</span>
                    </div>
                    <div className="flex items-center text-gray-200">
                      <CheckCircle size={16} className="mr-3 text-green-400" />
                      <span>Diseño de sistemas personalizados</span>
                    </div>
                    <div className="flex items-center text-gray-200">
                      <CheckCircle size={16} className="mr-3 text-green-400" />
                      <span>Asesoramiento normativo</span>
                    </div>
                  </div>
                  
                  <Link 
                    href="/servicios/consultoria"
                    className="inline-flex items-center bg-primary hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <AlertTriangle size={20} className="mr-3" />
                    Consultar disponibilidad
                    <ArrowRight size={16} className="ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Por qué elegirnos */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-montserrat font-bold mb-6 text-primary">
              ¿Por qué confiar en IMSSE?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Más de 30 años de experiencia y constante perfeccionamiento nos posicionan como líderes
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center group">
              <div className="bg-gradient-imsse p-6 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Award className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-montserrat font-bold mb-4">Desde 1994</h3>
              <p className="text-gray-600 leading-relaxed">
                Comenzamos realizando instalaciones de sistemas de detección de incendios. 
                30+ años de experiencia comprobada en el mercado.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-fire p-6 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-montserrat font-bold mb-4">Equipo Especializado</h3>
              <p className="text-gray-600 leading-relaxed">
                Ingenieros y técnicos certificados internacionalmente. 
                Comprometidos con el constante perfeccionamiento técnico.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-safety p-6 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Clock className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-montserrat font-bold mb-4">Servicio 24/7</h3>
              <p className="text-gray-600 leading-relaxed">
                Respuesta inmediata ante emergencias. 
                Mantenimiento preventivo y correctivo con disponibilidad total.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-gradient-imsse text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-montserrat font-bold mb-6">
              ¿Listo para proteger su empresa?
            </h2>
            <p className="text-xl mb-8 text-white/90 leading-relaxed">
              Solicite una consulta técnica gratuita. Evaluamos sus necesidades y 
              diseñamos la solución de protección contra incendios ideal para su proyecto.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                href="/contacto" 
                className="inline-flex items-center bg-white text-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
              >
                <Shield size={24} className="mr-3" />
                Consulta Técnica Gratuita
                <ArrowRight size={20} className="ml-3" />
              </Link>
              <a 
                href="tel:+5493516810777" 
                className="inline-flex items-center border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-primary transition-all duration-300"
              >
                <Zap size={24} className="mr-3" />
                Llamar Ahora
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}