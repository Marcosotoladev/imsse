// app/page.js
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shield, Flame, Eye, Zap, Wrench, AlertTriangle, Award, Clock, Users, CheckCircle, Star } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">

{/* Hero Section Épico con Estadísticas */}
<section className="relative text-white py-20 md:py-32 overflow-hidden">
  {/* Fondo con gradiente elegante */}
  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-800 to-slate-800"></div>
  <div 
    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20"
    style={{ 
      backgroundImage: "url('/images/fire-safety-hero.jpg')" 
    }}
  ></div>
  
  {/* Elementos de fondo animados - círculo fijo */}
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute -top-4 -right-4 w-72 h-72 bg-white opacity-5 rounded-full"></div>
    <div className="absolute top-1/2 -left-8 w-48 h-48 bg-secondary opacity-10 rounded-full animate-bounce-safety"></div>
    <div className="absolute bottom-10 right-1/4 w-32 h-32 bg-warning opacity-15 rounded-full animate-pulse-fire"></div>
  </div>
  
  {/* Contenido principal */}
  <div className="container mx-auto px-4 relative z-20 pt-16">
    <div className="max-w-5xl mx-auto text-center">
      {/* Badge de experiencia */}
      <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-8 border border-white/30">
        <Award className="text-yellow-300 mr-2" size={20} />
        <span className="font-semibold">30+ Años de Experiencia • Desde 1994</span>
      </div>
      
      {/* Logo y nombre principal */}
      <div className="flex items-center justify-center mb-6">
        <div className="mr-6">
          <Image 
            src="/logo/imsse-logo.png" 
            alt="IMSSE Logo" 
            width={80} 
            height={80}
            className="mx-auto"
          />
        </div>
        <div className="text-left">
          <h1 className="text-5xl md:text-7xl font-montserrat font-bold leading-tight">
            <span className="block text-white">IMSSE</span>
            <span className="block text-2xl md:text-3xl text-secondary font-medium">INGENIERÍA SAS</span>
          </h1>
        </div>
      </div>
      
      {/* Descripción oficial */}
      <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-white leading-relaxed">
        Instalación y Mantenimiento de Sistemas de Seguridad Electrónicos
      </h2>
      
      {/* Subtitle */}
      <h3 className="text-xl md:text-2xl mb-8 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent font-bold">
        Líderes en Protección Contra Incendios
      </h3>
      
      <p className="text-lg md:text-xl mb-10 text-white/90 leading-relaxed max-w-4xl mx-auto">
        Somos un equipo conformado por <strong>ingenieros y técnicos</strong> con gran experiencia en la ejecución de obras, 
        comprometidos con el constante perfeccionamiento. <strong>Empresa líder</strong> en sistemas de protección contra incendios 
        para industrias, comercios y gobierno.
      </p>
      
      {/* Botones de acción mejorados */}
      <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
        <Link 
          href="/contacto" 
          className="group inline-flex items-center bg-white text-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-white/20"
        >
          <Shield size={24} className="mr-3 group-hover:animate-pulse" />
          Evaluación Gratuita
          <ArrowRight size={20} className="ml-3 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link 
          href="/servicios" 
          className="group inline-flex items-center border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-primary transition-all duration-300 transform hover:scale-105"
        >
          <Eye size={24} className="mr-3" />
          Ver Servicios
          <ArrowRight size={20} className="ml-3 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      
      {/* Estadísticas impactantes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">30+</div>
          <div className="text-sm text-white/80">Años de experiencia</div>
        </div>
        <div className="text-center">
          <div className="text-3xl md:text-4xl font-bold text-orange-300 mb-2">500+</div>
          <div className="text-sm text-white/80">Proyectos completados</div>
        </div>
        <div className="text-center">
          <div className="text-3xl md:text-4xl font-bold text-blue-300 mb-2">24/7</div>
          <div className="text-sm text-white/80">Servicio de emergencia</div>
        </div>
        <div className="text-center">
          <div className="text-3xl md:text-4xl font-bold text-green-300 mb-2">100%</div>
          <div className="text-sm text-white/80">Satisfacción garantizada</div>
        </div>
      </div>
    </div>
  </div>
</section>

{/* Sectores que Atendemos - Sección nueva */}
<section className="py-16 md:py-20 bg-gray-50 relative overflow-hidden">
  <div className="container mx-auto px-4">
    <div className="text-center mb-16">
      <h2 className="text-4xl md:text-5xl font-montserrat font-bold mb-6 text-primary">
        Sectores que Protegemos
      </h2>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto">
        Desarrollamos proyectos especializados para cada sector con soluciones confiables y duraderas
      </p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {/* Industria */}
      <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-l-4 border-primary">
        <div className="bg-gradient-fire p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
          <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 8.172V5L8 4z" />
          </svg>
        </div>
        <h3 className="text-2xl font-montserrat font-bold mb-4">INDUSTRIA</h3>
        <p className="text-gray-600 mb-4 leading-relaxed">
          Desarrollamos proyectos para toda clase de superficies industriales. 
          Protección especializada para procesos críticos y maquinaria de alto valor.
        </p>
        <div className="flex items-center text-primary font-medium group-hover:text-secondary transition-colors">
          <CheckCircle size={16} className="mr-2" />
          <span>Soluciones personalizadas</span>
        </div>
      </div>
      
      {/* Comercio */}
      <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-l-4 border-secondary">
        <div className="bg-gradient-safety p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
          <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l4-2 4 2 4-2z" />
          </svg>
        </div>
        <h3 className="text-2xl font-montserrat font-bold mb-4">COMERCIO</h3>
        <p className="text-gray-600 mb-4 leading-relaxed">
          Asesoramos y desarrollamos proyectos para espacios y centros comerciales. 
          Protección integral para locales, oficinas y centros de alta concurrencia.
        </p>
        <div className="flex items-center text-secondary font-medium group-hover:text-primary transition-colors">
          <CheckCircle size={16} className="mr-2" />
          <span>Normativas actualizadas</span>
        </div>
      </div>
      
      {/* Gobierno */}
      <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-l-4 border-warning">
        <div className="bg-gradient-to-r from-warning to-orange-500 p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
          <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 className="text-2xl font-montserrat font-bold mb-4">GOBIERNO</h3>
        <p className="text-gray-600 mb-4 leading-relaxed">
          Asesoramos y desarrollamos proyectos para proteger los valores del gobierno. 
          Sistemas de alta seguridad para edificios públicos e instituciones.
        </p>
        <div className="flex items-center text-warning font-medium group-hover:text-primary transition-colors">
          <CheckCircle size={16} className="mr-2" />
          <span>Máxima seguridad</span>
        </div>
      </div>
    </div>
  </div>
</section>

{/* Servicios Especializados - Mejorado */}
<section className="py-16 md:py-20 bg-white">
  <div className="container mx-auto px-4">
    <div className="text-center mb-16">
      <h2 className="text-4xl md:text-5xl font-montserrat font-bold mb-6 text-primary">
        Servicios Especializados
      </h2>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto">
        Soluciones completas certificadas por las marcas líderes internacionales
      </p>
      
      {/* Badges de certificaciones */}
      <div className="flex flex-wrap justify-center gap-4 mt-8">
        <span className="bg-primary/10 text-primary px-4 py-2 rounded-full font-medium">Notifier</span>
        <span className="bg-secondary/10 text-secondary px-4 py-2 rounded-full font-medium">Mircom</span>
        <span className="bg-warning/10 text-warning px-4 py-2 rounded-full font-medium">Inim</span>
        <span className="bg-success/10 text-success px-4 py-2 rounded-full font-medium">Secutron</span>
        <span className="bg-info/10 text-info px-4 py-2 rounded-full font-medium">Bosch</span>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {/* Detección de Incendios */}
      <div className="group bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 hover:border-primary/30">
        <div className="bg-gradient-to-r from-primary to-red-600 p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
          <Eye size={32} className="text-white" />
        </div>
        <h3 className="text-2xl font-montserrat font-bold mb-4 group-hover:text-primary transition-colors">
          Detección de Incendios
        </h3>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Especialistas en proyectos, instalación y programación de sistemas de detección. 
          Tecnología avanzada para identificar incendios en etapas iniciales.
        </p>
        <div className="space-y-2 mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircle size={16} className="mr-2 text-green-500" />
            <span>Sensores de humo, calor y llama</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircle size={16} className="mr-2 text-green-500" />
            <span>Programación especializada</span>
          </div>
        </div>
        <Link 
          href="/servicios/deteccion-incendios" 
          className="group/link inline-flex items-center text-primary font-bold hover:text-red-600 transition-colors"
        >
          Ver más 
          <ArrowRight size={16} className="ml-2 group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
      
      {/* Extinción de Incendios */}
      <div className="group bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 hover:border-secondary/30">
        <div className="bg-gradient-to-r from-secondary to-blue-600 p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
          <Flame size={32} className="text-white" />
        </div>
        <h3 className="text-2xl font-montserrat font-bold mb-4 group-hover:text-secondary transition-colors">
          Extinción de Incendios
        </h3>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Sistemas de extinción por gas, agua nebulizada y espuma. 
          Cálculo y diseño de sistemas según normativas internacionales.
        </p>
        <div className="space-y-2 mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircle size={16} className="mr-2 text-green-500" />
            <span>Sistemas por gas y espuma</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircle size={16} className="mr-2 text-green-500" />
            <span>Cálculo hidráulico</span>
          </div>
        </div>
        <Link 
          href="/servicios/extincion-incendios" 
          className="group/link inline-flex items-center text-secondary font-bold hover:text-blue-600 transition-colors"
        >
          Ver más 
          <ArrowRight size={16} className="ml-2 group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
      
      {/* Sistemas de Alarma */}
      <div className="group bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 hover:border-warning/30">
        <div className="bg-gradient-to-r from-warning to-orange-600 p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
          <Zap size={32} className="text-white" />
        </div>
        <h3 className="text-2xl font-montserrat font-bold mb-4 group-hover:text-warning transition-colors">
          Sistemas de Alarma
        </h3>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Centrales de alarma contra incendios, notificación masiva y 
          evacuación con sistemas de audio y señalización visual.
        </p>
        <div className="space-y-2 mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircle size={16} className="mr-2 text-green-500" />
            <span>Centrales inteligentes</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircle size={16} className="mr-2 text-green-500" />
            <span>Señalización luminosa</span>
          </div>
        </div>
        <Link 
          href="/servicios/sistemas-alarma" 
          className="group/link inline-flex items-center text-warning font-bold hover:text-orange-600 transition-colors"
        >
          Ver más 
          <ArrowRight size={16} className="ml-2 group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
      
      {/* Mantenimiento */}
      <div className="group bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 hover:border-success/30 md:col-span-2 lg:col-span-1">
        <div className="bg-gradient-to-r from-success to-green-600 p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
          <Wrench size={32} className="text-white" />
        </div>
        <h3 className="text-2xl font-montserrat font-bold mb-4 group-hover:text-success transition-colors">
          Mantenimiento
        </h3>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Encargados de obras y mantenimientos preventivos y correctivos. 
          Inspecciones regulares y certificaciones técnicas.
        </p>
        <div className="space-y-2 mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircle size={16} className="mr-2 text-green-500" />
            <span>Mantenimiento preventivo</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircle size={16} className="mr-2 text-green-500" />
            <span>Certificaciones técnicas</span>
          </div>
        </div>
        <Link 
          href="/servicios/mantenimiento" 
          className="group/link inline-flex items-center text-success font-bold hover:text-green-600 transition-colors"
        >
          Ver más 
          <ArrowRight size={16} className="ml-2 group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
      
      {/* Consultoría */}
      <div className="group bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 hover:border-info/30 md:col-span-2">
        <div className="bg-gradient-to-r from-info to-cyan-600 p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
          <AlertTriangle size={32} className="text-white" />
        </div>
        <h3 className="text-2xl font-montserrat font-bold mb-4 group-hover:text-info transition-colors">
          Consultoría y Habilitaciones
        </h3>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Encargada de aprobaciones y habilitaciones de obra. Posgrado en higiene y seguridad. 
          Asesoramiento integral en normativas y evaluación de riesgos.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircle size={16} className="mr-2 text-green-500" />
            <span>Habilitaciones de obra</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircle size={16} className="mr-2 text-green-500" />
            <span>Higiene y seguridad</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircle size={16} className="mr-2 text-green-500" />
            <span>Evaluación de riesgos</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircle size={16} className="mr-2 text-green-500" />
            <span>Diseño de sistemas</span>
          </div>
        </div>
        <Link 
          href="/servicios/consultoria" 
          className="group/link inline-flex items-center text-info font-bold hover:text-cyan-600 transition-colors"
        >
          Ver más 
          <ArrowRight size={16} className="ml-2 group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  </div>
</section>

{/* Por qué IMSSE - Con testimonios */}
<section className="py-16 md:py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden">
  {/* Elementos decorativos */}
  <div className="absolute inset-0 opacity-10">
    <div className="absolute top-20 left-10 w-32 h-32 bg-primary rounded-full blur-xl"></div>
    <div className="absolute bottom-20 right-10 w-48 h-48 bg-secondary rounded-full blur-xl"></div>
  </div>
  
  <div className="container mx-auto px-4 relative z-10">
    <div className="text-center mb-16">
      <h2 className="text-4xl md:text-5xl font-montserrat font-bold mb-6">
        ¿Por qué confiar en IMSSE?
      </h2>
      <p className="text-xl text-gray-300 max-w-3xl mx-auto">
        Más de 30 años comprometidos con el constante perfeccionamiento y la excelencia técnica
      </p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
      <div className="text-center group">
        <div className="bg-gradient-imsse p-6 rounded-2xl w-24 h-24 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
          <Award className="h-12 w-12 text-white" />
        </div>
        <h3 className="text-2xl font-montserrat font-bold mb-4">Experiencia Comprobada</h3>
        <p className="text-gray-300 leading-relaxed">
          Desde 1994 realizando instalaciones de sistemas de detección de incendios. 
          Técnicos certificados en marcas internacionales líderes.
        </p>
      </div>
      
      <div className="text-center group">
        <div className="bg-gradient-fire p-6 rounded-2xl w-24 h-24 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
          <Clock className="h-12 w-12 text-white" />
        </div>
        <h3 className="text-2xl font-montserrat font-bold mb-4">Respuesta 24/7</h3>
        <p className="text-gray-300 leading-relaxed">
          Servicio de emergencia las 24 horas. Respuesta inmediata ante 
          fallas críticas en sistemas de protección contra incendios.
        </p>
      </div>
      
      <div className="text-center group">
        <div className="bg-gradient-safety p-6 rounded-2xl w-24 h-24 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
          <Users className="h-12 w-12 text-white" />
        </div>
        <h3 className="text-2xl font-montserrat font-bold mb-4">Equipo Especializado</h3>
        <p className="text-gray-300 leading-relaxed">
          Ingenieros y técnicos con posgrados en higiene y seguridad. 
          Equipo comprometido con el constante perfeccionamiento técnico.
        </p>
      </div>
    </div>
    
    {/* Testimonial destacado */}
    <div className="bg-white/10 backdrop-blur-sm p-8 md:p-12 rounded-2xl border border-white/20 max-w-4xl mx-auto">
      <div className="flex items-center justify-center mb-6">
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
          ))}
        </div>
      </div>
      <blockquote className="text-xl md:text-2xl text-center mb-6 italic leading-relaxed">
        "Gracias a la confianza de nuestros clientes y al crecimiento en el desarrollo y puesta en marcha 
        de nuevos proyectos, nos hemos posicionado como una de las empresas líderes en sistemas de 
        protección contra incendios."
      </blockquote>
      <div className="text-center">
        <div className="font-bold text-lg">IMSSE Ingeniería SAS</div>
        <div className="text-gray-300">Líderes en Protección Contra Incendios</div>
      </div>
    </div>
  </div>
</section>

{/* CTA Final Épico */}
<section className="py-16 md:py-20 bg-gradient-imsse text-white relative overflow-hidden">
  {/* Efectos de fondo animados */}
  <div className="absolute inset-0">
    <div className="absolute inset-0 bg-black/20"></div>
    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 animate-pulse"></div>
  </div>
  
  <div className="container mx-auto px-4 text-center relative z-10">
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-center mb-8">
        <div className="bg-white/20 p-4 rounded-full mr-4">
          <Shield className="text-white" size={48} />
        </div>
        <h2 className="text-4xl md:text-6xl font-montserrat font-bold">
          Su Seguridad es Nuestra Misión
        </h2>
      </div>
      
      <p className="text-xl md:text-2xl mb-12 leading-relaxed">
        No comprometa la seguridad de su empresa. Confíe en los líderes con más de 30 años 
        protegiendo industrias, comercios y gobierno con <strong>soluciones confiables y duraderas</strong>.
      </p>
      
      <div className="flex flex-col sm:flex-row justify-center gap-6">
        <Link 
          href="/contacto" 
          className="group inline-flex items-center bg-white text-primary px-10 py-5 rounded-xl font-bold text-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-white/20"
        >
          <Eye size={28} className="mr-3 group-hover:animate-pulse" />
          Evaluación Gratuita
          <ArrowRight size={24} className="ml-3 group-hover:translate-x-2 transition-transform" />
        </Link>
        <a 
          href="tel:+5493516810777" 
          className="group inline-flex items-center border-3 border-white text-white px-10 py-5 rounded-xl font-bold text-xl hover:bg-white hover:text-primary transition-all duration-300 transform hover:scale-105"
        >
          <Zap size={28} className="mr-3" />
          Emergencias 24/7
          <ArrowRight size={24} className="ml-3 group-hover:translate-x-2 transition-transform" />
        </a>
      </div>
      
      {/* Datos de contacto rápido */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-center bg-white/10 backdrop-blur-sm p-4 rounded-xl">
          <Clock className="mr-3" size={20} />
          <span className="font-medium">Respuesta en 24hs</span>
        </div>
        <div className="flex items-center justify-center bg-white/10 backdrop-blur-sm p-4 rounded-xl">
          <Shield className="mr-3" size={20} />
          <span className="font-medium">30+ Años de experiencia</span>
        </div>
        <div className="flex items-center justify-center bg-white/10 backdrop-blur-sm p-4 rounded-xl">
          <Award className="mr-3" size={20} />
          <span className="font-medium">Certificaciones internacionales</span>
        </div>
      </div>
    </div>
  </div>
</section>

{/* Sección de Marcas Certificadas */}
<section className="py-12 bg-white border-t border-gray-100">
  <div className="container mx-auto px-4">
    <div className="text-center mb-8">
      <h3 className="text-2xl font-montserrat font-bold text-gray-800 mb-4">
        Certificados en Marcas Líderes Internacionales
      </h3>
      <p className="text-gray-600">
        Nuestro equipo técnico está certificado en las principales marcas del mercado
      </p>
    </div>
    
    {/* Logos de marcas con animación */}
    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-70 hover:opacity-100 transition-opacity">
      <div className="bg-gradient-to-r from-primary to-red-600 text-white px-6 py-3 rounded-lg font-bold text-lg transform hover:scale-105 transition-transform">
        NOTIFIER
      </div>
      <div className="bg-gradient-to-r from-secondary to-blue-600 text-white px-6 py-3 rounded-lg font-bold text-lg transform hover:scale-105 transition-transform">
        MIRCOM
      </div>
      <div className="bg-gradient-to-r from-warning to-orange-600 text-white px-6 py-3 rounded-lg font-bold text-lg transform hover:scale-105 transition-transform">
        INIM
      </div>
      <div className="bg-gradient-to-r from-success to-green-600 text-white px-6 py-3 rounded-lg font-bold text-lg transform hover:scale-105 transition-transform">
        SECUTRON
      </div>
      <div className="bg-gradient-to-r from-info to-cyan-600 text-white px-6 py-3 rounded-lg font-bold text-lg transform hover:scale-105 transition-transform">
        BOSCH
      </div>
    </div>
  </div>
</section>
    </div>
  );
}
