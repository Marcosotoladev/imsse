import { StyleSheet, Text, View } from '@react-pdf/renderer';
import { normalizeRichTextDoc, isRichTextEmpty } from '../../../lib/utils/richText';

const s = StyleSheet.create({
  block: { marginBottom: 4 },
  bold: { fontWeight: 700 },
  italic: { fontStyle: 'italic' },
  heading: { fontWeight: 700, fontSize: 11, marginTop: 4, marginBottom: 3 },
  list: { marginBottom: 4 },
  nestedList: { marginLeft: 12, marginBottom: 0 },
  listItem: { flexDirection: 'row', marginBottom: 2 },
  bullet: { width: 14 },
  listItemContent: { flex: 1 },
});

function Inline({ nodes }) {
  return (nodes || []).map((nodo, i) => {
    if (nodo.type === 'hardBreak') return '\n';
    if (nodo.type !== 'text') return null;
    const marks = nodo.marks || [];
    const negrita = marks.some((m) => m.type === 'bold');
    const italica = marks.some((m) => m.type === 'italic');
    if (!negrita && !italica) return nodo.text;
    return (
      <Text key={i} style={[negrita && s.bold, italica && s.italic]}>
        {nodo.text}
      </Text>
    );
  });
}

// Renderiza en el PDF (react-pdf) el mismo documento de Tiptap que se edita/muestra
// en pantalla. Acepta también el formato legacy (string plano). `textStyle` permite
// heredar la tipografía/tamaño que ya usa cada PDF para ese bloque de texto.
export default function RichTextPdf({ content, textStyle, emptyText = '' }) {
  if (isRichTextEmpty(content)) {
    return emptyText ? <Text style={textStyle}>{emptyText}</Text> : null;
  }

  const renderBlock = (block, key, depth) => {
    if (block.type === 'heading') {
      return (
        <Text key={key} style={[textStyle, s.heading]}>
          <Inline nodes={block.content} />
        </Text>
      );
    }

    if (block.type === 'bulletList' || block.type === 'orderedList') {
      const start = block.attrs?.start || 1;
      const getMarca = (j) => (block.type === 'orderedList' ? `${start + j}.` : '•');
      return (
        <View key={key} style={depth > 0 ? [s.list, s.nestedList] : s.list}>
          {(block.content || []).map((li, j) => (
            <View key={j} style={s.listItem}>
              <Text style={[textStyle, s.bullet]}>{getMarca(j)}</Text>
              <View style={s.listItemContent}>
                {(li.content || []).map((child, k) => renderBlock(child, k, depth + 1))}
              </View>
            </View>
          ))}
        </View>
      );
    }

    // Párrafo (default). Un párrafo vacío (doble enter) deja el espacio en blanco.
    const tieneContenido = (block.content || []).length > 0;
    return (
      <Text key={key} style={[textStyle, s.block]}>
        {tieneContenido ? <Inline nodes={block.content} /> : ' '}
      </Text>
    );
  };

  const doc = normalizeRichTextDoc(content);

  return (
    <View>
      {(doc.content || []).map((block, i) => renderBlock(block, i, 0))}
    </View>
  );
}
