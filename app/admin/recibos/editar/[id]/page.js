// app/admin/recibos/editar/[id]/page.jsx - Editar Recibo IMSSE (MIGRADO A API)
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, LogOut, Save, Download, RefreshCw, Eye } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../../lib/firebase';
import apiService from '../../../../lib/services/apiService';
import { use } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ReciboPDF from '../../../../components/pdf/ReciboPDF';
import SignatureCanvas from 'react-signature-canvas';

// Función para convertir números a letras
const numeroALetras = (numero) => {
  const unidades = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  const decenas = ['', 'diez', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  const especiales = {
    11: 'once', 12: 'doce', 13: 'trece', 14: 'catorce', 15: 'quince',
    16: 'dieciséis', 17: 'diecisiete', 18: 'dieciocho', 19: 'diecinueve'
  };

  const miles = ['', 'mil', 'millones'];

  function convertirGrupo(n) {
    if (n === 0) return '';
    if (n < 10) return unidades[n];
    if (n >= 11 && n <= 19) return especiales[n];
    if (n < 100) {
      const u = n % 10;
      const d = Math.floor(n / 10);
      return decenas[d] + (u > 0 ? ' y ' + unidades[u] : '');
    }
    if (n === 100) return 'cien';
    if (n < 1000) {
      const c = Math.floor(n / 100);
      const resto = n % 100;
      return (c === 1 ? 'ciento' : unidades[c] + 'cientos') + (resto > 0 ? ' ' + convertirGrupo(resto) : '');
    }
    return '';
  }

  const entero = Math.floor(numero);
  const decimal = Math.round((numero - entero) * 100);

  let resultado = '';
  let grupo = 0;
  let temp = entero;

  while (temp > 0) {
    const resto = temp % 1000;
    if (resto > 0) {
      resultado = convertirGrupo(resto) + ' ' + miles[grupo] + ' ' + resultado;
    }
    temp = Math.floor(temp / 1000);
    grupo++;
  }

  resultado = resultado.trim() + ' pesos';
  if (decimal > 0) {
    resultado += ' con ' + decimal + '/100';
  }

  return resultado.charAt(0).toUpperCase() + resultado.slice(1);
};

export default function EditarRecibo({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mostrarCanvas, setMostrarCanvas] = useState(false);
  const [mostrarPDF, setMostrarPDF] = useState(false);
  const sigCanvas = useRef({});

  // Estado para el modal de concepto
  const [modalConcepto, setModalConcepto] = useState({
    isOpen: false,
    value: ''
  });

  // Estado del formulario
  const [recibo, setRecibo] = useState({
    numero: '',
    fecha: '',
    recibiDe: '',
    monto: '',
    cantidadLetras: '',
    concepto: '',
    firma: null,
    aclaracion: ''
  });

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        try {
          // ✅ USAR apiService
          const reciboData = await apiService.obtenerReciboPorId(id);
          setRecibo({
            numero: reciboData.numero || '',
            fecha: reciboData.fecha || '',
            recibiDe: reciboData.recibiDe || '',
            monto: reciboData.monto || '',
            cantidadLetras: reciboData.cantidadLetras || '',
            concepto: reciboData.concepto || '',
            firma: reciboData.firma || null,
            aclaracion: reciboData.aclaracion || ''
          });
          setLoading(false);
        } catch (error) {
          console.error('Error al cargar recibo IMSSE:', error);
          alert('Error al cargar los datos del recibo.');
          router.push('/admin/recibos');
        }
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [id, router]);

  // Función para abrir el modal de concepto
  const abrirModalConcepto = () => {
    setModalConcepto({
      isOpen: true,
      value: recibo.concepto || ''
    });
  };

  // Función para guardar y cerrar el modal
  const guardarConcepto = () => {
    setRecibo({ ...recibo, concepto: modalConcepto.value });
    setModalConcepto({
      isOpen: false,
      value: ''
    });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/admin');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleMontoChange = (e) => {
    const valor = e.target.value;
    setRecibo({
      ...recibo,
      monto: valor,
      cantidadLetras: valor ? numeroALetras(parseFloat(valor)) : ''
    });
  };

  const clearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
  };

  const saveSignature = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      try {
        const firmaData = sigCanvas.current.toDataURL('image/png');
        setRecibo({ ...recibo, firma: firmaData });
        setMostrarCanvas(false);
        alert('Firma guardada');
      } catch (error) {
        console.error('Error al guardar firma:', error);
        alert('Error al guardar la firma');
      }
    } else {
      alert('Por favor, firme antes de guardar');
    }
  };

  const handleGuardarRecibo = async () => {
    setGuardando(true);
    try {
      const reciboData = {
        ...recibo,
        monto: parseFloat(recibo.monto),
        fechaModificacion: new Date()
      };

      // ✅ USAR apiService
      await apiService.actualizarRecibo(id, reciboData);
      alert('Recibo IMSSE actualizado exitosamente');
      router.push('/admin/recibos');
    } catch (error) {
      console.error('Error al actualizar el recibo IMSSE:', error);
      alert('Error al actualizar el recibo. Inténtelo de nuevo más tarde.');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4">Cargando recibo IMSSE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header IMSSE */}
      <header className="text-white shadow bg-primary">
        <div className="container flex items-center justify-between px-4 py-4 mx-auto">
          <div className="flex items-center">
            <img 
              src="/logo/imsse-logo.png" 
              alt="IMSSE Logo" 
              className="w-8 h-8 mr-3"
            />
            <h1 className="text-xl font-bold font-montserrat">IMSSE - Panel de Administración</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center p-2 text-white rounded-md hover:bg-red-700"
            >
              <LogOut size={18} className="mr-2" /> Salir
            </button>
          </div>
        </div>
      </header>

      <div className="container px-4 py-8 mx-auto">
        <div className="flex flex-wrap items-center justify-between mb-8">
          <div className="flex items-center mb-4">
            <Link
              href="/admin/panel-control"
              className="flex items-center mr-4 text-primary hover:underline"
            >
              <Home size={16} className="mr-1" /> Panel de Control
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <Link
              href="/admin/recibos"
              className="flex items-center mr-4 text-primary hover:underline"
            >
              Recibos
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-gray-700">Editar Recibo</span>
          </div>

          <div className="flex mb-4 space-x-2">
            <Link
              href={`/admin/recibos/${id}`}
              className="flex items-center px-4 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <Eye size={18} className="mr-2" /> Ver
            </Link>
            <button
              onClick={() => setMostrarPDF(true)}
              className="flex items-center px-4 py-2 text-white transition-colors bg-purple-600 rounded-md hover:bg-purple-700"
            >
              <Download size={18} className="mr-2" /> PDF
            </button>
            <button
              onClick={handleGuardarRecibo}
              disabled={guardando}
              className="flex items-center px-4 py-2 text-white transition-colors bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              <Save size={18} className="mr-2" />
              {guardando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            
            {/* PDF bajo demanda */}
            {mostrarPDF && (
              <div style={{position: 'absolute', left: '-9999px'}}>
                <PDFDownloadLink
                  document={<ReciboPDF recibo={recibo} />}
                  fileName={`${recibo.numero}.pdf`}
                >
                  {({ blob, url, loading, error }) => {
                    if (url) {
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `${recibo.numero}.pdf`;
                      link.click();
                      setMostrarPDF(false);
                    }
                    return null;
                  }}
                </PDFDownloadLink>
              </div>
            )}
          </div>
        </div>

        <h2 className="mb-6 text-2xl font-bold font-montserrat text-primary">
          Editar Recibo IMSSE {recibo.numero}
        </h2>

        <div className="grid grid-cols-1 gap-6">
          {/* Información del recibo */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Información del Recibo</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Número</label>
                <input
                  type="text"
                  value={recibo.numero}
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Fecha</label>
                <input
                  type="date"
                  value={recibo.fecha}
                  onChange={(e) => setRecibo({ ...recibo, fecha: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Datos del recibo */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Datos del Recibo</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Recibí de</label>
                <input
                  type="text"
                  value={recibo.recibiDe}
                  onChange={(e) => setRecibo({ ...recibo, recibiDe: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Nombre completo o razón social del cliente"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Monto ($)</label>
                  <input
                    type="number"
                    value={recibo.monto}
                    onChange={handleMontoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="0.00"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Cantidad en letras</label>
                  <input
                    type="text"
                    value={recibo.cantidadLetras}
                    onChange={(e) => setRecibo({ ...recibo, cantidadLetras: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Se genera automáticamente"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">En concepto de</label>
                
                {/* Vista móvil - Botón que abre modal */}
                <div className="md:hidden">
                  <div 
                    onClick={abrirModalConcepto}
                    className="min-h-[80px] p-3 border border-gray-300 rounded-md bg-gray-50 cursor-pointer flex items-center justify-between transition-colors hover:bg-gray-100"
                  >
                    <span className={`text-sm flex-1 ${recibo.concepto ? 'text-gray-800' : 'text-gray-400'}`}>
                      {recibo.concepto || 'Toca para editar concepto de servicios IMSSE'}
                    </span>
                    <svg className="w-5 h-5 ml-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  {/* Preview del texto si existe */}
                  {recibo.concepto && (
                    <div className="mt-2 text-xs text-gray-500">
                      {recibo.concepto.length > 60 
                        ? `${recibo.concepto.substring(0, 60)}...` 
                        : recibo.concepto
                      }
                    </div>
                  )}
                </div>
                
                {/* Vista desktop - Textarea normal */}
                <div className="hidden md:block">
                  <textarea
                    value={recibo.concepto}
                    onChange={(e) => setRecibo({ ...recibo, concepto: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[80px] resize-y"
                    placeholder="Ej: Instalación sistema contra incendios, mantenimiento preventivo, certificación anual..."
                    rows={3}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Describe los servicios de protección contra incendios realizados
                </p>
              </div>
            </div>
          </div>

          {/* Firma Digital */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Firma del Cliente</h3>

            {recibo.firma && !mostrarCanvas ? (
              <div className="text-center">
                <img
                  src={recibo.firma}
                  alt="Firma"
                  className="mx-auto mb-4 border border-gray-300 rounded"
                  style={{ maxWidth: '300px', height: '150px', objectFit: 'contain' }}
                />
                <button
                  onClick={() => {
                    setRecibo({ ...recibo, firma: null });
                    setMostrarCanvas(true);
                  }}
                  type="button"
                  className="px-4 py-2 text-white transition-colors bg-red-500 rounded-md hover:bg-red-600"
                >
                  Cambiar firma
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-4 overflow-hidden border-2 border-gray-300 rounded-md" style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
                  <SignatureCanvas
                    ref={sigCanvas}
                    canvasProps={{
                      width: 500,
                      height: 200,
                      className: 'signature-canvas',
                      style: { width: '100%', height: 'auto' }
                    }}
                    backgroundColor="#f9f9f9"
                  />
                </div>

                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => {
                      if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
                        try {
                          const firmaData = sigCanvas.current.toDataURL('image/png');
                          setRecibo({ ...recibo, firma: firmaData });
                          setMostrarCanvas(false);
                          alert('Firma guardada');
                        } catch (error) {
                          console.error('Error al guardar firma:', error);
                          alert('Error al guardar la firma');
                        }
                      } else {
                        alert('Por favor, firme antes de guardar');
                      }
                    }}
                    type="button"
                    className="flex items-center px-4 py-2 text-white transition-colors bg-green-500 rounded-md hover:bg-green-600"
                  >
                    <Save size={18} className="mr-2" /> Guardar firma
                  </button>
                  <button
                    onClick={() => {
                      if (sigCanvas.current) {
                        sigCanvas.current.clear();
                      }
                    }}
                    type="button"
                    className="flex items-center px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    <RefreshCw size={18} className="mr-2" /> Limpiar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Campo de aclaración */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Aclaración de Firma</h3>
            <input
              type="text"
              value={recibo.aclaracion}
              onChange={(e) => setRecibo({ ...recibo, aclaracion: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Nombre y apellido completo de quien firma"
            />
          </div>

          {/* Información IMSSE */}
          <div className="p-6 text-center bg-white border border-red-200 rounded-lg shadow-md">
            <div className="text-sm text-gray-600">
              <p className="font-semibold text-primary">IMSSE INGENIERÍA S.A.S</p>
              <p>Instalación y Mantenimiento de Sistemas de Seguridad Electrónicos</p>
              <p>Especialistas en sistemas de protección contra incendios desde 1994</p>
              <p className="mt-2">
                <span className="font-medium">Certificaciones:</span> Notifier | Mircom | Inim | Secutron | Bosch
              </p>
              <p className="mt-2">
                📧 info@imsseingenieria.com | 🌐 www.imsseingenieria.com | 📍 Córdoba, Argentina
              </p>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => router.push('/admin/recibos')}
              className="px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardarRecibo}
              disabled={guardando}
              className="flex items-center px-4 py-2 text-white transition-colors bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              <Save size={18} className="mr-2" />
              {guardando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal para editar concepto */}
      {modalConcepto.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex flex-col w-full h-full bg-white md:w-11/12 md:h-5/6 md:rounded-lg md:max-w-4xl">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 md:rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800">Editar concepto - Servicios IMSSE</h3>
              <button
                onClick={() => setModalConcepto({ isOpen: false, value: '' })}
                className="p-2 text-gray-500 transition-colors hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Contenido del modal */}
            <div className="flex flex-col flex-1 p-4 bg-white md:rounded-b-lg">
              <textarea
                value={modalConcepto.value}
                onChange={(e) => setModalConcepto({ ...modalConcepto, value: e.target.value })}
                className="flex-1 w-full p-4 text-base border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Edita el concepto de servicios IMSSE realizados...

Ejemplos:
• Instalación sistema detección de humo edificio oficinas
• Mantenimiento preventivo anual equipos Notifier
• Certificación sistema contra incendios según normativa
• Reparación central de incendios Mircom
• Provisión e instalación detectores Bosch"
                autoFocus
                style={{ minHeight: '300px' }}
              />
              
              {/* Contador de caracteres */}
              <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                <span>{modalConcepto.value.length} caracteres</span>
                <span className="text-xs text-gray-400">Tip: Especifica el tipo de servicio IMSSE realizado</span>
              </div>
              
              {/* Botones del modal */}
              <div className="flex justify-end mt-4 space-x-3">
                <button
                  onClick={() => setModalConcepto({ isOpen: false, value: '' })}
                  className="px-6 py-2 text-gray-700 transition-colors border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarConcepto}
                  className="px-6 py-2 text-white transition-colors rounded-md bg-primary hover:bg-red-700"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}