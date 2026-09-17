'use client';

import { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Heading3,
  List,
  ListOrdered,
  IndentIncrease,
  IndentDecrease,
  Undo2,
  Redo2,
  MoreHorizontal,
} from 'lucide-react';
import { normalizeRichTextDoc, RICH_TEXT_STARTER_KIT_OPTIONS } from '../../../lib/utils/richText';

function ToolbarButton({ onClick, active, disabled, label, children }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`p-1.5 rounded transition-colors shrink-0 ${
        active ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-200'
      } disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent`}
    >
      {children}
    </button>
  );
}

function Separator() {
  return <span className="w-px h-5 mx-1 bg-gray-300 shrink-0" />;
}

// Editor de texto enriquecido (negrita, itálica, título, viñetas, lista numerada,
// sangría, deshacer/rehacer) usado en los campos que antes eran textarea simples.
// Guarda/recibe el valor como documento JSON de Tiptap; ver lib/utils/richText.js
// para el resto del contrato.
export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  minHeight = 150,
  disabled = false,
  className = '',
}) {
  const [mostrarMas, setMostrarMas] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure(RICH_TEXT_STARTER_KIT_OPTIONS),
      Placeholder.configure({ placeholder: placeholder || '' }),
    ],
    content: normalizeRichTextDoc(value),
    editable: !disabled,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'rich-text-content focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  // Sincroniza si el valor cambia desde afuera (ej: se recupera un borrador
  // autoguardado, o se cargan los datos al entrar en modo edición).
  useEffect(() => {
    if (!editor) return;
    const actual = JSON.stringify(editor.getJSON());
    const nuevo = JSON.stringify(normalizeRichTextDoc(value));
    if (actual !== nuevo) {
      editor.commands.setContent(normalizeRichTextDoc(value), false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, value]);

  useEffect(() => {
    if (editor) editor.setEditable(!disabled);
  }, [editor, disabled]);

  if (!editor) return null;

  return (
    <div
      className={`bg-white border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent ${className}`}
    >
      <div className="border-b border-gray-200 rounded-t-md bg-gray-50">
        <div className="flex items-center gap-1 px-2 py-1 overflow-x-auto">
          <ToolbarButton
            label="Negrita"
            active={editor.isActive('bold')}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold size={16} />
          </ToolbarButton>
          <ToolbarButton
            label="Itálica"
            active={editor.isActive('italic')}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic size={16} />
          </ToolbarButton>
          <ToolbarButton
            label="Título"
            active={editor.isActive('heading', { level: 3 })}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            <Heading3 size={16} />
          </ToolbarButton>
          <ToolbarButton
            label="Viñetas"
            active={editor.isActive('bulletList')}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List size={16} />
          </ToolbarButton>
          <Separator />
          <ToolbarButton
            label={mostrarMas ? 'Ocultar más opciones' : 'Más opciones'}
            active={mostrarMas}
            disabled={disabled}
            onClick={() => setMostrarMas((v) => !v)}
          >
            <MoreHorizontal size={16} />
          </ToolbarButton>
        </div>
        {mostrarMas && (
          <div className="flex items-center gap-1 px-2 py-1 overflow-x-auto border-t border-gray-200">
            <ToolbarButton
              label="Lista numerada"
              active={editor.isActive('orderedList')}
              disabled={disabled}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered size={16} />
            </ToolbarButton>
            <ToolbarButton
              label="Aumentar sangría"
              disabled={disabled || !editor.can().sinkListItem('listItem')}
              onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
            >
              <IndentIncrease size={16} />
            </ToolbarButton>
            <ToolbarButton
              label="Disminuir sangría"
              disabled={disabled || !editor.can().liftListItem('listItem')}
              onClick={() => editor.chain().focus().liftListItem('listItem').run()}
            >
              <IndentDecrease size={16} />
            </ToolbarButton>
            <Separator />
            <ToolbarButton
              label="Deshacer"
              disabled={disabled || !editor.can().undo()}
              onClick={() => editor.chain().focus().undo().run()}
            >
              <Undo2 size={16} />
            </ToolbarButton>
            <ToolbarButton
              label="Rehacer"
              disabled={disabled || !editor.can().redo()}
              onClick={() => editor.chain().focus().redo().run()}
            >
              <Redo2 size={16} />
            </ToolbarButton>
          </div>
        )}
      </div>
      <EditorContent
        editor={editor}
        style={{ minHeight }}
        className="max-h-[500px] overflow-y-auto px-4 py-3"
      />
    </div>
  );
}
