import { getDatabase } from '@core/database/schema';
import { Book, BookFormat, ReadingStatus } from '@domain/models';

export const bookRepository = {
  async getAll(): Promise<Book[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<BookRow>('SELECT * FROM books ORDER BY added_at DESC');
    return rows.map(toBook);
  },

  async getById(id: string): Promise<Book | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<BookRow>('SELECT * FROM books WHERE id = ?', [id]);
    return row ? toBook(row) : null;
  },

  async insert(book: Book): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO books
        (id, title, author, format, file_path, cover_path, status, reading_position, added_at, last_opened_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        book.id,
        book.title,
        book.author,
        book.format,
        book.filePath,
        book.coverPath,
        book.status,
        book.readingPosition,
        book.addedAt,
        book.lastOpenedAt,
      ],
    );
  },

  async updateStatus(id: string, status: ReadingStatus): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('UPDATE books SET status = ? WHERE id = ?', [status, id]);
  },

  async updateReadingPosition(id: string, position: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      'UPDATE books SET reading_position = ?, last_opened_at = ? WHERE id = ?',
      [position, Date.now(), id],
    );
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM books WHERE id = ?', [id]);
  },
};

interface BookRow {
  id: string;
  title: string;
  author: string;
  format: string;
  file_path: string;
  cover_path: string | null;
  status: string;
  reading_position: string | null;
  added_at: number;
  last_opened_at: number | null;
}

function toBook(row: BookRow): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    format: row.format as BookFormat,
    filePath: row.file_path,
    coverPath: row.cover_path,
    status: row.status as ReadingStatus,
    readingPosition: row.reading_position,
    addedAt: row.added_at,
    lastOpenedAt: row.last_opened_at,
  };
}
