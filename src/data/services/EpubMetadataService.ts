import { File } from 'expo-file-system';
import JSZip from 'jszip';

export interface EpubMetadata {
  title: string;
  author: string;
  coverBase64: string | null;
}

export const EpubMetadataService = {
  async extract(filePath: string): Promise<EpubMetadata> {
    try {
      const file = new File(filePath);
      const base64 = await file.base64();

      const zip = await JSZip.loadAsync(base64, { base64: true });

      // 1. Find OPF file path via META-INF/container.xml
      const containerXml = await zip.file('META-INF/container.xml')?.async('string');
      if (!containerXml) return fallback();

      const opfPath = parseOpfPath(containerXml);
      if (!opfPath) return fallback();

      const opfXml = await zip.file(opfPath)?.async('string');
      if (!opfXml) return fallback();

      // 2. Parse metadata from OPF
      const title = extractTag(opfXml, 'dc:title') ?? extractTag(opfXml, 'title') ?? 'Sin título';
      const author =
        extractTag(opfXml, 'dc:creator') ?? extractTag(opfXml, 'creator') ?? 'Autor desconocido';

      // 3. Extract cover image
      const opfDir = opfPath.includes('/')
        ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1)
        : '';
      const coverBase64 = await extractCover(zip, opfXml, opfDir);

      return { title, author, coverBase64 };
    } catch {
      return fallback();
    }
  },
};

function parseOpfPath(containerXml: string): string | null {
  const match = containerXml.match(/full-path="([^"]+\.opf)"/i);
  return match?.[1] ?? null;
}

function extractTag(xml: string, tag: string): string | null {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([^<]+)<\/${tag}>`, 'i'));
  return match?.[1]?.trim() ?? null;
}

async function extractCover(
  zip: JSZip,
  opfXml: string,
  opfDir: string,
): Promise<string | null> {
  try {
    const coverHref =
      parseCoverHref(opfXml, 'cover-image') ??
      parseCoverHref(opfXml, 'cover') ??
      parseCoverByMediaType(opfXml);

    if (!coverHref) return null;

    const fullPath = opfDir + coverHref;
    const zipFile = zip.file(fullPath) ?? zip.file(coverHref);
    if (!zipFile) return null;

    const imgBase64 = await zipFile.async('base64');
    const ext = coverHref.split('.').pop()?.toLowerCase() ?? 'jpeg';
    const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
    return `data:${mime};base64,${imgBase64}`;
  } catch {
    return null;
  }
}

function parseCoverHref(opfXml: string, id: string): string | null {
  const match = opfXml.match(new RegExp(`<item[^>]+id="${id}"[^>]+href="([^"]+)"`, 'i'));
  if (match) return match[1];
  const match2 = opfXml.match(new RegExp(`<item[^>]+href="([^"]+)"[^>]+id="${id}"`, 'i'));
  return match2?.[1] ?? null;
}

function parseCoverByMediaType(opfXml: string): string | null {
  const match = opfXml.match(/<item[^>]+media-type="image\/(jpeg|png|webp)"[^>]+href="([^"]+)"/i);
  if (match) return match[2];
  const match2 = opfXml.match(/<item[^>]+href="([^"]+)"[^>]+media-type="image\/(jpeg|png|webp)"/i);
  return match2?.[1] ?? null;
}

function fallback(): EpubMetadata {
  return { title: 'Sin título', author: 'Autor desconocido', coverBase64: null };
}
