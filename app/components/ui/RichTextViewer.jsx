'use client';

import { useMemo } from 'react';
import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import { normalizeRichTextDoc, isRichTextEmpty, RICH_TEXT_STARTER_KIT_OPTIONS } from '../../../lib/utils/richText';

const extensions = [StarterKit.configure(RICH_TEXT_STARTER_KIT_OPTIONS)];

// Muestra en modo lectura el contenido de un campo de texto enriquecido (string
// legacy o documento de Tiptap), con el mismo aspecto visual que el editor.
export default function RichTextViewer({ value, emptyText = '', className = '' }) {
  const html = useMemo(() => {
    if (isRichTextEmpty(value)) return null;
    return generateHTML(normalizeRichTextDoc(value), extensions);
  }, [value]);

  if (!html) {
    return emptyText ? (
      <p className={`text-sm text-gray-500 italic ${className}`}>{emptyText}</p>
    ) : null;
  }

  return (
    <div
      className={`rich-text-content ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
