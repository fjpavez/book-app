import { getDatabase } from '@core/database/schema';
import { Collection } from '@domain/models';

export const collectionRepository = {
  async getAll(): Promise<Collection[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<Collection>(
      'SELECT id, name, created_at as createdAt FROM collections ORDER BY created_at ASC',
    );
    return rows;
  },

  async getBookIds(collectionId: string): Promise<string[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{ book_id: string }>(
      'SELECT book_id FROM collection_books WHERE collection_id = ?',
      [collectionId],
    );
    return rows.map((r) => r.book_id);
  },

  async insert(collection: Collection): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      'INSERT INTO collections (id, name, created_at) VALUES (?, ?, ?)',
      [collection.id, collection.name, collection.createdAt],
    );
  },

  async rename(id: string, name: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('UPDATE collections SET name = ? WHERE id = ?', [name, id]);
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM collections WHERE id = ?', [id]);
  },

  async addBook(collectionId: string, bookId: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      'INSERT OR IGNORE INTO collection_books (collection_id, book_id) VALUES (?, ?)',
      [collectionId, bookId],
    );
  },

  async removeBook(collectionId: string, bookId: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      'DELETE FROM collection_books WHERE collection_id = ? AND book_id = ?',
      [collectionId, bookId],
    );
  },
};
