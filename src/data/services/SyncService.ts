import { annotationRepository } from '@data/repositories/annotationRepository';
import { bookmarkRepository } from '@data/repositories/bookmarkRepository';
import { bookRepository } from '@data/repositories/bookRepository';
import { Annotation, Bookmark, Book, ReadingStatus } from '@domain/models';
import { ReaderSettings } from '@core/store/readerSlice';

const SYNC_VERSION = 1;

export interface SyncPayload {
  version: number;
  exportedAt: number;
  books: Array<Pick<Book, 'id' | 'title' | 'author' | 'status' | 'readingPosition'>>;
  annotations: Annotation[];
  bookmarks: Bookmark[];
  settings: ReaderSettings;
}

export const SyncService = {
  async export(settings: ReaderSettings): Promise<string> {
    const [books, annotations, bookmarks] = await Promise.all([
      bookRepository.getAll(),
      annotationRepository.getAll(),
      bookmarkRepository.getAll(),
    ]);

    const payload: SyncPayload = {
      version: SYNC_VERSION,
      exportedAt: Date.now(),
      books: books.map((b) => ({
        id: b.id,
        title: b.title,
        author: b.author,
        status: b.status,
        readingPosition: b.readingPosition,
      })),
      annotations,
      bookmarks,
      settings,
    };

    return JSON.stringify(payload, null, 2);
  },

  parse(json: string): SyncPayload {
    const payload = JSON.parse(json) as SyncPayload;
    if (!payload.version || !payload.exportedAt) {
      throw new Error('Archivo de sincronización inválido.');
    }
    return payload;
  },

  async apply(payload: SyncPayload): Promise<{ books: number; annotations: number; bookmarks: number }> {
    let booksUpdated = 0;
    let annotationsAdded = 0;
    let bookmarksAdded = 0;

    // Update reading positions and status for books we already have
    for (const pb of payload.books) {
      const existing = await bookRepository.getById(pb.id);
      if (!existing) continue;
      if (pb.readingPosition && pb.readingPosition !== existing.readingPosition) {
        await bookRepository.updateReadingPosition(pb.id, pb.readingPosition);
        booksUpdated++;
      }
      if (pb.status !== existing.status) {
        await bookRepository.updateStatus(pb.id, pb.status as ReadingStatus);
      }
    }

    // Merge annotations — insert only those not already present
    const existingAnnotations = await annotationRepository.getAll();
    const existingAnnotationIds = new Set(existingAnnotations.map((a) => a.id));
    for (const a of payload.annotations) {
      if (!existingAnnotationIds.has(a.id)) {
        await annotationRepository.insert(a);
        annotationsAdded++;
      }
    }

    // Merge bookmarks — insert only those not already present
    const existingBookmarks = await bookmarkRepository.getAll();
    const existingBookmarkIds = new Set(existingBookmarks.map((b) => b.id));
    for (const b of payload.bookmarks) {
      if (!existingBookmarkIds.has(b.id)) {
        await bookmarkRepository.insert(b);
        bookmarksAdded++;
      }
    }

    return { books: booksUpdated, annotations: annotationsAdded, bookmarks: bookmarksAdded };
  },
};
