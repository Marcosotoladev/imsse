// components/layout/Footer.js
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, Clock, Shield, Flame, Eye, Zap, Wrench, AlertTriangle, Facebook, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="text-white bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Sección principal del footer */}
      <div className="container px-4 py-16 mx-auto">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">

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
                <h3 className="text-2xl font-bold font-montserrat text-primary">IMSSE</h3>
                <p className="font-medium text-secondary">INGENIERÍA SAS</p>
              </div>
            </div>
            <p className="mb-6 leading-relaxed text-gray-300">
              Líderes en sistemas de protección contra incendios desde 1994.
              Soluciones confiables y duraderas para industrias, comercios y gobierno.
            </p>

            {/* Certificaciones */}
            <div className="space-y-2">
              <h4 className="mb-3 font-semibold text-white">Certificaciones:</h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 text-sm rounded-full bg-primary/20 text-primary">Notifier</span>
                <span className="px-3 py-1 text-sm rounded-full bg-secondary/20 text-secondary">Mircom</span>
                <span className="px-3 py-1 text-sm rounded-full bg-warning/20 text-warning">Bosch</span>
              </div>
            </div>
          </div>

          {/* Servicios */}
          <div>
            <h4 className="mb-6 text-xl font-bold text-white font-montserrat">Nuestros Servicios</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/servicios/deteccion-incendios" className="flex items-center text-gray-300 transition-colors hover:text-primary">
                  <Eye size={16} className="mr-2" />
                  <span>Detección de Incendios</span>
                </Link>
              </li>
              <li>
                <Link href="/servicios/extincion-incendios" className="flex items-center text-gray-300 transition-colors hover:text-secondary">
                  <Flame size={16} className="mr-2" />
                  <span>Extinción de Incendios</span>
                </Link>
              </li>
              <li>
                <Link href="/servicios/sistemas-alarma" className="flex items-center text-gray-300 transition-colors hover:text-warning">
                  <Zap size={16} className="mr-2" />
                  <span>Sistemas de Alarma</span>
                </Link>
              </li>
              <li>
                <Link href="/servicios/mantenimiento" className="flex items-center text-gray-300 transition-colors hover:text-success">
                  <Wrench size={16} className="mr-2" />
                  <span>Mantenimiento</span>
                </Link>
              </li>
              <li>
                <Link href="/servicios/consultoria" className="flex items-center text-gray-300 transition-colors hover:text-info">
                  <AlertTriangle size={16} className="mr-2" />
                  <span>Consultoría</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Sectores */}
          <div>
            <h4 className="mb-6 text-xl font-bold text-white font-montserrat">Sectores</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/sectores/industria" className="flex items-center text-gray-300 transition-colors hover:text-primary">
                  <Shield size={16} className="mr-2" />
                  <span>Industria</span>
                </Link>
              </li>
              <li>
                <Link href="/sectores/comercio" className="flex items-center text-gray-300 transition-colors hover:text-secondary">
                  <Shield size={16} className="mr-2" />
                  <span>Comercio</span>
                </Link>
              </li>
              <li>
                <Link href="/sectores/gobierno" className="flex items-center text-gray-300 transition-colors hover:text-warning">
                  <Shield size={16} className="mr-2" />
                  <span>Gobierno</span>
                </Link>
              </li>
            </ul>

            <div className="mt-8">
              <h4 className="mb-6 text-xl font-bold text-white font-montserrat">Enlaces</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/servicios" className="text-gray-300 transition-colors hover:text-primary">
                    Servicios
                  </Link>
                </li>
                <li>
                  <Link href="/nosotros" className="text-gray-300 transition-colors hover:text-primary">
                    Nosotros
                  </Link>
                </li>
                <li>
                  <Link href="/contacto" className="text-gray-300 transition-colors hover:text-primary">
                    Contacto
                  </Link>
                </li>

                <li>
                  <Link href="/login" className="text-gray-300 transition-colors hover:text-primary">
                    Cuenta
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="mb-6 text-xl font-bold text-white font-montserrat">Contacto</h4>
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin size={20} className="flex-shrink-0 mt-1 mr-3 text-primary" />
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
                <Phone size={20} className="flex-shrink-0 mr-3 text-secondary" />
                <a
                  href="tel:+5493516810777"
                  className="text-gray-300 transition-colors hover:text-secondary"
                >
                  +54 9 351 681-0777
                </a>
              </div>

              <div className="flex items-center">
                <Mail size={20} className="flex-shrink-0 mr-3 text-warning" />
                <a
                  href="mailto:info@imsseingenieria.com"
                  className="text-gray-300 transition-colors hover:text-warning"
                >
                  info@imsseingenieria.com
                </a>
              </div>

              <div className="flex items-start">
                <Clock size={20} className="flex-shrink-0 mt-1 mr-3 text-success" />
                <div>
                  <p className="text-gray-300">Lun - Vie: 8:00 - 18:00</p>
                  <p className="text-sm text-gray-400">Emergencias 24/7</p>
                </div>
              </div>
            </div>

            {/* Redes sociales */}
            <div className="mt-8">
              <h4 className="mb-4 text-lg font-semibold text-white">Síguenos</h4>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="p-3 transition-all duration-300 rounded-full bg-primary/20 hover:bg-primary hover:scale-110"
                >
                  <Facebook size={20} className="text-primary hover:text-white" />
                </a>
                <a
                  href="#"
                  className="p-3 transition-all duration-300 rounded-full bg-secondary/20 hover:bg-secondary hover:scale-110"
                >
                  <Instagram size={20} className="text-secondary hover:text-white" />
                </a>
                <a
                  href="#"
                  className="p-3 transition-all duration-300 rounded-full bg-info/20 hover:bg-info hover:scale-110"
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
        <div className="container px-4 py-6 mx-auto">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="mb-4 text-sm text-gray-400 md:mb-0">
              © 2024 IMSSE Ingeniería SAS. Todos los derechos reservados.
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <Link href="/privacidad" className="text-gray-400 transition-colors hover:text-primary">
                Política de Privacidad
              </Link>
              <Link href="/terminos" className="text-gray-400 transition-colors hover:text-primary">
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