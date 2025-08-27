import sanitizeHtml from 'sanitize-html';

const sanitizeOptions = {
  allowedTags: [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'blockquote',
    'p',
    'a',
    'ul',
    'ol',
    'nl',
    'li',
    'b',
    'i',
    'strong',
    'em',
    'strike',
    'code',
    'hr',
    'br',
    'div',
    'table',
    'thead',
    'caption',
    'tbody',
    'tr',
    'th',
    'td',
    'pre',
    'img',
    'span',
  ],
  allowedAttributes: {
    a: ['href', 'name', 'target'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    // span: ['style'],
  },
};

/**
 * Sanitiza o conteúdo HTML de um artigo.
 * @param {string} dirtyContent - A string de HTML que precisa ser limpa.
 * @returns {string} O HTML seguro e sanitizado.
 */
export const sanitizeArticleContent = (dirtyContent) => {
  if (!dirtyContent) {
    return dirtyContent;
  }
  return sanitizeHtml(dirtyContent, sanitizeOptions);
};
