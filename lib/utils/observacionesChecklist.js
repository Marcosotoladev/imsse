// lib/utils/observacionesChecklist.js - Sincroniza las observaciones cargadas en
// los ítems del checklist (PlanillasAdjuntas) con el campo de texto libre
// "Observaciones Generales", sin pisar lo que el usuario haya escrito a mano.

// Recorre las planillas adjuntas y arma un mapa `clave -> línea de texto` con
// una entrada por cada ítem/unidad que tenga una observación cargada.
export function extraerObservacionesChecklist(planillasAdjuntas) {
  const mapa = new Map();

  (planillasAdjuntas || []).forEach((planilla, planillaIndex) => {
    if (planilla.tipo === 'tabular') {
      (planilla.unidades || []).forEach((unidad, unidadIndex) => {
        const texto = unidad.observacion?.trim();
        if (texto) {
          const clave = `${planillaIndex}-unidad-${unidadIndex}`;
          const etiqueta = `${planilla.titulo} - ${planilla.nombreUnidad || 'Unidad'} ${unidad.numero}`;
          mapa.set(clave, `[${etiqueta}] ${texto}`);
        }
      });
    } else {
      (planilla.items || []).forEach((item, itemIndex) => {
        const texto = item.observacion?.trim();
        if (texto) {
          const clave = `${planillaIndex}-item-${itemIndex}`;
          const etiqueta = `${planilla.titulo} - ${item.descripcion}`;
          mapa.set(clave, `[${etiqueta}] ${texto}`);
        }
      });
    }
  });

  return mapa;
}

// Combina el mapa anterior y el nuevo con el texto libre actual de "Observaciones
// Generales": actualiza in-place la línea de un ítem si su observación cambió (y la
// línea anterior sigue estando tal cual, sin que el usuario la haya tocado), agrega
// una línea nueva para observaciones recién cargadas, y quita la línea de las que
// se borraron en el checklist. Cualquier otra línea (texto escrito a mano, o una
// línea copiada que el usuario ya modificó) se deja como está.
export function sincronizarObservaciones(observacionesActuales, mapaAnterior, mapaNuevo) {
  let lineas = (observacionesActuales || '').split('\n');
  if (lineas.length === 1 && lineas[0].trim() === '') {
    lineas = [];
  }

  for (const [clave, textoNuevo] of mapaNuevo.entries()) {
    const textoAnterior = mapaAnterior.get(clave);
    if (textoAnterior === textoNuevo) continue; // sin cambios para este ítem

    if (textoAnterior) {
      const idx = lineas.indexOf(textoAnterior);
      if (idx !== -1) {
        lineas[idx] = textoNuevo;
        continue;
      }
    }

    if (!lineas.includes(textoNuevo)) {
      lineas.push(textoNuevo);
    }
  }

  for (const [clave, textoAnterior] of mapaAnterior.entries()) {
    if (!mapaNuevo.has(clave)) {
      const idx = lineas.indexOf(textoAnterior);
      if (idx !== -1) lineas.splice(idx, 1);
    }
  }

  return lineas.join('\n');
}
