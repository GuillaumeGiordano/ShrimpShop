import DOMPurify from 'isomorphic-dompurify';

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 's',
  'h1', 'h2', 'h3', 'h4',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code',
  'a', 'img',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'hr', 'figure', 'figcaption',
  'div', 'iframe'
];

const ALLOWED_ATTRS = {
  a: ['href', 'title', 'target', 'rel'],
  img: ['src', 'alt', 'width', 'height', 'loading'],
  iframe: ['src', 'width', 'height', 'allowfullscreen', 'frameborder', 'allow'],
  div: ['data-youtube-video', 'style'],
  '*': ['class', 'style']
};

/**
 * Sanitize HTML from TipTap WYSIWYG before storing / rendering
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: Object.values(ALLOWED_ATTRS).flat(),
    // N'autoriser les iframes que depuis YouTube / YouTube nocookie
    ALLOW_UNKNOWN_PROTOCOLS: false,
    FORBID_SCRIPTS: true,
    transformTags: {
      iframe: (tagName, attribs) => {
        const src = attribs.src ?? '';
        const isYoutube =
          src.startsWith('https://www.youtube.com/embed/') ||
          src.startsWith('https://www.youtube-nocookie.com/embed/');
        if (!isYoutube) return { tagName: 'span', attribs: {} };
        return { tagName, attribs };
      }
    }
  });
}

/**
 * Strip all HTML tags — for plain text excerpts
 */
export function stripHtml(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}
