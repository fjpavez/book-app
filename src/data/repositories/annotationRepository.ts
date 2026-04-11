import { getDatabase } from '@core/database/schema';
import { Annotation, HighlightColor } from '@domain/models';

export const annotationRepository = {
  async getByBookId(bookId: string): Promise<Annotation[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<AnnotationRow>(
      'SELECT * FROM annotations WHERE book_id = ? ORDER BY created_at ASC',
      [bookId],
    );
    return rows.map(toAnnotation);
  },

  async insert(annotation: Annotation): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO annotations
        (id, book_id, position, selected_text, note, color, chapter, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        annotation.id,
        annotation.bookId,
        annotation.position,
        annotation.selectedText,
        annotation.note,
        annotation.color,
        annotation.chapter,
        annotation.createdAt,
        annotation.updatedAt,
      ],
    );
  },

  async updateNote(id: string, note: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      'UPDATE annotations SET note = ?, updated_at = ? WHERE id = ?',
      [note, Date.now(), id],
    );
  },

  async updateColor(id: string, color: HighlightColor): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      'UPDATE annotations SET color = ?, updated_at = ? WHERE id = ?',
      [color, Date.now(), id],
    );
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM annotations WHERE id = ?', [id]);
  },

  async searchAll(query: string): Promise<Annotation[]> {
    const db = await getDatabase();
    const like = `%${query}%`;
    const rows = await db.getAllAsync<AnnotationRow>(
      `SELECT * FROM annotations
       WHERE selected_text LIKE ? OR note LIKE ?
       ORDER BY created_at DESC`,
      [like, like],
    );
    return rows.map(toAnnotation);
  },
};

interface AnnotationRow {
  id: string;
  book_id: string;
  position: string;
  selected_text: string;
  note: string | null;
  color: string;
  chapter: string | null;
  created_at: number;
  updated_at: number;
}

function toAnnotation(row: AnnotationRow): Annotation {
  return {
    id: row.id,
    bookId: row.book_id,
    position: row.position,
    selectedText: row.selected_text,
    note: row.note,
    color: row.color as HighlightColor,
    chapter: row.chapter,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
