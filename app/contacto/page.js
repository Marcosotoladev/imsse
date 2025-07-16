// app/contacto/page.js
"use client";

import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Shield, Zap, Send, CheckCircle, Star } from 'lucide-react';

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
    servicio: '',
    mensaje: '',
    urgencia: 'normal'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simular envío del formulario
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      
      // Resetear formulario después de 3 segundos
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          nombre: '',
          empresa: '',
          email: '',
          telefono: '',
          servicio: '',
          mensaje: '',
          urgencia: 'normal'
        });
      }, 3000);
    }, 2000);
  };

  return (
    <div className="flex flex-col min-h-screen pt-20">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-gray-800 to-slate-800 text-white py-16 md:py-20 overflow-hidden">
        {/* Efectos de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-secondary rounded-full blur-2xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-8 border border-white/30">
              <Shield className="text-yellow-400 mr-2" size={20} />
              <span className="font-semibold text-white">Atención 24/7 • Respuesta Inmediata</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-montserrat font-bold mb-6 leading-tight text-white">
              Contáctenos para una
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent font-bold">
                Consulta Gratuita
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-gray-200 leading-relaxed">
              Nuestro equipo de especialistas está listo para evaluar sus necesidades 
              y diseñar la solución de protección contra incendios ideal para su proyecto.
            </p>
            
            {/* Estadísticas de contacto */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-white/15 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                <div className="text-2xl font-bold text-yellow-400 mb-1">24hs</div>
                <div className="text-sm text-gray-200">Tiempo de respuesta</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                <div className="text-2xl font-bold text-orange-400 mb-1">24/7</div>
                <div className="text-sm text-gray-200">Emergencias</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                <div className="text-2xl font-bold text-blue-400 mb-1">30+</div>
                <div className="text-sm text-gray-200">Años de experiencia</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Información de Contacto y Formulario */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
            
            {/* Información de Contacto */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-montserrat font-bold mb-6 text-primary">
                  Información de Contacto
                </h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Estamos ubicados en Córdoba, Argentina, y brindamos servicios en todo el país. 
                  Nuestro equipo está disponible para atender sus consultas y emergencias.
                </p>
              </div>

              {/* Datos de contacto */}
              <div className="space-y-6">
                <div className="flex items-start bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <div className="bg-primary/10 p-3 rounded-full mr-4">
                    <MapPin size={24} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Ubicación</h3>
                    <p className="text-gray-600">Córdoba, Argentina</p>
                    <p className="text-sm text-gray-500 mt-1">Servicios en todo el país</p>
                  </div>
                </div>

                <div className="flex items-start bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <div className="bg-secondary/10 p-3 rounded-full mr-4">
                    <Phone size={24} className="text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Teléfono</h3>
                    <a 
                      href="tel:+5493516810777" 
                      className="text-lg font-medium text-secondary hover:text-blue-600 transition-colors"
                    >
                      +54 9 351 681-0777
                    </a>
                    <p className="text-sm text-gray-500 mt-1">WhatsApp disponible</p>
                  </div>
                </div>

                <div className="flex items-start bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <div className="bg-warning/10 p-3 rounded-full mr-4">
                    <Mail size={24} className="text-warning" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Email</h3>
                    <a 
                      href="mailto:info@imsseingenieria.com" 
                      className="text-lg font-medium text-warning hover:text-orange-600 transition-colors"
                    >
                      info@imsseingenieria.com
                    </a>
                    <p className="text-sm text-gray-500 mt-1">Respuesta en 24hs</p>
                  </div>
                </div>

                <div className="flex items-start bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <div className="bg-success/10 p-3 rounded-full mr-4">
                    <Clock size={24} className="text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Horarios</h3>
                    <p className="text-gray-600">Lunes a Viernes: 8:00 - 18:00</p>
                    <p className="text-sm text-success font-medium mt-1">Emergencias 24/7</p>
                  </div>
                </div>
              </div>

              {/* Certificaciones */}
              <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-xl">
                <h3 className="text-xl font-bold mb-4">Equipo Certificado</h3>
                <p className="mb-4 text-white/90">
                  Nuestro equipo técnico está certificado en las principales marcas internacionales:
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">Notifier</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">Mircom</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">Bosch</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">Inim</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">Secutron</span>
                </div>
              </div>
            </div>

            {/* Formulario de Contacto */}
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="bg-green-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={32} className="text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-600 mb-4">¡Mensaje Enviado!</h3>
                  <p className="text-gray-600 mb-6">
                    Gracias por contactarnos. Nuestro equipo se pondrá en contacto con usted 
                    en las próximas 24 horas.
                  </p>
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <Clock size={16} className="mr-2" />
                    <span>Para emergencias, llame al +54 9 351 681-0777</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <h2 className="text-2xl font-montserrat font-bold mb-4 text-gray-800">
                      Solicitar Consulta Técnica
                    </h2>
                    <p className="text-gray-600">
                      Complete el formulario y nuestro equipo especializado se pondrá en contacto con usted.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">
                          Nombre Completo *
                        </label>
                        <input
                          type="text"
                          id="nombre"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                          placeholder="Su nombre completo"
                        />
                      </div>

                      <div>
                        <label htmlFor="empresa" className="block text-sm font-semibold text-gray-700 mb-2">
                          Empresa
                        </label>
                        <input
                          type="text"
                          id="empresa"
                          name="empresa"
                          value={formData.empresa}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                          placeholder="Nombre de su empresa"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                          placeholder="su@email.com"
                        />
                      </div>

                      <div>
                        <label htmlFor="telefono" className="block text-sm font-semibold text-gray-700 mb-2">
                          Teléfono *
                        </label>
                        <input
                          type="tel"
                          id="telefono"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                          placeholder="+54 9 351 000-0000"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="servicio" className="block text-sm font-semibold text-gray-700 mb-2">
                        Servicio de Interés
                      </label>
                      <select
                        id="servicio"
                        name="servicio"
                        value={formData.servicio}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                      >
                        <option value="">Seleccione un servicio</option>
                        <option value="deteccion">Detección de Incendios</option>
                        <option value="extincion">Extinción de Incendios</option>
                        <option value="alarmas">Sistemas de Alarma</option>
                        <option value="mantenimiento">Mantenimiento</option>
                        <option value="consultoria">Consultoría y Habilitaciones</option>
                        <option value="emergencia">Emergencia - Servicio Inmediato</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="urgencia" className="block text-sm font-semibold text-gray-700 mb-2">
                        Nivel de Urgencia
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="urgencia"
                            value="normal"
                            checked={formData.urgencia === 'normal'}
                            onChange={handleChange}
                            className="mr-2 text-primary focus:ring-primary"
                          />
                          <span className="text-sm">Normal</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="urgencia"
                            value="urgente"
                            checked={formData.urgencia === 'urgente'}
                            onChange={handleChange}
                            className="mr-2 text-warning focus:ring-warning"
                          />
                          <span className="text-sm text-warning font-medium">Urgente</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="urgencia"
                            value="emergencia"
                            checked={formData.urgencia === 'emergencia'}
                            onChange={handleChange}
                            className="mr-2 text-danger focus:ring-danger"
                          />
                          <span className="text-sm text-danger font-bold">Emergencia</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="mensaje" className="block text-sm font-semibold text-gray-700 mb-2">
                        Mensaje
                      </label>
                      <textarea
                        id="mensaje"
                        name="mensaje"
                        value={formData.mensaje}
                        onChange={handleChange}
                        rows="5"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                        placeholder="Describa su proyecto o necesidad de protección contra incendios..."
                      ></textarea>
                    </div>

                    {formData.urgencia === 'emergencia' && (
                      <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                        <div className="flex items-center">
                          <Zap className="text-red-600 mr-2" size={20} />
                          <span className="font-semibold text-red-800">Emergencia Detectada</span>
                        </div>
                        <p className="text-sm text-red-700 mt-2">
                          Para atención inmediata, llame al <strong>+54 9 351 681-0777</strong>. 
                          Nuestro servicio de emergencia está disponible 24/7.
                        </p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                        isSubmitting
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-imsse hover:shadow-lg text-white'
                      }`}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                          Enviando mensaje...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <Send size={20} className="mr-3" />
                          Enviar Consulta
                        </div>
                      )}
                    </button>

                    <p className="text-xs text-gray-500 text-center">
                      Al enviar este formulario, acepta que IMSSE se ponga en contacto con usted 
                      para brindarle información sobre nuestros servicios.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-montserrat font-bold mb-4 text-primary">
              Lo que dicen nuestros clientes
            </h2>
            <p className="text-lg text-gray-600">
              30+ años construyendo confianza en el mercado
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">
                "Excelente servicio y respuesta inmediata. Nos ayudaron con la habilitación 
                de nuestro centro comercial sin demoras."
              </p>
              <div className="font-semibold text-gray-800">Cliente Comercial</div>
              <div className="text-sm text-gray-600">Centro Comercial, Córdoba</div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">
                "Sistemas de detección instalados con la máxima profesionalidad. 
                El equipo técnico muy capacitado."
              </p>
              <div className="font-semibold text-gray-800">Cliente Industrial</div>
              <div className="text-sm text-gray-600">Industria Manufacturera</div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">
                "Confiamos en IMSSE para todos nuestros proyectos gubernamentales. 
                Siempre cumplen con los plazos y normativas."
              </p>
              <div className="font-semibold text-gray-800">Cliente Gubernamental</div>
              <div className="text-sm text-gray-600">Organismo Público</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA de Emergencia */}
      <section className="py-12 bg-gradient-to-r from-red-600 to-orange-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <Zap className="text-yellow-300 mr-3" size={32} />
            <h2 className="text-2xl md:text-3xl font-bold">
              ¿Tiene una Emergencia?
            </h2>
          </div>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Nuestro equipo de emergencia está disponible 24/7 para atender fallas críticas 
            en sistemas de protección contra incendios.
          </p>
          <a 
            href="tel:+5493516810777" 
            className="inline-flex items-center bg-white text-red-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Phone size={24} className="mr-3" />
            Llamar Emergencia: +54 9 351 681-0777
          </a>
        </div>
      </section>
    </div>
  );
}