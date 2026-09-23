// lib/utils/sessionHint.js
// Marca en localStorage que este dispositivo tiene una sesión iniciada.
// La home la lee antes de pintarse (script inline en app/layout.js) para mostrar
// una pantalla de carga en lugar de la landing mientras redirige al panel.

export const SESSION_HINT_KEY = 'imsse_session_hint';

export function marcarSesionActiva() {
  try {
    localStorage.setItem(SESSION_HINT_KEY, '1');
  } catch {}
}

export function limpiarSesionActiva() {
  try {
    localStorage.removeItem(SESSION_HINT_KEY);
  } catch {}
  if (typeof document !== 'undefined') {
    delete document.documentElement.dataset.sessionRedirect;
  }
}
