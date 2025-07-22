// app/page.js
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shield, Flame, Eye, Zap, Wrench, AlertTriangle, Award, Clock, Users, CheckCircle, Star } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">

{/* Hero Section Épico con Estadísticas */}
<section className="relative py-20 overflow-hidden text-white md:py-32">
  {/* Fondo con gradiente elegante */}
  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-800 to-slate-800"></div>
  <div 
    className="absolute inset-0 z-0 bg-center bg-no-repeat bg-cover opacity-20"
    style={{ 
      backgroundImage: "url('/images/fire-safety-hero.png')" 
    }}
  ></div>
  
  {/* Elementos de fondo animados - círculo fijo */}
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute bg-white rounded-full -top-4 -right-4 w-72 h-72 opacity-5"></div>
    <div className="absolute w-48 h-48 rounded-full top-1/2 -left-8 bg-secondary opacity-10 animate-bounce-safety"></div>
    <div className="absolute w-32 h-32 rounded-full bottom-10 right-1/4 bg-warning opacity-15 animate-pulse-fire"></div>
  </div>
  
  {/* Contenido principal */}
  <div className="container relative z-20 px-4 pt-16 mx-auto">
    <div className="max-w-5xl mx-auto text-center">
      {/* Badge de experiencia */}
      <div className="inline-flex items-center px-6 py-3 mb-8 border rounded-full bg-white/20 backdrop-blur-sm border-white/30">
        <Award className="mr-2 text-yellow-300" size={20} />
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
          <h1 className="text-5xl font-bold leading-tight md:text-7xl font-montserrat">
            <span className="block text-white">IMSSE</span>
            <span className="block text-2xl font-medium md:text-3xl text-secondary">INGENIERÍA SAS</span>
          </h1>
        </div>
      </div>
      
      {/* Descripción oficial */}
      <h2 className="mb-8 text-2xl font-semibold leading-relaxed text-white md:text-3xl">
        Instalación y Mantenimiento de Sistemas de Seguridad Electrónicos
      </h2>
      
      {/* Subtitle */}
      <h3 className="mb-8 text-xl font-bold text-transparent md:text-2xl bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text">
        Líderes en Protección Contra Incendios
      </h3>
      
      <p className="max-w-4xl mx-auto mb-10 text-lg leading-relaxed md:text-xl text-white/90">
        Somos un equipo conformado por <strong>ingenieros y técnicos</strong> con gran experiencia en la ejecución de obras, 
        comprometidos con el constante perfeccionamiento. <strong>Empresa líder</strong> en sistemas de protección contra incendios 
        para industrias, comercios y gobierno.
      </p>
      
      {/* Botones de acción mejorados */}
      <div className="flex flex-col justify-center gap-6 mb-16 sm:flex-row">
        <Link 
          href="/contacto" 
          className="inline-flex items-center px-8 py-4 text-lg font-bold transition-all duration-300 transform bg-white shadow-2xl group text-primary rounded-xl hover:bg-gray-100 hover:scale-105 hover:shadow-white/20"
        >
          <Shield size={24} className="mr-3 group-hover:animate-pulse" />
          Evaluación Gratuita
          <ArrowRight size={20} className="ml-3 transition-transform group-hover:translate-x-1" />
        </Link>
        <Link 
          href="/servicios" 
          className="inline-flex items-center px-8 py-4 text-lg font-bold text-white transition-all duration-300 transform border-2 border-white group rounded-xl hover:bg-white hover:text-primary hover:scale-105"
        >
          <Eye size={24} className="mr-3" />
          Ver Servicios
          <ArrowRight size={20} className="ml-3 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
      
      {/* Estadísticas impactantes */}
      <div className="grid max-w-4xl grid-cols-2 gap-8 mx-auto md:grid-cols-4">
        <div className="text-center">
          <div className="mb-2 text-3xl font-bold text-yellow-300 md:text-4xl">30+</div>
          <div className="text-sm text-white/80">Años de experiencia</div>
        </div>
        <div className="text-center">
          <div className="mb-2 text-3xl font-bold text-orange-300 md:text-4xl">500+</div>
          <div className="text-sm text-white/80">Proyectos completados</div>
        </div>
        <div className="text-center">
          <div className="mb-2 text-3xl font-bold text-blue-300 md:text-4xl">24/7</div>
          <div className="text-sm text-white/80">Servicio de emergencia</div>
        </div>
        <div className="text-center">
          <div className="mb-2 text-3xl font-bold text-green-300 md:text-4xl">100%</div>
          <div className="text-sm text-white/80">Satisfacción garantizada</div>
        </div>
      </div>
    </div>
  </div>
</section>

{/* Sectores que Atendemos - Sección nueva */}
<section className="relative py-16 overflow-hidden md:py-20 bg-gray-50">
  <div className="container px-4 mx-auto">
    <div className="mb-16 text-center">
      <h2 className="mb-6 text-4xl font-bold md:text-5xl font-montserrat text-primary">
        Sectores que Protegemos
      </h2>
      <p className="max-w-3xl mx-auto text-xl text-gray-600">
        Desarrollamos proyectos especializados para cada sector con soluciones confiables y duraderas
      </p>
    </div>
    
    <div className="grid max-w-6xl grid-cols-1 gap-8 mx-auto md:grid-cols-3">
      {/* Industria */}
      <div className="p-8 transition-all duration-300 transform bg-white border-l-4 shadow-lg group rounded-2xl hover:shadow-2xl hover:-translate-y-2 border-primary">
        <div className="p-4 mb-6 transition-transform bg-gradient-fire rounded-2xl w-fit group-hover:scale-110">
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 8.172V5L8 4z" />
          </svg>
        </div>
        <h3 className="mb-4 text-2xl font-bold font-montserrat">INDUSTRIA</h3>
        <p className="mb-4 leading-relaxed text-gray-600">
          Desarrollamos proyectos para toda clase de superficies industriales. 
          Protección especializada para procesos críticos y maquinaria de alto valor.
        </p>
        <div className="flex items-center font-medium transition-colors text-primary group-hover:text-secondary">
          <CheckCircle size={16} className="mr-2" />
          <span>Soluciones personalizadas</span>
        </div>
      </div>
      
      {/* Comercio */}
      <div className="p-8 transition-all duration-300 transform bg-white border-l-4 shadow-lg group rounded-2xl hover:shadow-2xl hover:-translate-y-2 border-secondary">
        <div className="p-4 mb-6 transition-transform bg-gradient-safety rounded-2xl w-fit group-hover:scale-110">
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l4-2 4 2 4-2z" />
          </svg>
        </div>
        <h3 className="mb-4 text-2xl font-bold font-montserrat">COMERCIO</h3>
        <p className="mb-4 leading-relaxed text-gray-600">
          Asesoramos y desarrollamos proyectos para espacios y centros comerciales. 
          Protección integral para locales, oficinas y centros de alta concurrencia.
        </p>
        <div className="flex items-center font-medium transition-colors text-secondary group-hover:text-primary">
          <CheckCircle size={16} className="mr-2" />
          <span>Normativas actualizadas</span>
        </div>
      </div>
      
      {/* Gobierno */}
      <div className="p-8 transition-all duration-300 transform bg-white border-l-4 shadow-lg group rounded-2xl hover:shadow-2xl hover:-translate-y-2 border-warning">
        <div className="p-4 mb-6 transition-transform bg-gradient-to-r from-warning to-orange-500 rounded-2xl w-fit group-hover:scale-110">
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 className="mb-4 text-2xl font-bold font-montserrat">GOBIERNO</h3>
        <p className="mb-4 leading-relaxed text-gray-600">
          Asesoramos y desarrollamos proyectos para proteger los valores del gobierno. 
          Sistemas de alta seguridad para edificios públicos e instituciones.
        </p>
        <div className="flex items-center font-medium transition-colors text-warning group-hover:text-primary">
          <CheckCircle size={16} className="mr-2" />
          <span>Máxima seguridad</span>
        </div>
      </div>
    </div>
  </div>
</section>

{/* Servicios Especializados - Mejorado */}
<section className="py-16 bg-white md:py-20">
  <div className="container px-4 mx-auto">
    <div className="mb-16 text-center">
      <h2 className="mb-6 text-4xl font-bold md:text-5xl font-montserrat text-primary">
        Servicios Especializados
      </h2>
      <p className="max-w-3xl mx-auto text-xl text-gray-600">
        Soluciones completas certificadas por las marcas líderes internacionales
      </p>
      
      {/* Badges de certificaciones */}
      <div className="flex flex-wrap justify-center gap-4 mt-8">
        <span className="px-4 py-2 font-medium rounded-full bg-primary/10 text-primary">Notifier</span>
        <span className="px-4 py-2 font-medium rounded-full bg-secondary/10 text-secondary">Mircom</span>
        <span className="px-4 py-2 font-medium rounded-full bg-warning/10 text-warning">Inim</span>
        <span className="px-4 py-2 font-medium rounded-full bg-success/10 text-success">Secutron</span>
        <span className="px-4 py-2 font-medium rounded-full bg-info/10 text-info">Bosch</span>
      </div>
    </div>
    
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {/* Detección de Incendios */}
      <div className="p-8 transition-all duration-300 transform border border-gray-100 shadow-lg group bg-gradient-to-br from-gray-50 to-white rounded-2xl hover:shadow-2xl hover:-translate-y-2 hover:border-primary/30">
        <div className="p-4 mb-6 transition-transform bg-gradient-to-r from-primary to-red-600 rounded-2xl w-fit group-hover:scale-110">
          <Eye size={32} className="text-white" />
        </div>
        <h3 className="mb-4 text-2xl font-bold transition-colors font-montserrat group-hover:text-primary">
          Detección de Incendios
        </h3>
        <p className="mb-6 leading-relaxed text-gray-600">
          Especialistas en proyectos, instalación y programación de sistemas de detección. 
          Tecnología avanzada para identificar incendios en etapas iniciales.
        </p>
        <div className="mb-6 space-y-2">
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
          className="inline-flex items-center font-bold transition-colors group/link text-primary hover:text-red-600"
        >
          Ver más 
          <ArrowRight size={16} className="ml-2 transition-transform group-hover/link:translate-x-1" />
        </Link>
      </div>
      
      {/* Extinción de Incendios */}
      <div className="p-8 transition-all duration-300 transform border border-gray-100 shadow-lg group bg-gradient-to-br from-gray-50 to-white rounded-2xl hover:shadow-2xl hover:-translate-y-2 hover:border-secondary/30">
        <div className="p-4 mb-6 transition-transform bg-gradient-to-r from-secondary to-blue-600 rounded-2xl w-fit group-hover:scale-110">
          <Flame size={32} className="text-white" />
        </div>
        <h3 className="mb-4 text-2xl font-bold transition-colors font-montserrat group-hover:text-secondary">
          Extinción de Incendios
        </h3>
        <p className="mb-6 leading-relaxed text-gray-600">
          Sistemas de extinción por gas, agua nebulizada y espuma. 
          Cálculo y diseño de sistemas según normativas internacionales.
        </p>
        <div className="mb-6 space-y-2">
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
          className="inline-flex items-center font-bold transition-colors group/link text-secondary hover:text-blue-600"
        >
          Ver más 
          <ArrowRight size={16} className="ml-2 transition-transform group-hover/link:translate-x-1" />
        </Link>
      </div>
      
      {/* Sistemas de Alarma */}
      <div className="p-8 transition-all duration-300 transform border border-gray-100 shadow-lg group bg-gradient-to-br from-gray-50 to-white rounded-2xl hover:shadow-2xl hover:-translate-y-2 hover:border-warning/30">
        <div className="p-4 mb-6 transition-transform bg-gradient-to-r from-warning to-orange-600 rounded-2xl w-fit group-hover:scale-110">
          <Zap size={32} className="text-white" />
        </div>
        <h3 className="mb-4 text-2xl font-bold transition-colors font-montserrat group-hover:text-warning">
          Sistemas de Alarma
        </h3>
        <p className="mb-6 leading-relaxed text-gray-600">
          Centrales de alarma contra incendios, notificación masiva y 
          evacuación con sistemas de audio y señalización visual.
        </p>
        <div className="mb-6 space-y-2">
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
          className="inline-flex items-center font-bold transition-colors group/link text-warning hover:text-orange-600"
        >
          Ver más 
          <ArrowRight size={16} className="ml-2 transition-transform group-hover/link:translate-x-1" />
        </Link>
      </div>
      
      {/* Mantenimiento */}
      <div className="p-8 transition-all duration-300 transform border border-gray-100 shadow-lg group bg-gradient-to-br from-gray-50 to-white rounded-2xl hover:shadow-2xl hover:-translate-y-2 hover:border-success/30 md:col-span-2 lg:col-span-1">
        <div className="p-4 mb-6 transition-transform bg-gradient-to-r from-success to-green-600 rounded-2xl w-fit group-hover:scale-110">
          <Wrench size={32} className="text-white" />
        </div>
        <h3 className="mb-4 text-2xl font-bold transition-colors font-montserrat group-hover:text-success">
          Mantenimiento
        </h3>
        <p className="mb-6 leading-relaxed text-gray-600">
          Encargados de obras y mantenimientos preventivos y correctivos. 
          Inspecciones regulares y certificaciones técnicas.
        </p>
        <div className="mb-6 space-y-2">
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
          className="inline-flex items-center font-bold transition-colors group/link text-success hover:text-green-600"
        >
          Ver más 
          <ArrowRight size={16} className="ml-2 transition-transform group-hover/link:translate-x-1" />
        </Link>
      </div>
      
      {/* Consultoría */}
      <div className="p-8 transition-all duration-300 transform border border-gray-100 shadow-lg group bg-gradient-to-br from-gray-50 to-white rounded-2xl hover:shadow-2xl hover:-translate-y-2 hover:border-info/30 md:col-span-2">
        <div className="p-4 mb-6 transition-transform bg-gradient-to-r from-info to-cyan-600 rounded-2xl w-fit group-hover:scale-110">
          <AlertTriangle size={32} className="text-white" />
        </div>
        <h3 className="mb-4 text-2xl font-bold transition-colors font-montserrat group-hover:text-info">
          Consultoría y Habilitaciones
        </h3>
        <p className="mb-6 leading-relaxed text-gray-600">
          Encargada de aprobaciones y habilitaciones de obra. Posgrado en higiene y seguridad. 
          Asesoramiento integral en normativas y evaluación de riesgos.
        </p>
        <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
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
          className="inline-flex items-center font-bold transition-colors group/link text-info hover:text-cyan-600"
        >
          Ver más 
          <ArrowRight size={16} className="ml-2 transition-transform group-hover/link:translate-x-1" />
        </Link>
      </div>
    </div>
  </div>
</section>

{/* Por qué IMSSE - Con testimonios */}
<section className="relative py-16 overflow-hidden text-white md:py-20 bg-gradient-to-br from-gray-900 to-gray-800">
  {/* Elementos decorativos */}
  <div className="absolute inset-0 opacity-10">
    <div className="absolute w-32 h-32 rounded-full top-20 left-10 bg-primary blur-xl"></div>
    <div className="absolute w-48 h-48 rounded-full bottom-20 right-10 bg-secondary blur-xl"></div>
  </div>
  
  <div className="container relative z-10 px-4 mx-auto">
    <div className="mb-16 text-center">
      <h2 className="mb-6 text-4xl font-bold md:text-5xl font-montserrat">
        ¿Por qué confiar en IMSSE?
      </h2>
      <p className="max-w-3xl mx-auto text-xl text-gray-300">
        Más de 30 años comprometidos con el constante perfeccionamiento y la excelencia técnica
      </p>
    </div>
    
    <div className="grid grid-cols-1 gap-8 mb-16 md:grid-cols-3">
      <div className="text-center group">
        <div className="flex items-center justify-center w-24 h-24 p-6 mx-auto mb-6 transition-transform bg-gradient-imsse rounded-2xl group-hover:scale-110">
          <Award className="w-12 h-12 text-white" />
        </div>
        <h3 className="mb-4 text-2xl font-bold font-montserrat">Experiencia Comprobada</h3>
        <p className="leading-relaxed text-gray-300">
          Desde 1994 realizando instalaciones de sistemas de detección de incendios. 
          Técnicos certificados en marcas internacionales líderes.
        </p>
      </div>
      
      <div className="text-center group">
        <div className="flex items-center justify-center w-24 h-24 p-6 mx-auto mb-6 transition-transform bg-gradient-fire rounded-2xl group-hover:scale-110">
          <Clock className="w-12 h-12 text-white" />
        </div>
        <h3 className="mb-4 text-2xl font-bold font-montserrat">Respuesta 24/7</h3>
        <p className="leading-relaxed text-gray-300">
          Servicio de emergencia las 24 horas. Respuesta inmediata ante 
          fallas críticas en sistemas de protección contra incendios.
        </p>
      </div>
      
      <div className="text-center group">
        <div className="flex items-center justify-center w-24 h-24 p-6 mx-auto mb-6 transition-transform bg-gradient-safety rounded-2xl group-hover:scale-110">
          <Users className="w-12 h-12 text-white" />
        </div>
        <h3 className="mb-4 text-2xl font-bold font-montserrat">Equipo Especializado</h3>
        <p className="leading-relaxed text-gray-300">
          Ingenieros y técnicos con posgrados en higiene y seguridad. 
          Equipo comprometido con el constante perfeccionamiento técnico.
        </p>
      </div>
    </div>
    
    {/* Testimonial destacado */}
    <div className="max-w-4xl p-8 mx-auto border bg-white/10 backdrop-blur-sm md:p-12 rounded-2xl border-white/20">
      <div className="flex items-center justify-center mb-6">
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
          ))}
        </div>
      </div>
      <blockquote className="mb-6 text-xl italic leading-relaxed text-center md:text-2xl">
        "Gracias a la confianza de nuestros clientes y al crecimiento en el desarrollo y puesta en marcha 
        de nuevos proyectos, nos hemos posicionado como una de las empresas líderes en sistemas de 
        protección contra incendios."
      </blockquote>
      <div className="text-center">
        <div className="text-lg font-bold">IMSSE Ingeniería SAS</div>
        <div className="text-gray-300">Líderes en Protección Contra Incendios</div>
      </div>
    </div>
  </div>
</section>

{/* CTA Final Épico */}
<section className="relative py-16 overflow-hidden text-white md:py-20 bg-gradient-imsse">
  {/* Efectos de fondo animados */}
  <div className="absolute inset-0">
    <div className="absolute inset-0 bg-black/20"></div>
    <div className="absolute top-0 left-0 w-full h-full transform -skew-x-12 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
  </div>
  
  <div className="container relative z-10 px-4 mx-auto text-center">
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-center mb-8">
        <div className="p-4 mr-4 rounded-full bg-white/20">
          <Shield className="text-white" size={48} />
        </div>
        <h2 className="text-4xl font-bold md:text-6xl font-montserrat">
          Su Seguridad es Nuestra Misión
        </h2>
      </div>
      
      <p className="mb-12 text-xl leading-relaxed md:text-2xl">
        No comprometa la seguridad de su empresa. Confíe en los líderes con más de 30 años 
        protegiendo industrias, comercios y gobierno con <strong>soluciones confiables y duraderas</strong>.
      </p>
      
      <div className="flex flex-col justify-center gap-6 sm:flex-row">
        <Link 
          href="/contacto" 
          className="inline-flex items-center px-10 py-5 text-xl font-bold transition-all duration-300 transform bg-white shadow-2xl group text-primary rounded-xl hover:bg-gray-100 hover:scale-105 hover:shadow-white/20"
        >
          <Eye size={28} className="mr-3 group-hover:animate-pulse" />
          Evaluación Gratuita
          <ArrowRight size={24} className="ml-3 transition-transform group-hover:translate-x-2" />
        </Link>
        <a 
          href="tel:+5493516810777" 
          className="inline-flex items-center px-10 py-5 text-xl font-bold text-white transition-all duration-300 transform border-white group border-3 rounded-xl hover:bg-white hover:text-primary hover:scale-105"
        >
          <Zap size={28} className="mr-3" />
          Emergencias 24/7
          <ArrowRight size={24} className="ml-3 transition-transform group-hover:translate-x-2" />
        </a>
      </div>
      
      {/* Datos de contacto rápido */}
      <div className="grid max-w-3xl grid-cols-1 gap-6 mx-auto mt-12 md:grid-cols-3">
        <div className="flex items-center justify-center p-4 bg-white/10 backdrop-blur-sm rounded-xl">
          <Clock className="mr-3" size={20} />
          <span className="font-medium">Respuesta en 24hs</span>
        </div>
        <div className="flex items-center justify-center p-4 bg-white/10 backdrop-blur-sm rounded-xl">
          <Shield className="mr-3" size={20} />
          <span className="font-medium">30+ Años de experiencia</span>
        </div>
        <div className="flex items-center justify-center p-4 bg-white/10 backdrop-blur-sm rounded-xl">
          <Award className="mr-3" size={20} />
          <span className="font-medium">Certificaciones internacionales</span>
        </div>
      </div>
    </div>
  </div>
</section>

{/* Sección de Marcas Certificadas */}
<section className="py-12 bg-white border-t border-gray-100">
  <div className="container px-4 mx-auto">
    <div className="mb-8 text-center">
      <h3 className="mb-4 text-2xl font-bold text-gray-800 font-montserrat">
        Certificados en Marcas Líderes Internacionales
      </h3>
      <p className="text-gray-600">
        Nuestro equipo técnico está certificado en las principales marcas del mercado
      </p>
    </div>
    
    {/* Logos de marcas con animación */}
    <div className="flex flex-wrap items-center justify-center gap-8 transition-opacity md:gap-12 opacity-70 hover:opacity-100">
      <div className="px-6 py-3 text-lg font-bold text-white transition-transform transform rounded-lg bg-gradient-to-r from-primary to-red-600 hover:scale-105">
        NOTIFIER
      </div>
      <div className="px-6 py-3 text-lg font-bold text-white transition-transform transform rounded-lg bg-gradient-to-r from-secondary to-blue-600 hover:scale-105">
        MIRCOM
      </div>
      <div className="px-6 py-3 text-lg font-bold text-white transition-transform transform rounded-lg bg-gradient-to-r from-warning to-orange-600 hover:scale-105">
        INIM
      </div>
      <div className="px-6 py-3 text-lg font-bold text-white transition-transform transform rounded-lg bg-gradient-to-r from-success to-green-600 hover:scale-105">
        SECUTRON
      </div>
      <div className="px-6 py-3 text-lg font-bold text-white transition-transform transform rounded-lg bg-gradient-to-r from-info to-cyan-600 hover:scale-105">
        BOSCH
      </div>
    </div>
  </div>
</section>
    </div>
  );
}
