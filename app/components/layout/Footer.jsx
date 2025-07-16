// components/layout/Footer.js
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, Clock, Shield, Flame, Eye, Zap, Wrench, AlertTriangle, Facebook, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Sección principal del footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Logo y descripción */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-6">
              <Image 
                src="/logo/imsse-logo.png" 
                alt="IMSSE Logo" 
                width={60} 
                height={60}
                className="mr-4"
              />
              <div>
                <h3 className="text-2xl font-montserrat font-bold text-primary">IMSSE</h3>
                <p className="text-secondary font-medium">INGENIERÍA SAS</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Líderes en sistemas de protección contra incendios desde 1994. 
              Soluciones confiables y duraderas para industrias, comercios y gobierno.
            </p>
            
            {/* Certificaciones */}
            <div className="space-y-2">
              <h4 className="font-semibold text-white mb-3">Certificaciones:</h4>
              <div className="flex flex-wrap gap-2">
                <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm">Notifier</span>
                <span className="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-sm">Mircom</span>
                <span className="bg-warning/20 text-warning px-3 py-1 rounded-full text-sm">Bosch</span>
              </div>
            </div>
          </div>

          {/* Servicios */}
          <div>
            <h4 className="text-xl font-montserrat font-bold mb-6 text-white">Nuestros Servicios</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/servicios/deteccion-incendios" className="flex items-center text-gray-300 hover:text-primary transition-colors">
                  <Eye size={16} className="mr-2" />
                  <span>Detección de Incendios</span>
                </Link>
              </li>
              <li>
                <Link href="/servicios/extincion-incendios" className="flex items-center text-gray-300 hover:text-secondary transition-colors">
                  <Flame size={16} className="mr-2" />
                  <span>Extinción de Incendios</span>
                </Link>
              </li>
              <li>
                <Link href="/servicios/sistemas-alarma" className="flex items-center text-gray-300 hover:text-warning transition-colors">
                  <Zap size={16} className="mr-2" />
                  <span>Sistemas de Alarma</span>
                </Link>
              </li>
              <li>
                <Link href="/servicios/mantenimiento" className="flex items-center text-gray-300 hover:text-success transition-colors">
                  <Wrench size={16} className="mr-2" />
                  <span>Mantenimiento</span>
                </Link>
              </li>
              <li>
                <Link href="/servicios/consultoria" className="flex items-center text-gray-300 hover:text-info transition-colors">
                  <AlertTriangle size={16} className="mr-2" />
                  <span>Consultoría</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Sectores */}
          <div>
            <h4 className="text-xl font-montserrat font-bold mb-6 text-white">Sectores</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/sectores/industria" className="flex items-center text-gray-300 hover:text-primary transition-colors">
                  <Shield size={16} className="mr-2" />
                  <span>Industria</span>
                </Link>
              </li>
              <li>
                <Link href="/sectores/comercio" className="flex items-center text-gray-300 hover:text-secondary transition-colors">
                  <Shield size={16} className="mr-2" />
                  <span>Comercio</span>
                </Link>
              </li>
              <li>
                <Link href="/sectores/gobierno" className="flex items-center text-gray-300 hover:text-warning transition-colors">
                  <Shield size={16} className="mr-2" />
                  <span>Gobierno</span>
                </Link>
              </li>
            </ul>
            
            <div className="mt-8">
              <h4 className="text-xl font-montserrat font-bold mb-6 text-white">Enlaces</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/nosotros" className="text-gray-300 hover:text-primary transition-colors">
                    Nosotros
                  </Link>
                </li>
                <li>
                  <Link href="/contacto" className="text-gray-300 hover:text-primary transition-colors">
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="text-gray-300 hover:text-primary transition-colors">
                    Panel Administrativo
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-xl font-montserrat font-bold mb-6 text-white">Contacto</h4>
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin size={20} className="text-primary mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">
                    Córdoba, Argentina
                  </p>
                  <p className="text-sm text-gray-400">
                    Servicios en todo el país
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Phone size={20} className="text-secondary mr-3 flex-shrink-0" />
                <a 
                  href="tel:+5493516810777" 
                  className="text-gray-300 hover:text-secondary transition-colors"
                >
                  +54 9 351 681-0777
                </a>
              </div>
              
              <div className="flex items-center">
                <Mail size={20} className="text-warning mr-3 flex-shrink-0" />
                <a 
                  href="mailto:info@imsseingenieria.com" 
                  className="text-gray-300 hover:text-warning transition-colors"
                >
                  info@imsseingenieria.com
                </a>
              </div>
              
              <div className="flex items-start">
                <Clock size={20} className="text-success mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">Lun - Vie: 8:00 - 18:00</p>
                  <p className="text-sm text-gray-400">Emergencias 24/7</p>
                </div>
              </div>
            </div>

            {/* Redes sociales */}
            <div className="mt-8">
              <h4 className="text-lg font-semibold mb-4 text-white">Síguenos</h4>
              <div className="flex space-x-4">
                <a 
                  href="#" 
                  className="bg-primary/20 p-3 rounded-full hover:bg-primary hover:scale-110 transition-all duration-300"
                >
                  <Facebook size={20} className="text-primary hover:text-white" />
                </a>
                <a 
                  href="#" 
                  className="bg-secondary/20 p-3 rounded-full hover:bg-secondary hover:scale-110 transition-all duration-300"
                >
                  <Instagram size={20} className="text-secondary hover:text-white" />
                </a>
                <a 
                  href="#" 
                  className="bg-info/20 p-3 rounded-full hover:bg-info hover:scale-110 transition-all duration-300"
                >
                  <Linkedin size={20} className="text-info hover:text-white" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="border-t border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 IMSSE Ingeniería SAS. Todos los derechos reservados.
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <Link href="/privacidad" className="text-gray-400 hover:text-primary transition-colors">
                Política de Privacidad
              </Link>
              <Link href="/terminos" className="text-gray-400 hover:text-primary transition-colors">
                Términos y Condiciones
              </Link>
              <div className="flex items-center text-gray-400">
                <Shield size={16} className="mr-1" />
                <span>Desde 1994</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;