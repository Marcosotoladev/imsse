// lib/utils/richText.js - Utilidades para los campos de texto enriquecido (Tiptap)
// usados en Orden de Trabajo, Visita Técnica, Presupuestos, Remitos y Estados de Cuenta.
//
// El valor de estos campos puede ser:
//  - null/undefined/'' -> vacío
//  - un string          -> dato legacy en texto plano (cargado antes de este cambio)
//  - un objeto {type:'doc', ...} -> documento de Tiptap
// Todas las funciones de acá aceptan cualquiera de los tres formatos.

// Extensiones habilitadas del editor (se comparten entre el editor, el visor y el PDF
// para que los tres entiendan exactamente el mismo esquema de nodos).
export const RICH_TEXT_STARTER_KIT_OPTIONS = {
  blockquote: false,
  code: false,
  codeBlock: false,
  horizontalRule: false,
  strike: false,
  heading: { levels: [3] },
  link: false,
  underline: false,
};

// Convierte un string plano (dato legacy) en un documento Tiptap: un párrafo por línea.
export function stringToRichTextDoc(text) {
  const lineas = String(text || '').split('\n');
  return {
    type: 'doc',
    content: lineas.map((linea) => ({
      type: 'paragraph',
      content: linea ? [{ type: 'text', text: linea }] : [],
    })),
  };
}

// Normaliza cualquier valor guardado a un documento de Tiptap.
export function normalizeRichTextDoc(value) {
  if (!value) return stringToRichTextDoc('');
  if (typeof value === 'string') return stringToRichTextDoc(value);
  if (typeof value === 'object' && value.type === 'doc') return value;
  return stringToRichTextDoc('');
}

function inlineToText(nodo) {
  if (!nodo) return '';
  if (nodo.type === 'text') return nodo.text || '';
  if (nodo.type === 'hardBreak') return '\n';
  return '';
}

function nodeToLines(nodo) {
  if (!nodo) return [];
  switch (nodo.type) {
    case 'paragraph':
    case 'heading':
      return [(nodo.content || []).map(inlineToText).join('')];
    case 'listItem': {
      const lineas = (nodo.content || []).flatMap(nodeToLines);
      return lineas.map((linea, i) => (i === 0 ? `• ${linea}` : `  ${linea}`));
    }
    case 'doc':
    case 'bulletList':
      return (nodo.content || []).flatMap(nodeToLines);
    default:
      return (nodo.content || []).flatMap(nodeToLines);
  }
}

// Extrae texto plano de un valor (string legacy o doc de Tiptap). Sirve para
// buscadores, previews en listados y validaciones de campo requerido.
export function richTextToPlainText(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value !== 'object') return '';
  return nodeToLines(value).join('\n').trim();
}

export function isRichTextEmpty(value) {
  return richTextToPlainText(value).trim() === '';
}
