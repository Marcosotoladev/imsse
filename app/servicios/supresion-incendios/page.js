// app/servicios/supresion-incendios/page.js
import Link from 'next/link';
import { ArrowRight, Shield, Flame, CheckCircle, Star, Award, Clock, Users, Zap, AlertTriangle, Phone, Droplets, Wind } from 'lucide-react';

export const metadata = {
  title: 'Supresión de Incendios - IMSSE Ingeniería SAS | Sistemas de Extinción',
  description: 'Especialistas en cálculo, diseño e instalación de sistemas de supresión de incendios. Gas limpio, agua nebulizada, espuma y rociadores automáticos.',
  keywords: 'supresión incendios, extinción incendios, gas limpio, agua nebulizada, espuma, rociadores automáticos, cálculo hidráulico',
};

export default function SupresionIncendiosPage() {
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
              <Flame className="mr-2 text-cyan-300" size={20} />
              <span className="font-semibold">Expertos en Extinción • Posgrado en Higiene y Seguridad</span>
            </div>
            
            <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl font-montserrat">
              Sistemas de
              <span className="block text-transparent bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text">
                Supresión de Incendios
              </span>
            </h1>
            
            <p className="mb-8 text-xl leading-relaxed md:text-2xl text-white/90">
              Encargados de aprobaciones y habilitaciones de obra, cálculo y diseño de sistemas de extinción de incendios. 
              Soluciones especializadas para diferentes tipos de riesgo.
            </p>
            
            {/* Especialidades destacadas */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <span className="px-4 py-2 font-medium text-white border rounded-full bg-white/20 backdrop-blur-sm border-white/30">
                Gas Limpio
              </span>
              <span className="px-4 py-2 font-medium text-white border rounded-full bg-white/20 backdrop-blur-sm border-white/30">
                Agua Nebulizada
              </span>
              <span className="px-4 py-2 font-medium text-white border rounded-full bg-white/20 backdrop-blur-sm border-white/30">
                Espuma AFFF
              </span>
              <span className="px-4 py-2 font-medium text-white border rounded-full bg-white/20 backdrop-blur-sm border-white/30">
                Cálculo Hidráulico
              </span>
            </div>
            
            <Link 
              href="/contacto" 
              className="inline-flex items-center px-8 py-4 text-lg font-bold text-blue-600 transition-all duration-300 transform bg-white shadow-2xl rounded-xl hover:bg-gray-100 hover:scale-105"
            >
              <Flame size={24} className="mr-3" />
              Solicitar Diseño
              <ArrowRight size={20} className="ml-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Sistemas de Supresión */}
      <section className="py-16 bg-white md:py-20">
        <div className="container px-4 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-bold md:text-5xl font-montserrat text-primary">
              Sistemas de Supresión
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              Tecnologías avanzadas de extinción adaptadas a cada tipo de riesgo y aplicación
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 mx-auto mb-16 lg:grid-cols-2 max-w-7xl">
            
            {/* Gas Limpio */}
            <div className="p-8 border border-green-100 shadow-lg bg-gradient-to-br from-green-50 to-white rounded-2xl">
              <div className="flex items-start space-x-6">
                <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl">
                  <Wind size={32} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-2xl font-bold text-green-600 font-montserrat">
                    Sistemas por Gas Limpio
                  </h3>
                  <p className="mb-6 leading-relaxed text-gray-600">
                    Sistemas de extinción por agentes gaseosos limpios, ideales para proteger equipos electrónicos y espacios ocupados.
                  </p>
                  
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>FM-200, Novec 1230, CO2</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>No deja residuos</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Seguro para personas</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Ideal para centros de datos</span>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-green-50">
                    <h4 className="mb-2 font-semibold text-green-800">Aplicaciones:</h4>
                    <p className="text-sm text-green-700">
                      Salas de servidores, cuartos eléctricos, archivos, museos, laboratorios.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Agua Nebulizada */}
            <div className="p-8 border border-blue-100 shadow-lg bg-gradient-to-br from-blue-50 to-white rounded-2xl">
              <div className="flex items-start space-x-6">
                <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl">
                  <Droplets size={32} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-2xl font-bold text-blue-600 font-montserrat">
                    Agua Nebulizada
                  </h3>
                  <p className="mb-6 leading-relaxed text-gray-600">
                    Tecnología de alta presión que produce micro gotas de agua para extinción eficiente con mínimo daño por agua.
                  </p>
                  
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Gotas de 10-100 micrones</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Enfriamiento y sofocación</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Mínimo daño por agua</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Ecológicamente seguro</span>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-blue-50">
                    <h4 className="mb-2 font-semibold text-blue-800">Aplicaciones:</h4>
                    <p className="text-sm text-blue-700">
                      Turbinas, transformadores, cocinas industriales, hoteles.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Espuma AFFF */}
            <div className="p-8 border border-orange-100 shadow-lg bg-gradient-to-br from-orange-50 to-white rounded-2xl">
              <div className="flex items-start space-x-6">
                <div className="p-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl">
                  <Zap size={32} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-2xl font-bold text-orange-600 font-montserrat">
                    Sistemas de Espuma
                  </h3>
                  <p className="mb-6 leading-relaxed text-gray-600">
                    Sistemas de espuma AFFF para combatir incendios de líquidos inflamables y hidrocarburos.
                  </p>
                  
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>AFFF (Aqueous Film Forming Foam)</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Supresión de líquidos inflamables</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Prevención de re-ignición</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Sistemas fijos y portátiles</span>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-orange-50">
                    <h4 className="mb-2 font-semibold text-orange-800">Aplicaciones:</h4>
                    <p className="text-sm text-orange-700">
                      Hangares, tanques de combustible, plantas petroquímicas.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cálculo Hidráulico */}
            <div className="p-8 border border-purple-100 shadow-lg bg-gradient-to-br from-purple-50 to-white rounded-2xl">
              <div className="flex items-start space-x-6">
                <div className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl">
                  <AlertTriangle size={32} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-4 text-2xl font-bold text-purple-600 font-montserrat">
                    Cálculo Hidráulico
                  </h3>
                  <p className="mb-6 leading-relaxed text-gray-600">
                    Cálculos hidráulicos especializados para garantizar el correcto dimensionamiento y funcionamiento del sistema.
                  </p>
                  
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Análisis de presión y caudal</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Dimensionamiento de tuberías</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Selección de bombas</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="mr-3 text-green-500" />
                      <span>Cumplimiento normativo</span>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-purple-50">
                    <h4 className="mb-2 font-semibold text-purple-800">Normativas:</h4>
                    <p className="text-sm text-purple-700">
                      NFPA 13, 15, 16, 20. Cálculos según estándares internacionales.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Servicios Especializados */}
      <section className="py-16 bg-gray-50">
        <div className="container px-4 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-bold md:text-5xl font-montserrat text-primary">
              Servicios Especializados
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              Servicios integrales desde el diseño hasta la habilitación final
            </p>
          </div>
          
          <div className="grid max-w-6xl grid-cols-1 gap-8 mx-auto md:grid-cols-3">
            
            {/* Aprobaciones y Habilitaciones */}
            <div className="p-8 text-center transition-all duration-300 transform bg-white shadow-lg rounded-2xl group hover:shadow-2xl hover:-translate-y-2">
              <div className="flex items-center justify-center w-20 h-20 p-4 mx-auto mb-6 transition-transform bg-red-100 rounded-2xl group-hover:scale-110">
                <Shield className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-red-600 font-montserrat">Aprobaciones de Obra</h3>
              <p className="mb-6 leading-relaxed text-gray-600">
                Gestión completa de aprobaciones municipales y habilitaciones de obra para sistemas de extinción.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-center">
                  <CheckCircle size={14} className="mr-2 text-green-500" />
                  <span>Trámites municipales</span>
                </div>
                <div className="flex items-center justify-center">
                  <CheckCircle size={14} className="mr-2 text-green-500" />
                  <span>Documentación técnica</span>
                </div>
                <div className="flex items-center justify-center">
                  <CheckCircle size={14} className="mr-2 text-green-500" />
                  <span>Certificaciones finales</span>
                </div>
              </div>
            </div>
            
            {/* Diseño de Sistemas */}
            <div className="p-8 text-center transition-all duration-300 transform bg-white shadow-lg rounded-2xl group hover:shadow-2xl hover:-translate-y-2">
              <div className="flex items-center justify-center w-20 h-20 p-4 mx-auto mb-6 transition-transform bg-blue-100 rounded-2xl group-hover:scale-110">
                <AlertTriangle className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-blue-600 font-montserrat">Diseño Personalizado</h3>
              <p className="mb-6 leading-relaxed text-gray-600">
                Diseño de sistemas de extinción personalizados según el tipo de riesgo y características del edificio.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-center">
                  <CheckCircle size={14} className="mr-2 text-green-500" />
                  <span>Análisis de riesgos</span>
                </div>
                <div className="flex items-center justify-center">
                  <CheckCircle size={14} className="mr-2 text-green-500" />
                  <span>Planos técnicos</span>
                </div>
                <div className="flex items-center justify-center">
                  <CheckCircle size={14} className="mr-2 text-green-500" />
                  <span>Especificaciones</span>
                </div>
              </div>
            </div>
            
            {/* Consultoría Técnica */}
            <div className="p-8 text-center transition-all duration-300 transform bg-white shadow-lg rounded-2xl group hover:shadow-2xl hover:-translate-y-2">
              <div className="flex items-center justify-center w-20 h-20 p-4 mx-auto mb-6 transition-transform bg-green-100 rounded-2xl group-hover:scale-110">
                <Users className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-green-600 font-montserrat">Consultoría Técnica</h3>
              <p className="mb-6 leading-relaxed text-gray-600">
                Asesoramiento especializado con posgrado en higiene y seguridad para proyectos complejos.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-center">
                  <CheckCircle size={14} className="mr-2 text-green-500" />
                  <span>Evaluación técnica</span>
                </div>
                <div className="flex items-center justify-center">
                  <CheckCircle size={14} className="mr-2 text-green-500" />
                  <span>Optimización</span>
                </div>
                <div className="flex items-center justify-center">
                  <CheckCircle size={14} className="mr-2 text-green-500" />
                  <span>Cumplimiento normativo</span>
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
              Soluciones especializadas para diferentes industrias y aplicaciones
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              
              {/* Industrial */}
              <div className="p-6 transition-all border border-gray-200 bg-gradient-to-br from-gray-50 to-white rounded-xl hover:shadow-lg">
                <h4 className="mb-3 font-bold text-gray-800">Industrial</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Plantas petroquímicas</li>
                  <li>• Refinerías</li>
                  <li>• Fábricas</li>
                  <li>• Depósitos</li>
                </ul>
              </div>
              
              {/* Comercial */}
              <div className="p-6 transition-all border border-blue-200 bg-gradient-to-br from-blue-50 to-white rounded-xl hover:shadow-lg">
                <h4 className="mb-3 font-bold text-blue-800">Comercial</h4>
                <ul className="space-y-2 text-sm text-blue-600">
                  <li>• Centros comerciales</li>
                  <li>• Oficinas</li>
                  <li>• Hoteles</li>
                  <li>• Restaurantes</li>
                </ul>
              </div>
              
              {/* Tecnológico */}
              <div className="p-6 transition-all border border-green-200 bg-gradient-to-br from-green-50 to-white rounded-xl hover:shadow-lg">
                <h4 className="mb-3 font-bold text-green-800">Tecnológico</h4>
                <ul className="space-y-2 text-sm text-green-600">
                  <li>• Centros de datos</li>
                  <li>• Salas de servidores</li>
                  <li>• Laboratorios</li>
                  <li>• Telecomunicaciones</li>
                </ul>
              </div>
              
              {/* Transporte */}
              <div className="p-6 transition-all border border-purple-200 bg-gradient-to-br from-purple-50 to-white rounded-xl hover:shadow-lg">
                <h4 className="mb-3 font-bold text-purple-800">Transporte</h4>
                <ul className="space-y-2 text-sm text-purple-600">
                  <li>• Hangares</li>
                  <li>• Aeropuertos</li>
                  <li>• Túneles</li>
                  <li>• Estaciones</li>
                </ul>
              </div>
              
              {/* Energía */}
              <div className="p-6 transition-all border border-orange-200 bg-gradient-to-br from-orange-50 to-white rounded-xl hover:shadow-lg">
                <h4 className="mb-3 font-bold text-orange-800">Energía</h4>
                <ul className="space-y-2 text-sm text-orange-600">
                  <li>• Subestaciones</li>
                  <li>• Plantas eléctricas</li>
                  <li>• Transformadores</li>
                  <li>• Turbinas</li>
                </ul>
              </div>
              
              {/* Patrimonial */}
              <div className="p-6 transition-all border border-yellow-200 bg-gradient-to-br from-yellow-50 to-white rounded-xl hover:shadow-lg">
                <h4 className="mb-3 font-bold text-yellow-800">Patrimonial</h4>
                <ul className="space-y-2 text-sm text-yellow-600">
                  <li>• Museos</li>
                  <li>• Bibliotecas</li>
                  <li>• Archivos</li>
                  <li>• Iglesias</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 text-white bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900">
        <div className="container px-4 mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="mb-6 text-3xl font-bold md:text-5xl font-montserrat">
              ¿Necesita un Sistema de Supresión?
            </h2>
            <p className="mb-8 text-xl leading-relaxed text-white/90">
              Solicite una consulta técnica especializada. Diseñamos e instalamos 
              el sistema de extinción ideal para su tipo de riesgo y aplicación.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link 
                href="/contacto" 
                className="inline-flex items-center px-8 py-4 text-lg font-bold text-blue-600 transition-all duration-300 transform bg-white rounded-xl hover:bg-gray-100 hover:scale-105"
              >
                <Flame size={24} className="mr-3" />
                Consulta Especializada
                <ArrowRight size={20} className="ml-3" />
              </Link>
              <a 
                href="tel:+5493516810777" 
                className="inline-flex items-center px-8 py-4 text-lg font-bold text-white transition-all duration-300 border-2 border-white rounded-xl hover:bg-white hover:text-blue-600"
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