import * as DocumentPicker from 'expo-document-picker';
import { File, Directory, Paths } from 'expo-file-system';
import * as Crypto from 'expo-crypto';
import { BookFormat } from '@domain/models';

export interface PickedFile {
  id: string;
  name: string;
  format: BookFormat;
  destPath: string;
  coverPath: string | null;
}

const SUPPORTED_TYPES: Record<string, BookFormat> = {
  epub: 'epub',
  pdf: 'pdf',
  md: 'md',
};

function booksDir(): Directory {
  return new Directory(Paths.document, 'books');
}

function coversDir(): Directory {
  return new Directory(Paths.document, 'covers');
}

export const FileManagerService = {
  ensureDirs(): void {
    booksDir().create({ intermediates: true, overwrite: true });
    coversDir().create({ intermediates: true, overwrite: true });
  },

  async pickFiles(): Promise<PickedFile[]> {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        'application/epub+zip',
        'application/pdf',
        'text/markdown',
        'text/x-markdown',
        '*/*',
      ],
      multiple: true,
      copyToCacheDirectory: true,
    });

    if (result.canceled) return [];

    this.ensureDirs();
    const picked: PickedFile[] = [];

    for (const asset of result.assets) {
      const ext = asset.name.split('.').pop()?.toLowerCase() ?? '';
      const format = SUPPORTED_TYPES[ext];
      if (!format) continue;

      const id = Crypto.randomUUID();
      const dest = new File(booksDir(), `${id}.${ext}`);
      const src = new File(asset.uri);
      src.copy(dest);

      picked.push({ id, name: asset.name, format, destPath: dest.uri, coverPath: null });
    }

    return picked;
  },

  saveCover(bookId: string, base64DataUri: string): string {
    this.ensureDirs();
    const coverFile = new File(coversDir(), `${bookId}.jpg`);
    const base64 = base64DataUri.replace(/^data:image\/[a-z]+;base64,/, '');
    coverFile.write(base64, { encoding: 'base64' });
    return coverFile.uri;
  },

  deleteBook(filePath: string, coverPath: string | null): void {
    try {
      const f = new File(filePath);
      if (f.exists) f.delete();
    } catch { /* already gone */ }

    if (coverPath) {
      try {
        const c = new File(coverPath);
        if (c.exists) c.delete();
      } catch { /* already gone */ }
    }
  },
};
