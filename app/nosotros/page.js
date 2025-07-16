// app/nosotros/page.js
import Link from 'next/link';
import { Shield, Users, Award, Clock, Target, Zap, CheckCircle, Star, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Nosotros - IMSSE Ingeniería SAS | 30 Años Protegiendo Vidas y Patrimonio',
  description: 'Conoce la historia de IMSSE desde 1994. Equipo de ingenieros y técnicos certificados en sistemas de protección contra incendios. Líderes en Argentina.',
  keywords: 'historia IMSSE, empresa protección incendios, equipo técnico certificado, experiencia Argentina, líderes seguridad',
};

export default function NosotrosPage() {
  return (
    <div className="flex flex-col min-h-screen pt-20">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-primary text-white py-20 md:py-24 overflow-hidden">
        {/* Efectos de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-secondary rounded-full blur-2xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-8 border border-white/30">
              <Award className="text-yellow-300 mr-2" size={20} />
              <span className="font-semibold">Desde 1994 • 30+ Años de Experiencia</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-montserrat font-bold mb-8 leading-tight">
              <span className="block">Somos</span>
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                IMSSE Ingeniería
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed max-w-4xl mx-auto">
              Un equipo conformado por <strong>ingenieros y técnicos</strong> con gran experiencia en la ejecución de obras, 
              comprometidos con el constante perfeccionamiento y la protección de vidas y patrimonio.
            </p>
            
            {/* Estadísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">1994</div>
                <div className="text-sm text-white/80">Año de fundación</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-300 mb-2">500+</div>
                <div className="text-sm text-white/80">Proyectos realizados</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-300 mb-2">3</div>
                <div className="text-sm text-white/80">Sectores principales</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-green-300 mb-2">5</div>
                <div className="text-sm text-white/80">Marcas certificadas</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Historia */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-montserrat font-bold mb-6 text-primary">
                Nuestra Historia
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Más de 30 años de evolución constante en el campo de la protección contra incendios
              </p>
            </div>

            <div className="space-y-12">
              {/* Origen - 1994 */}
              <div className="flex flex-col lg:flex-row items-start space-y-6 lg:space-y-0 lg:space-x-8">
                <div className="lg:w-1/3">
                  <div className="bg-gradient-imsse text-white p-6 rounded-2xl text-center">
                    <div className="text-3xl font-bold mb-2">1994</div>
                    <div className="text-lg">Nuestros Inicios</div>
                  </div>
                </div>
                <div className="lg:w-2/3">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    Los Primeros Pasos en Protección Contra Incendios
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    <strong>Desde finales del año 1994 comenzamos a realizar instalaciones de sistemas de detección de incendios</strong> 
                    para distintas empresas del sector. En los comienzos, el principal rubro al que nos dedicábamos era electricidad, 
                    por lo que tuvimos que comenzar a capacitarnos en los distintos sistemas y marcas.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Para ese entonces, la única manera era a través de la lectura de los manuales de instalación del fabricante 
                    (muchas veces en el idioma extranjero) y realizando prácticas y testeos en los momentos previos a la instalación.
                  </p>
                </div>
              </div>

              {/* Evolución Tecnológica */}
              <div className="flex flex-col lg:flex-row-reverse items-start space-y-6 lg:space-y-0 lg:space-x-reverse lg:space-x-8">
                <div className="lg:w-1/3">
                  <div className="bg-gradient-to-r from-secondary to-blue-600 text-white p-6 rounded-2xl text-center">
                    <div className="text-3xl font-bold mb-2">2000s</div>
                    <div className="text-lg">Era Digital</div>
                  </div>
                </div>
                <div className="lg:w-2/3">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    La Revolución del Internet y las Certificaciones
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    <strong>Ya con la aparición de Internet se abrió un gran abanico de posibilidades</strong> en cuanto a capacitaciones 
                    y certificaciones. Así IMSSE ingeniería pudo obtener el perfeccionamiento de sus técnicos recién incorporados, 
                    aportando con nuestra experiencia, una mejor especialización.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-2 text-green-500" />
                      <span>Certificaciones internacionales</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-2 text-green-500" />
                      <span>Capacitación continua</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-2 text-green-500" />
                      <span>Webinars especializados</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-2 text-green-500" />
                      <span>Actualización tecnológica</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Presente y Futuro */}
              <div className="flex flex-col lg:flex-row items-start space-y-6 lg:space-y-0 lg:space-x-8">
                <div className="lg:w-1/3">
                  <div className="bg-gradient-to-r from-warning to-orange-600 text-white p-6 rounded-2xl text-center">
                    <div className="text-3xl font-bold mb-2">HOY</div>
                    <div className="text-lg">Líderes del Sector</div>
                  </div>
                </div>
                <div className="lg:w-2/3">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    Visión de Futuro y Liderazgo
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    <strong>Hoy, tenemos la visión de, además de crecer en nuestros servicios, poder colaborar</strong> 
                    con las autoridades municipales y provinciales creando un sistema de registro de empresas instaladoras, 
                    para así poder regular, y de esta manera mejorar el rubro de la seguridad contra incendios.
                  </p>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    <strong>Gracias a la confianza de nuestros clientes y al crecimiento en el desarrollo y puesta en marcha 
                    de nuevos proyectos, nos hemos posicionado como una de las empresas líderes</strong> en sistemas de 
                    protección contra incendios, atendiendo a industrias y comercios.
                  </p>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-2">Nuestro Compromiso:</h4>
                    <p className="text-orange-700 text-sm">
                      Proveer soluciones confiables y duraderas que protejan vidas y patrimonio en todo el país.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Equipo y Certificaciones */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-montserrat font-bold mb-6 text-primary">
                Nuestro Equipo Especializado
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Profesionales certificados internacionalmente comprometidos con el constante perfeccionamiento
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Especialista en Detección */}
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-primary to-red-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <Shield size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-center mb-4 text-gray-800">
                  Especialista en Proyectos
                </h3>
                <p className="text-center text-gray-600 mb-6">
                  Especialista en proyectos, instalación y programación de sistemas de detección de Incendios.
                </p>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-800 text-sm">Certificado en:</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">Notifier</span>
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">Mircom</span>
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">Inim</span>
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">Secutron</span>
                  </div>
                </div>
              </div>

              {/* Ingeniera en Habilitaciones */}
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-secondary to-blue-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <Users size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-center mb-4 text-gray-800">
                  Ingeniera en Habilitaciones
                </h3>
                <p className="text-center text-gray-600 mb-6">
                  Encargada de aprobaciones y habilitaciones de obra, cálculo y diseño de sistemas de extinción de incendios.
                </p>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-800 text-sm">Especialización:</h4>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-blue-800 text-sm font-medium">Posgrado en higiene y seguridad</p>
                  </div>
                </div>
              </div>

              {/* Técnicos Especializados */}
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-success to-green-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <Award size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-center mb-4 text-gray-800">
                  Técnicos Certificados
                </h3>
                <p className="text-center text-gray-600 mb-6">
                  Encargado de obras y mantenimientos. Instaladores especializados de sistemas de detección de incendios.
                </p>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-800 text-sm">Certificaciones:</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">Bosch</span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">Mircom</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Administración */}
            <div className="mt-12 max-w-2xl mx-auto">
              <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                <div className="bg-gradient-to-r from-warning to-orange-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <Target size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">
                  Administración y Gestión
                </h3>
                <p className="text-gray-600">
                  Encargada de Administración. Gestión integral de proyectos, 
                  coordinación de equipos y seguimiento de clientes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sectores que Atendemos */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-montserrat font-bold mb-6 text-primary">
                Sectores que Protegemos
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Desarrollamos proyectos especializados para cada sector con soluciones confiables y duraderas
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Industria */}
              <div className="group text-center">
                <div className="bg-gradient-to-br from-red-500 to-orange-600 p-8 rounded-2xl text-white mb-6 group-hover:scale-105 transition-transform">
                  <svg className="h-16 w-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 8.172V5L8 4z" />
                  </svg>
                  <h3 className="text-2xl font-bold mb-2">INDUSTRIA</h3>
                  <p className="text-white/90">Protección especializada para procesos críticos</p>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Desarrollamos proyectos para toda clase de superficies industriales. 
                  Sistemas diseñados específicamente para proteger procesos de alto valor y maquinaria crítica.
                </p>
              </div>

              {/* Comercio */}
              <div className="group text-center">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-8 rounded-2xl text-white mb-6 group-hover:scale-105 transition-transform">
                  <svg className="h-16 w-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l4-2 4 2 4-2z" />
                  </svg>
                  <h3 className="text-2xl font-bold mb-2">COMERCIO</h3>
                  <p className="text-white/90">Soluciones para espacios comerciales</p>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Asesoramos y desarrollamos proyectos para espacios y centros comerciales. 
                  Protección integral considerando alta concurrencia de personas y diversidad de riesgos.
                </p>
              </div>

              {/* Gobierno */}
              <div className="group text-center">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 rounded-2xl text-white mb-6 group-hover:scale-105 transition-transform">
                  <svg className="h-16 w-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 className="text-2xl font-bold mb-2">GOBIERNO</h3>
                  <p className="text-white/90">Máxima seguridad institucional</p>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Asesoramos y desarrollamos proyectos para proteger los valores del gobierno. 
                  Sistemas de alta seguridad que cumplen con normativas especiales del sector público.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Valores y Compromiso */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-montserrat font-bold mb-6">
                Nuestros Valores
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Los principios que guían nuestro trabajo día a día
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-gradient-imsse p-4 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <Shield size={32} className="text-white" />
                </div>
                <h3 className="text-lg font-bold mb-3">Seguridad</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  La protección de vidas y patrimonio es nuestra máxima prioridad en cada proyecto.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-gradient-fire p-4 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <Award size={32} className="text-white" />
                </div>
                <h3 className="text-lg font-bold mb-3">Excelencia</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Comprometidos con el constante perfeccionamiento y la calidad superior.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-gradient-safety p-4 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <Users size={32} className="text-white" />
                </div>
                <h3 className="text-lg font-bold mb-3">Confianza</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  30+ años construyendo relaciones duraderas basadas en la confianza mutua.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-gradient-to-r from-warning to-orange-600 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <Zap size={32} className="text-white" />
                </div>
                <h3 className="text-lg font-bold mb-3">Innovación</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Adoptamos las últimas tecnologías para ofrecer soluciones de vanguardia.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial de la empresa */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 text-white p-8 md:p-12 rounded-2xl shadow-2xl border border-gray-600">
              <div className="flex items-center justify-center mb-6">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-8 w-8 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              <blockquote className="text-2xl md:text-3xl mb-8 italic leading-relaxed text-white font-medium">
                "Gracias a la confianza de nuestros clientes y al crecimiento en el desarrollo y puesta en marcha 
                de nuevos proyectos, nos hemos posicionado como una de las empresas líderes en sistemas de 
                protección contra incendios."
              </blockquote>
              <div className="text-xl font-bold text-white mb-2">IMSSE Ingeniería SAS</div>
              <div className="text-gray-300 font-medium">Protegiendo vidas y patrimonio desde 1994</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-gradient-imsse text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-montserrat font-bold mb-6">
              ¿Quiere formar parte de nuestra historia?
            </h2>
            <p className="text-xl mb-8 text-white/90 leading-relaxed">
              Únase a los cientos de clientes que han confiado en IMSSE para proteger 
              lo que más les importa. Su seguridad, nuestra experiencia.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                href="/contacto" 
                className="inline-flex items-center bg-white text-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
              >
                <Shield size={24} className="mr-3" />
                Solicitar Consulta
                <ArrowRight size={20} className="ml-3" />
              </Link>
              <Link 
                href="/servicios" 
                className="inline-flex items-center border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-primary transition-all duration-300"
              >
                <Users size={24} className="mr-3" />
                Ver Servicios
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}