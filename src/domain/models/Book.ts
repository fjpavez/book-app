export type BookFormat = 'epub' | 'pdf' | 'md';

export type ReadingStatus = 'reading' | 'to_read' | 'finished' | 'unorganized';

export interface Book {
  id: string;
  title: string;
  author: string;
  format: BookFormat;
  filePath: string;
  coverPath: string | null;
  status: ReadingStatus;
  readingPosition: string | null; // CFI for epub, line number for md/pdf
  addedAt: number; // Unix timestamp
  lastOpenedAt: number | null;
}
