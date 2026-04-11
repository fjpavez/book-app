import { getDatabase } from '@core/database/schema';
import { Bookmark } from '@domain/models';

export const bookmarkRepository = {
  async getByBookId(bookId: string): Promise<Bookmark[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<BookmarkRow>(
      'SELECT * FROM bookmarks WHERE book_id = ? ORDER BY created_at ASC',
      [bookId],
    );
    return rows.map(toBookmark);
  },

  async insert(bookmark: Bookmark): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO bookmarks (id, book_id, position, label, chapter, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        bookmark.id,
        bookmark.bookId,
        bookmark.position,
        bookmark.label,
        bookmark.chapter,
        bookmark.createdAt,
      ],
    );
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM bookmarks WHERE id = ?', [id]);
  },

  async existsAtPosition(bookId: string, position: string): Promise<boolean> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM bookmarks WHERE book_id = ? AND position = ?',
      [bookId, position],
    );
    return (row?.count ?? 0) > 0;
  },
};

interface BookmarkRow {
  id: string;
  book_id: string;
  position: string;
  label: string | null;
  chapter: string | null;
  created_at: number;
}

function toBookmark(row: BookmarkRow): Bookmark {
  return {
    id: row.id,
    bookId: row.book_id,
    position: row.position,
    label: row.label,
    chapter: row.chapter,
    createdAt: row.created_at,
  };
}
