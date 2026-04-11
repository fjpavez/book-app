export interface Bookmark {
  id: string;
  bookId: string;
  position: string; // CFI for epub, line number for md/pdf
  label: string | null;
  chapter: string | null;
  createdAt: number;
}
