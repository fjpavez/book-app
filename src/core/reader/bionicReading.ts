/**
 * Bionic Reading utilities.
 *
 * Bionic Reading bolds the first ~half of each word so the brain can complete
 * the rest, increasing reading speed.
 */

/**
 * Transforms a markdown string to apply Bionic Reading.
 * Skips code blocks, inline code, links, images, and already-bold spans so
 * existing markdown formatting is preserved.
 */
export function applyBionicMarkdown(markdown: string): string {
  // Segments we must NOT transform (code blocks, inline code, existing bold/italic, links, images)
  const SKIP_PATTERN =
    /(```[\s\S]*?```|`[^`\n]+`|\*\*[\s\S]*?\*\*|\*[^\s*][^*]*?\*|__[\s\S]*?__|_[^\s_][^_]*?_|\[.*?\]\(.*?\)|!\[.*?\]\(.*?\))/gm;

  const parts = markdown.split(SKIP_PATTERN);

  return parts
    .map((part, i) => {
      if (i % 2 === 1) return part; // skip-pattern segment — leave untouched
      return part.replace(/\b([A-Za-zÀ-ÿ]{3,})\b/g, (word) => {
        const boldLen = Math.ceil(word.length / 2);
        return `**${word.slice(0, boldLen)}**${word.slice(boldLen)}`;
      });
    })
    .join('');
}

/**
 * JavaScript snippet injected into the ePub WebView to apply Bionic Reading
 * to the current chapter's DOM.
 */
export const BIONIC_READING_JS = `
(function() {
  if (window.__bionicApplied) return;
  window.__bionicApplied = true;
  function applyBionic(node) {
    if (node.nodeType === 3) {
      var text = node.textContent || '';
      var replaced = text.replace(/\\b([A-Za-z\\u00C0-\\u00FF]{3,})\\b/g, function(w) {
        var half = Math.ceil(w.length / 2);
        return '<b>' + w.slice(0, half) + '</b>' + w.slice(half);
      });
      if (replaced !== text) {
        var span = document.createElement('span');
        span.innerHTML = replaced;
        node.parentNode && node.parentNode.replaceChild(span, node);
      }
    } else if (node.nodeType === 1) {
      var tag = (node.tagName || '').toUpperCase();
      if (tag !== 'SCRIPT' && tag !== 'STYLE' && tag !== 'CODE' && tag !== 'PRE' && tag !== 'B') {
        Array.from(node.childNodes).forEach(applyBionic);
      }
    }
  }
  applyBionic(document.body);
})();
true;
`;
