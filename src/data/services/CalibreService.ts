import { File, Paths, Directory } from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';

export interface CalibreConnection {
  url: string;       // e.g. http://192.168.1.100:8080
  username: string;
  password: string;
  libraryId: string;
}

export interface CalibreBook {
  id: number;
  title: string;
  authors: string[];
  formats: Array<'EPUB' | 'PDF'>;
  coverUrl: string;
}

interface BooksResponse {
  total_num: number;
  book_ids: number[];
  data: Record<string, {
    title: string;
    authors: string[];
    formats: string[];
  }>;
}

interface LibraryInfoResponse {
  library_id: string;
  library_name: string;
}

const CONN_KEY = 'calibre_connection';
const SUPPORTED_FORMATS = new Set(['EPUB', 'PDF']);

export const CalibreService = {
  buildHeaders(conn: CalibreConnection): Record<string, string> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (conn.username) {
      headers['Authorization'] = `Basic ${btoa(`${conn.username}:${conn.password}`)}`;
    }
    return headers;
  },

  /** Verify the server is reachable and return its library_id. */
  async testConnection(conn: Omit<CalibreConnection, 'libraryId'>): Promise<string> {
    const res = await fetch(`${conn.url}/ajax/library_info`, {
      headers: this.buildHeaders({ ...conn, libraryId: '' }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} — verifica la URL y credenciales.`);
    const data = (await res.json()) as LibraryInfoResponse;
    return data.library_id ?? 'Calibre_Library';
  },

  async getBooks(
    conn: CalibreConnection,
    offset = 0,
    num = 50,
  ): Promise<{ books: CalibreBook[]; total: number }> {
    const qs = new URLSearchParams({
      library_id: conn.libraryId,
      num: String(num),
      offset: String(offset),
      sort: 'title',
      sort_order: 'asc',
    });
    const res = await fetch(`${conn.url}/ajax/books?${qs}`, {
      headers: this.buildHeaders(conn),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = (await res.json()) as BooksResponse;
    const books: CalibreBook[] = data.book_ids.map((id) => {
      const b = data.data[String(id)];
      const formats = (b.formats ?? []).filter((f) =>
        SUPPORTED_FORMATS.has(f.toUpperCase()),
      ) as Array<'EPUB' | 'PDF'>;
      return {
        id,
        title: b.title ?? 'Sin título',
        authors: b.authors ?? [],
        formats,
        coverUrl: `${conn.url}/get/cover/${id}/${encodeURIComponent(conn.libraryId)}`,
      };
    });

    return { books, total: data.total_num };
  },

  /** Download a book to the local books directory. Returns the local file path. */
  async downloadBook(
    conn: CalibreConnection,
    book: CalibreBook,
    format: 'EPUB' | 'PDF',
  ): Promise<string> {
    const url = `${conn.url}/get/${format}/${book.id}/${encodeURIComponent(conn.libraryId)}`;
    const res = await fetch(url, { headers: this.buildHeaders(conn) });
    if (!res.ok) throw new Error(`Descarga fallida: HTTP ${res.status}`);

    const arrayBuffer = await res.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    const booksDir = new Directory(Paths.document, 'books');
    booksDir.create({ intermediates: true, overwrite: true });

    const ext = format.toLowerCase();
    const safeTitle = book.title.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 40);
    const filename = `${safeTitle}_${book.id}.${ext}`;
    const file = new File(booksDir, filename);
    file.write(bytes);

    return file.uri;
  },

  /** Download cover and return base64 data URI, or null on failure. */
  async downloadCover(conn: CalibreConnection, bookId: number): Promise<string | null> {
    try {
      const res = await fetch(
        `${conn.url}/get/cover/${bookId}/${encodeURIComponent(conn.libraryId)}`,
        { headers: this.buildHeaders(conn) },
      );
      if (!res.ok) return null;
      const arrayBuffer = await res.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const binary = Array.from(bytes).map((b) => String.fromCharCode(b)).join('');
      return `data:image/jpeg;base64,${btoa(binary)}`;
    } catch {
      return null;
    }
  },

  // ── Persistent connection storage ──

  async saveConnection(conn: CalibreConnection): Promise<void> {
    await SecureStore.setItemAsync(CONN_KEY, JSON.stringify(conn));
  },

  async loadConnection(): Promise<CalibreConnection | null> {
    const raw = await SecureStore.getItemAsync(CONN_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CalibreConnection;
  },

  async clearConnection(): Promise<void> {
    await SecureStore.deleteItemAsync(CONN_KEY);
  },
};
