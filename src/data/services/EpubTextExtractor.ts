import JSZip from 'jszip';
import { File } from 'expo-file-system';

function htmlToText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function splitSentences(text: string): string[] {
  // Split on sentence-ending punctuation followed by whitespace or end
  const raw = text.split(/(?<=[.!?…])\s+/);
  return raw
    .map((s) => s.trim())
    .filter((s) => s.length > 8);
}

async function loadZip(filePath: string): Promise<JSZip> {
  const base64 = await new File(filePath).base64();
  return JSZip.loadAsync(base64, { base64: true });
}

async function getOpfInfo(zip: JSZip): Promise<{ opfContent: string; opfDir: string } | null> {
  const containerXml = await zip.file('META-INF/container.xml')?.async('text');
  if (!containerXml) return null;
  const match = containerXml.match(/full-path="([^"]+\.opf)"/);
  if (!match) return null;
  const opfPath = match[1];
  const opfContent = await zip.file(opfPath)?.async('text') ?? '';
  const opfDir = opfPath.includes('/') ? opfPath.replace(/\/[^/]+$/, '/') : '';
  return { opfContent, opfDir };
}

function spineIndexFromCfi(cfi: string): number {
  // epubcfi(/6/N[id]/...) — N is even, position = (N - 2) / 2
  const m = cfi.match(/epubcfi\(\/6\/(\d+)/);
  if (!m) return 0;
  return Math.max(0, Math.floor((parseInt(m[1], 10) - 2) / 2));
}

export const EpubTextExtractor = {
  async extractSentencesAtCfi(filePath: string, cfi: string): Promise<string[]> {
    try {
      const zip = await loadZip(filePath);
      const opfInfo = await getOpfInfo(zip);
      if (!opfInfo) return [];
      const { opfContent, opfDir } = opfInfo;

      // Build manifest id → href map
      const manifest: Record<string, string> = {};
      for (const m of opfContent.matchAll(/<item\s[^>]*\bid="([^"]+)"[^>]*\bhref="([^"]+)"/g)) {
        manifest[m[1]] = m[2];
      }

      // Ordered spine ids
      const spineIds = [...opfContent.matchAll(/<itemref\s+idref="([^"]+)"/g)].map((m) => m[1]);

      const idx = spineIndexFromCfi(cfi);
      const itemId = spineIds[Math.min(idx, spineIds.length - 1)];
      const href = itemId ? manifest[itemId] : null;
      if (!href) return [];

      const chapterPath = opfDir + href;
      const chapterFile =
        zip.file(chapterPath) ??
        zip.file(href) ??
        zip.file(href.replace(/^.*\//, ''));
      if (!chapterFile) return [];

      const html = await chapterFile.async('text');
      return splitSentences(htmlToText(html));
    } catch (e) {
      console.error('[EpubTextExtractor]', e);
      return [];
    }
  },

  splitMarkdownSentences(markdownText: string): string[] {
    const stripped = markdownText
      .replace(/^#+\s.*$/gm, '')   // headings
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
      .replace(/[*_`~]/g, '')
      .replace(/^\s*[-*+]\s/gm, '')
      .replace(/\n+/g, ' ');
    return splitSentences(stripped);
  },
};
