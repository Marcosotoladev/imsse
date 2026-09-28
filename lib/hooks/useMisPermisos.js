// lib/hooks/useMisPermisos.js - Permisos del usuario logueado según la grilla de permisos por rol.
// Solo decide qué se muestra (menú, botones Nuevo/Editar/Eliminar): el servidor los vuelve a validar.
'use client';

import { useState, useEffect, useCallback } from 'react';
import { auth } from '../firebase';
import apiService from '../services/apiService';
import { puedeSobre } from '../permisosRoles';

const CLAVE_LOCAL = 'imsse_mis_permisos';
const promesas = new Map(); // uid -> Promise<{ rol, mio }>

function leerLocal(uid) {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_LOCAL) || 'null');
    return guardado?.uid === uid ? guardado.datos : null;
  } catch {
    return null;
  }
}

function guardarLocal(uid, datos) {
  try {
    localStorage.setItem(CLAVE_LOCAL, JSON.stringify({ uid, datos }));
  } catch {
    // sin almacenamiento local: no pasa nada, solo no habrá respaldo offline
  }
}

// { rol, mio } del usuario actual. Una sola consulta por sesión; sin conexión usa la última guardada.
// Nunca rechaza.
export function obtenerMisPermisos({ forzar = false } = {}) {
  const uid = auth.currentUser?.uid;
  if (!uid) return Promise.resolve(null);

  if (forzar || !promesas.has(uid)) {
    promesas.set(uid, apiService.obtenerPermisosRoles()
      .then(({ rol, mio }) => {
        const datos = { rol, mio };
        guardarLocal(uid, datos);
        return datos;
      })
      .catch(() => {
        // Sin conexión: la última copia guardada; si no hay, "desconocido" (se muestra todo y
        // decide el servidor), para no bloquear a un técnico que trabaja offline.
        promesas.delete(uid);
        return leerLocal(uid) || { rol: null, mio: {}, desconocido: true };
      }));
  }
  return promesas.get(uid);
}

// Función pura para usar con los datos ya obtenidos (null = todavía no se sabe: no mostrar).
// Con `doc`: ¿puede sobre ESE documento? Sin `doc`: ¿puede sobre alguno? (para menú y páginas;
// "Solo propios" cuenta como sí).
export function puedeCon(datos, tipo, accion, doc) {
  if (!datos) return false;
  if (datos.rol === 'admin' || datos.desconocido) return true;
  const permiso = datos.mio?.[tipo];
  if (!permiso) return false;
  if (doc === undefined && accion !== 'crear') return permiso[accion] !== 'no';
  return puedeSobre(permiso, accion, doc, auth.currentUser?.uid);
}

export function useMisPermisos() {
  const [datos, setDatos] = useState(null);

  useEffect(() => {
    let activo = true;
    const cargar = () => obtenerMisPermisos()
      .then((d) => { if (activo && d) setDatos(d); });

    if (auth.currentUser) {
      cargar();
      return () => { activo = false; };
    }
    const unsubscribe = auth.onAuthStateChanged((u) => { if (u) cargar(); });
    return () => { activo = false; unsubscribe(); };
  }, []);

  const puede = useCallback((tipo, accion, doc) => puedeCon(datos, tipo, accion, doc), [datos]);

  return { puede, cargando: !datos, rol: datos?.rol };
}
