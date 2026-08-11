import sanitizeHtml = require('sanitize-html');

export function sanitizeRichText(value?: string | null): string | null | undefined {
  if (value === undefined || value === null) return value;
  return sanitizeHtml(value, {
    allowedTags: ['p', 'br', 'h2', 'h3', 'h4', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'blockquote', 'a'],
    allowedAttributes: { a: ['href', 'title', 'target', 'rel'] },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: { a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true) },
  });
}
