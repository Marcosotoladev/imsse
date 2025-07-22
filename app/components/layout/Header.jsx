// components/layout/Header.js - Con acceso al login IMSSE
"use client";

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, X, Home, Shield, Wrench, Users, MessageSquare, ChevronDown, Flame, Eye, Zap, LogIn } from 'lucide-react';
import Image from 'next/image';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const pathname = usePathname();

  // Efecto para detectar el scroll y página actual
  useEffect(() => {
    const handleScroll = () => {
      // En páginas internas, activar el fondo blanco inmediatamente
      const isHomePage = pathname === '/';
      if (!isHomePage || window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    // Verificar al cargar la página
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  // Verificar inmediatamente si estamos en una página interna
  useEffect(() => {
    const isHomePage = pathname === '/';
    if (!isHomePage) {
      setScrolled(true);
    }
  }, [pathname]);

  // Efecto para cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setActiveDropdown(null);
        setIsMenuOpen(false);
      }
    };

    // Agregar event listeners
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  const toggleDropdown = (id) => {
    if (activeDropdown === id) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(id);
    }
  };

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-imsse py-1' : 'bg-transparent py-1'}`}>
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between">

          {/* Logo IMSSE */}
          <Link href="/" className="flex items-center group">
            <div className="flex items-center">
              <div className="mr-3">
                <Image 
                  src={'/logo/imsse-logo.png'} 
                  alt="IMSSE Logo" 
                  width={40} 
                  height={40}
                  className="transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div>
                <span className="text-3xl font-bold font-montserrat">
                  <span className={`${scrolled ? 'text-primary' : 'text-white'} transition-colors duration-300 drop-shadow-lg`}>IMSSE</span>
                </span>
                <span className={`block text-xs ${scrolled ? 'text-secondary' : 'text-white'} font-montserrat font-medium tracking-wide drop-shadow-lg`}>
                  INGENIERÍA SAS
                </span>
                <span className={`block text-xs ${scrolled ? 'text-gray-600' : 'text-gray-200'} font-sans drop-shadow-lg`}>
                  Sistemas de Seguridad Contra Incendios
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="items-center hidden space-x-1 md:flex">
            <Link
              href="/"
              className={`group relative px-3 py-2 rounded-md transition-all duration-200 ${scrolled ? 'text-gray-700 hover:text-primary' : 'text-white hover:text-white'}`}
            >
              <span className="flex items-center">
                <Home size={16} className="mr-1 transition-transform group-hover:scale-110" />
                <span>Inicio</span>
              </span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>

            <div className="relative group" ref={dropdownRef}>
              <button
                onClick={() => toggleDropdown('servicios')}
                className={`group relative px-3 py-2 rounded-md transition-all duration-200 flex items-center ${scrolled ? 'text-gray-700 hover:text-primary' : 'text-white hover:text-white'}`}
              >
                <Shield size={16} className="mr-1 transition-transform group-hover:scale-110" />
                <span>Servicios</span>
                <ChevronDown size={14} className={`ml-1 transition-transform duration-300 ${activeDropdown === 'servicios' ? 'rotate-180' : ''}`} />
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </button>

              {/* Dropdown - Servicios de Seguridad Contra Incendios */}
              <div className={`absolute top-full left-0 w-64 mt-1 bg-white shadow-xl rounded-md overflow-hidden transition-all duration-300 border border-gray-200 ${activeDropdown === 'servicios' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
                <Link href="/servicios/deteccion-incendios" className="flex items-center px-4 py-3 text-gray-700 transition-all duration-200 border-b border-gray-100 group hover:bg-red-50 hover:text-primary hover:pl-6">
                  <Eye size={16} className="mr-3 transition-transform text-primary group-hover:scale-110" />
                  <span className="font-medium">Detección de Incendios</span>
                </Link>
                <Link href="/servicios/supresion-incendios" className="flex items-center px-4 py-3 text-gray-700 transition-all duration-200 border-b border-gray-100 group hover:bg-blue-50 hover:text-secondary hover:pl-6">
                  <Flame size={16} className="mr-3 transition-transform text-secondary group-hover:scale-110" />
                  <span className="font-medium">Supresión de Incendios</span>
                </Link>
                <Link href="/servicios/sistemas-alarma" className="flex items-center px-4 py-3 text-gray-700 transition-all duration-200 border-b border-gray-100 group hover:bg-orange-50 hover:text-warning hover:pl-6">
                  <Zap size={16} className="mr-3 transition-transform text-warning group-hover:scale-110" />
                  <span className="font-medium">Sistemas de Alarma</span>
                </Link>
                <Link href="/servicios/rociadores" className="flex items-center px-4 py-3 text-gray-700 transition-all duration-200 border-b border-gray-100 group hover:bg-cyan-50 hover:text-info hover:pl-6">
                  <Shield size={16} className="mr-3 transition-transform text-info group-hover:scale-110" />
                  <span className="font-medium">Rociadores Automáticos</span>
                </Link>
                <Link href="/servicios/mantenimiento" className="flex items-center px-4 py-3 text-gray-700 transition-all duration-200 border-b border-gray-100 group hover:bg-green-50 hover:text-success hover:pl-6">
                  <Wrench size={16} className="mr-3 transition-transform text-success group-hover:scale-110" />
                  <span className="font-medium">Mantenimiento</span>
                </Link>
                <Link href="/servicios" className="flex items-center px-4 py-3 font-bold transition-all duration-200 group text-primary hover:bg-primary hover:text-white hover:pl-6">
                  <Shield size={16} className="mr-3 transition-transform group-hover:scale-110" />
                  <span>Ver todos los servicios</span>
                </Link>
              </div>
            </div>

            <Link
              href="/nosotros"
              className={`group relative px-3 py-2 rounded-md transition-all duration-200 ${scrolled ? 'text-gray-700 hover:text-primary' : 'text-white hover:text-white'}`}
            >
              <span className="flex items-center">
                <Users size={16} className="mr-1 transition-transform group-hover:scale-110" />
                <span>Nosotros</span>
              </span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>

            <Link
              href="/contacto"
              className={`bg-gradient-imsse hover:bg-primary text-white px-4 py-2 rounded-md transition-all duration-300 flex items-center ml-2 shadow-lg hover:shadow-fire transform hover:scale-105 ${scrolled ? 'shadow-md' : ''}`}
            >
              <MessageSquare size={16} className="mr-1" />
              <span>Contacto</span>
            </Link>

            {/* Botón de Ingresar al Sistema */}
            <Link
              href="/admin"
              className={`border-2 border-primary hover:bg-primary hover:text-white px-4 py-2 rounded-md transition-all duration-300 flex items-center ml-2 transform hover:scale-105 ${
                scrolled 
                  ? 'text-primary bg-white shadow-md' 
                  : 'text-white bg-white/10 backdrop-blur-sm'
              }`}
            >
              <LogIn size={16} className="mr-1" />
              <span>Ingresar</span>
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            className={`md:hidden p-2 rounded-md ${scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 py-3 bg-white shadow-lg rounded-lg max-h-[70vh] overflow-y-auto">
            <Link
              href="/"
              className="flex items-center px-4 py-3 text-gray-700 transition-colors rounded-md hover:bg-primary hover:text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              <Home size={18} className="mr-2" />
              <span>Inicio</span>
            </Link>

            <div className="px-4 py-3">
              <button
                onClick={() => toggleDropdown('mobileServicios')}
                className="flex items-center w-full text-left text-gray-700 hover:text-primary"
              >
                <Shield size={18} className="mr-2" />
                <span>Servicios de Seguridad</span>
                <ChevronDown size={16} className={`ml-auto transition-transform duration-300 ${activeDropdown === 'mobileServicios' ? 'rotate-180' : ''}`} />
              </button>

              {activeDropdown === 'mobileServicios' && (
                <div className="pl-4 mt-2 ml-6 space-y-2 border-l-2 border-primary">
                  <Link
                    href="/servicios/deteccion-incendios"
                    className="flex items-center py-2 text-gray-700 transition-all duration-200 group hover:text-primary hover:pl-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Eye size={14} className="mr-2 transition-transform group-hover:scale-110" />
                    <span>Detección de Incendios</span>
                  </Link>
                  <Link
                    href="/servicios/supresion-incendios"
                    className="flex items-center py-2 text-gray-700 transition-all duration-200 group hover:text-secondary hover:pl-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Flame size={14} className="mr-2 transition-transform group-hover:scale-110" />
                    <span>Supresión de Incendios</span>
                  </Link>
                  <Link
                    href="/servicios/sistemas-alarma"
                    className="flex items-center py-2 text-gray-700 transition-all duration-200 group hover:text-warning hover:pl-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Zap size={14} className="mr-2 transition-transform group-hover:scale-110" />
                    <span>Sistemas de Alarma</span>
                  </Link>
                  <Link
                    href="/servicios/rociadores"
                    className="flex items-center py-2 text-gray-700 transition-all duration-200 group hover:text-info hover:pl-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Shield size={14} className="mr-2 transition-transform group-hover:scale-110" />
                    <span>Rociadores Automáticos</span>
                  </Link>
                  <Link
                    href="/servicios/mantenimiento"
                    className="flex items-center py-2 text-gray-700 transition-all duration-200 group hover:text-success hover:pl-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Wrench size={14} className="mr-2 transition-transform group-hover:scale-110" />
                    <span>Mantenimiento</span>
                  </Link>
                  <Link
                    href="/servicios"
                    className="block py-2 font-medium transition-all duration-200 text-primary hover:pl-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Ver todos los servicios
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/nosotros"
              className="flex items-center px-4 py-3 text-gray-700 transition-colors rounded-md hover:bg-primary hover:text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              <Users size={18} className="mr-2" />
              <span>Nosotros</span>
            </Link>

            <Link
              href="/contacto"
              className="flex items-center px-4 py-3 mx-4 mt-2 text-white transition-colors rounded-md bg-gradient-imsse hover:bg-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              <MessageSquare size={18} className="mr-2" />
              <span>Contacto</span>
            </Link>

            {/* Botón de Ingresar para móvil */}
            <Link
              href="/admin"
              className="flex items-center px-4 py-3 mx-4 mt-2 transition-colors border-2 rounded-md text-primary border-primary hover:bg-primary hover:text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              <LogIn size={18} className="mr-2" />
              <span>Ingresar al Sistema</span>
            </Link>
          </nav>
        )}
      </div>

      {/* Barra de progreso temática de seguridad contra incendios */}
      <div className={`h-0.5 bg-gradient-fire transform transition-transform duration-500 ${scrolled ? 'scale-x-100' : 'scale-x-0'}`}></div>
      <hr className='border-t border-white opacity-20' />
    </header>
  );
};

export default Header;