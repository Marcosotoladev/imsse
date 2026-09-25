// components/layout/Header.js - Con estado de autenticación IMSSE y navegación mejorada
"use client";

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Menu, X, Home, Shield, Wrench, Users, MessageSquare, ChevronDown,
  Flame, Eye, Zap, LogOut, User
} from 'lucide-react';
import Image from 'next/image';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../lib/firebase';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const dropdownRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();

  // Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const isHomePage = pathname === '/';
      if (!isHomePage || window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  // Force white bg on non-home pages
  useEffect(() => {
    if (pathname !== '/') setScrolled(true);
  }, [pathname]);

  // Click outside / escape / route change handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Si el click no fue dentro del dropdown de escritorio, cerrar dropdown de escritorio
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

    const handleRouteChange = () => {
      setIsMenuOpen(false);
      setActiveDropdown(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    // importante para dispositivos táctiles
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    document.addEventListener('keydown', handleEscapeKey);
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  // Close menu when pathname changes
  useEffect(() => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  const toggleDropdown = (id) => {
    setActiveDropdown(prev => (prev === id ? null : id));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
      alert('Sesión cerrada exitosamente');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      alert('Error al cerrar sesión. Inténtelo de nuevo.');
    }
  };

  // Navegación móvil: cerramos UI y empujamos la ruta con un pequeño delay.
  // El delay evita que algunos re-renders/desmontajes prevengan la navegación en browsers móviles.
  const handleMobileNavigate = (url) => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
    // un pequeño timeout (50-120ms) soluciona muchos problemas en mobile
    setTimeout(() => {
      router.push(url);
    }, 80);
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
                  width={60}
                  height={60}
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
                  Sistemas de Seguridad Electrónicos
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="items-center hidden space-x-1 lg:flex">
            <Link
              href="/"
              className={`group relative px-3 py-2 rounded-md transition-all duration-200 ${scrolled ? 'text-gray-700 hover:text-primary' : 'text-white hover:text-white'}`}
            >
              <span className="flex items-center">
                <Home size={16} className="mr-1 transition-transform group-hover:scale-110" />
                <span>Inicio</span>
              </span>
            </Link>

            <div className="relative group" ref={dropdownRef}>
              <button
                onClick={() => toggleDropdown('servicios')}
                aria-expanded={activeDropdown === 'servicios'}
                className={`group relative px-3 py-2 rounded-md transition-all duration-200 flex items-center ${scrolled ? 'text-gray-700 hover:text-primary' : 'text-white hover:text-white'}`}
              >
                <Shield size={16} className="mr-1 transition-transform group-hover:scale-110" />
                <span>Servicios</span>
                <ChevronDown size={14} className={`ml-1 transition-transform duration-300 ${activeDropdown === 'servicios' ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown escritorio (bajo z para que el menú móvil quede por encima si ocurre) */}
              <div className={`absolute top-full left-0 w-64 mt-1 bg-white shadow-xl rounded-md overflow-hidden transition-all duration-300 border border-gray-200 z-10 ${activeDropdown === 'servicios' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
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

            <Link href="/nosotros" className={`group relative px-3 py-2 rounded-md transition-all duration-200 ${scrolled ? 'text-gray-700 hover:text-primary' : 'text-white hover:text-white'}`}>
              <span className="flex items-center">
                <Users size={16} className="mr-1 transition-transform group-hover:scale-110" />
                <span>Nosotros</span>
              </span>
            </Link>

            <Link href="/contacto" className={`group relative px-3 py-2 rounded-md transition-all duration-200 ${scrolled ? 'text-gray-700 hover:text-primary' : 'text-white hover:text-white'}`}>
              <span className="flex items-center">
                <MessageSquare size={16} className="mr-1 transition-transform group-hover:scale-110" />
                <span>Contacto</span>
              </span>
            </Link>

            <div className={`h-6 w-px mx-2 ${scrolled ? 'bg-gray-300' : 'bg-white/30'}`}></div>

            {!authLoading && (
              <Link href={user ? "/admin/panel-control" : "/login"} className={`group relative px-3 py-2 rounded-md transition-all duration-200 ${scrolled ? 'text-gray-700 hover:text-primary' : 'text-white hover:text-white'}`}>
                <span className="flex items-center">
                  <User size={16} className="mr-1 transition-transform group-hover:scale-110" />
                  <span>Cuenta</span>
                </span>
              </Link>
            )}

            {!authLoading && user && (
              <button onClick={handleLogout} className={`group relative px-3 py-2 rounded-md transition-all duration-200 ${scrolled ? 'text-red-600 hover:text-red-700' : 'text-red-300 hover:text-red-200'}`}>
                <span className="flex items-center">
                  <LogOut size={16} className="mr-1 transition-transform group-hover:scale-110" />
                  <span>Salir</span>
                </span>
              </button>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className={`lg:hidden p-2 rounded-md ${scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}
            onClick={() => setIsMenuOpen(prev => !prev)}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden mt-4 py-3 bg-white shadow-lg rounded-lg max-h-[70vh] overflow-y-auto z-50">
            <button
              onClick={() => handleMobileNavigate("/")}
              onTouchStart={() => handleMobileNavigate("/")}
              className="flex items-center px-4 py-3 text-gray-700 transition-colors rounded-md hover:bg-primary hover:text-white"
            >
              <Home size={18} className="mr-2" />
              <span>Inicio</span>
            </button>

            <div className="px-4 py-3">
              <button
                onClick={(e) => { e.stopPropagation(); toggleDropdown('mobileServicios'); }}
                onTouchStart={(e) => { e.stopPropagation(); toggleDropdown('mobileServicios'); }}
                className="flex items-center w-full text-left text-gray-700 hover:text-primary"
              >
                <Shield size={18} className="mr-2" />
                <span>Servicios de Seguridad</span>
                <ChevronDown size={16} className={`ml-auto transition-transform duration-300 ${activeDropdown === 'mobileServicios' ? 'rotate-180' : ''}`} />
              </button>

              {activeDropdown === 'mobileServicios' && (
                <div className="pl-4 mt-2 ml-6 space-y-2 border-l-2 border-primary">
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMobileNavigate("/servicios/deteccion-incendios"); }}
                    onTouchStart={(e) => { e.stopPropagation(); handleMobileNavigate("/servicios/deteccion-incendios"); }}
                    className="flex items-center py-2 text-gray-700 transition-all duration-200 group hover:text-primary hover:pl-2"
                  >
                    <Eye size={14} className="mr-2 transition-transform group-hover:scale-110" />
                    <span>Detección de Incendios</span>
                  </button>

                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMobileNavigate("/servicios/supresion-incendios"); }}
                    onTouchStart={(e) => { e.stopPropagation(); handleMobileNavigate("/servicios/supresion-incendios"); }}
                    className="flex items-center py-2 text-gray-700 transition-all duration-200 group hover:text-secondary hover:pl-2"
                  >
                    <Flame size={14} className="mr-2 transition-transform group-hover:scale-110" />
                    <span>Supresión de Incendios</span>
                  </button>

                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMobileNavigate("/servicios/sistemas-alarma"); }}
                    onTouchStart={(e) => { e.stopPropagation(); handleMobileNavigate("/servicios/sistemas-alarma"); }}
                    className="flex items-center py-2 text-gray-700 transition-all duration-200 group hover:text-warning hover:pl-2"
                  >
                    <Zap size={14} className="mr-2 transition-transform group-hover:scale-110" />
                    <span>Sistemas de Alarma</span>
                  </button>

                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMobileNavigate("/servicios/rociadores"); }}
                    onTouchStart={(e) => { e.stopPropagation(); handleMobileNavigate("/servicios/rociadores"); }}
                    className="flex items-center py-2 text-gray-700 transition-all duration-200 group hover:text-info hover:pl-2"
                  >
                    <Shield size={14} className="mr-2 transition-transform group-hover:scale-110" />
                    <span>Rociadores Automáticos</span>
                  </button>

                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMobileNavigate("/servicios/mantenimiento"); }}
                    onTouchStart={(e) => { e.stopPropagation(); handleMobileNavigate("/servicios/mantenimiento"); }}
                    className="flex items-center py-2 text-gray-700 transition-all duration-200 group hover:text-success hover:pl-2"
                  >
                    <Wrench size={14} className="mr-2 transition-transform group-hover:scale-110" />
                    <span>Mantenimiento</span>
                  </button>

                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMobileNavigate("/servicios"); }}
                    onTouchStart={(e) => { e.stopPropagation(); handleMobileNavigate("/servicios"); }}
                    className="block py-2 font-medium transition-all duration-200 text-primary hover:pl-2"
                  >
                    Ver todos los servicios
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => handleMobileNavigate("/nosotros")}
              onTouchStart={() => handleMobileNavigate("/nosotros")}
              className="flex items-center px-4 py-3 text-gray-700 transition-colors rounded-md hover:bg-primary hover:text-white"
            >
              <Users size={18} className="mr-2" />
              <span>Nosotros</span>
            </button>

            <button
              onClick={() => handleMobileNavigate("/contacto")}
              onTouchStart={() => handleMobileNavigate("/contacto")}
              className="flex items-center px-4 py-3 text-gray-700 transition-colors rounded-md hover:bg-primary hover:text-white"
            >
              <MessageSquare size={18} className="mr-2" />
              <span>Contacto</span>
            </button>

            <hr className="mx-4 my-3 border-gray-200" />

            {!authLoading && (
              <button
                onClick={() => handleMobileNavigate(user ? "/admin/panel-control" : "/login")}
                onTouchStart={() => handleMobileNavigate(user ? "/admin/panel-control" : "/login")}
                className="flex items-center px-4 py-3 text-gray-700 transition-colors rounded-md hover:bg-blue-50 hover:text-primary"
              >
                <User size={18} className="mr-2" />
                <span>{user ? "Panel de Control" : "Iniciar Sesión"}</span>
              </button>
            )}

            {!authLoading && user && (
              <button
                onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                className="flex items-center w-full px-4 py-3 text-red-600 transition-colors rounded-md hover:bg-red-50 hover:text-red-700"
              >
                <LogOut size={18} className="mr-2" />
                <span>Cerrar Sesión</span>
              </button>
            )}
          </nav>
        )}
      </div>

      <div className={`h-0.5 bg-gradient-fire transform transition-transform duration-500 ${scrolled ? 'scale-x-100' : 'scale-x-0'}`}></div>
      <hr className='border-t border-white opacity-20' />
    </header>
  );
};

export default Header;

