export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'orange';

export interface Annotation {
  id: string;
  bookId: string;
  position: string; // CFI for epub, line number for md/pdf
  selectedText: string;
  note: string | null;
  color: HighlightColor;
  chapter: string | null;
  createdAt: number;
  updatedAt: number;
}
