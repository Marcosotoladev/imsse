// lib/hooks/useBorrador.js - Autoguardado local (debounced) de un formulario en
// progreso. No confundir con la cola de sincronización (`offlineApiService`): esto
// nunca se sube al servidor, es puramente una red de seguridad para no perder el
// checklist/campos/firmas si se cierra la app antes de tocar "Guardar". Se limpia
// llamando a `localDB.eliminarBorrador(clave)` una vez que el submit tuvo éxito.
import { useEffect, useRef } from 'react';
import localDB from '../db/localDB';

const AUTOGUARDADO_DELAY_MS = 2500;

// `clave`: identificador determinístico del formulario (ver los 4 formularios de
// OT/VT para el formato usado). `datos`: snapshot serializable del estado a guardar.
// `tieneContenido(datos)`: opcional, evita crear un borrador vacío apenas se abre el
// formulario sin haber tocado nada todavía.
export function useBorrador(clave, datos, { enabled = true, tieneContenido } = {}) {
  const timeoutRef = useRef(null);
  const datosSerializados = JSON.stringify(datos);

  useEffect(() => {
    if (!enabled || !clave) return undefined;
    if (tieneContenido && !tieneContenido(datos)) return undefined;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      localDB.guardarBorrador(clave, datos).catch((error) => {
        console.error('Error al autoguardar el borrador:', error);
      });
    }, AUTOGUARDADO_DELAY_MS);

    return () => clearTimeout(timeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave, enabled, datosSerializados]);
}
