// lib/constants/plantillas.js - Constantes compartidas del constructor de Plantillas de Visita Técnica

export const GRUPOS_INSPECCION = [
  'Detección de Incendios',
  'Rociadores',
  'Sistemas de Alarma',
  'Supresión de Incendios',
  'Mantenimiento'
];

export const TIPOS_PLANTILLA = [
  { value: 'lista', label: 'Lista simple', descripcion: 'Ítems sueltos, cada uno con su propio OK / N OK / N/A.' },
  { value: 'tabular', label: 'Tabular por unidades', descripcion: 'El mismo set de columnas se repite por cada elemento numerado (ej. detectores, rociadores, sirenas).' }
];
