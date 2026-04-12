import * as FileSystem from 'expo-file-system';
import { File, Directory, Paths } from 'expo-file-system';
import { Annotation, Bookmark, Book } from '@domain/models';

const HIGHLIGHT_EMOJI: Record<string, string> = {
  yellow: '🟡',
  green: '🟢',
  blue: '🔵',
  pink: '🩷',
  orange: '🟠',
};

export const ExportService = {
  toMarkdown(book: Book, annotations: Annotation[], bookmarks: Bookmark[]): string {
    const lines: string[] = [];

    lines.push(`# Anotaciones — ${book.title}`);
    lines.push(`**Autor:** ${book.author}`);
    lines.push(`**Exportado:** ${new Date().toLocaleDateString('es')}`);
    lines.push('');

    if (annotations.length > 0) {
      lines.push('## Subrayados');
      lines.push('');

      // Group by chapter
      const byChapter = groupByChapter(annotations);
      for (const [chapter, items] of Object.entries(byChapter)) {
        if (chapter !== '_none') {
          lines.push(`### ${chapter}`);
          lines.push('');
        }
        for (const a of items) {
          const emoji = HIGHLIGHT_EMOJI[a.color] ?? '•';
          lines.push(`${emoji} > ${a.selectedText}`);
          if (a.note) {
            lines.push('');
            lines.push(`   *${a.note}*`);
          }
          lines.push('');
        }
      }
    }

    if (bookmarks.length > 0) {
      lines.push('## Marcadores');
      lines.push('');
      for (const b of bookmarks) {
        const label = b.label ?? b.chapter ?? b.position;
        lines.push(`- ${label}`);
      }
      lines.push('');
    }

    return lines.join('\n');
  },

  toPlainText(book: Book, annotations: Annotation[], bookmarks: Bookmark[]): string {
    const lines: string[] = [];

    lines.push(`ANOTACIONES — ${book.title.toUpperCase()}`);
    lines.push(`Autor: ${book.author}`);
    lines.push(`Exportado: ${new Date().toLocaleDateString('es')}`);
    lines.push('='.repeat(50));
    lines.push('');

    if (annotations.length > 0) {
      lines.push('SUBRAYADOS');
      lines.push('-'.repeat(30));
      for (const a of annotations) {
        if (a.chapter) lines.push(`[${a.chapter}]`);
        lines.push(`"${a.selectedText}"`);
        if (a.note) lines.push(`  Nota: ${a.note}`);
        lines.push('');
      }
    }

    if (bookmarks.length > 0) {
      lines.push('MARCADORES');
      lines.push('-'.repeat(30));
      for (const b of bookmarks) {
        lines.push(`- ${b.label ?? b.chapter ?? b.position}`);
      }
    }

    return lines.join('\n');
  },

  saveToExports(filename: string, content: string): string {
    const exportsDir = new Directory(Paths.document, 'exports');
    exportsDir.create({ intermediates: true, overwrite: true });
    const file = new File(exportsDir, filename);
    file.write(content);
    return file.uri;
  },
};

function groupByChapter(annotations: Annotation[]): Record<string, Annotation[]> {
  return annotations.reduce(
    (acc, a) => {
      const key = a.chapter ?? '_none';
      if (!acc[key]) acc[key] = [];
      acc[key].push(a);
      return acc;
    },
    {} as Record<string, Annotation[]>,
  );
}
