import beautify from 'beautify';

const SELF_CLOSING_TAGS = ['input', 'img', 'br', 'hr', 'meta', 'link', 'col', 'area', 'base'];

export function wrapIntoDiv(html: string): string {
    return `
    <div>
      ${html}
    </div>
    `;
}

export function closeSelfClosingTags(html: string): string {
    validateHtml(html);

    const selfClosingTagPattern = new RegExp(`<(${SELF_CLOSING_TAGS.join('|')})([^>]*)\s*/?>`, 'g');

    return html.replace(selfClosingTagPattern, (match, tagName, attributes) => {
        return `<${tagName}${attributes ? attributes : ''}/>`;
    }).replace(/\/\/>/g, '/>');
}

export function convertEventAttributesToCamelCase(html: string): string {
    validateHtml(html);

    const eventAttributesPattern = /(\bon\w+)=["']([^"']+)["']/g;
    
    return html.replace(eventAttributesPattern, (match, eventName, handler) => {
        eventName = eventName.slice(2).split('');
        const eventNameChar = eventName[0].toUpperCase();
        eventName.shift();
        eventName = eventNameChar + eventName.join('');

        return `on${eventName}={${handler}}`;
    });
}

export function convertClassToClassName(html: string): string {
    validateHtml(html);

    return html.replace(/class=/g, 'className=');
}

export function removeComments(html: string): string {
    validateHtml(html);

    return html.replace(/<!--[\s\S]*?-->/g, '');
}

export function indentAllLines(html: string): string {
  validateHtml(html);

  return beautify(html, {format: 'html'});
}

export function convertStyleToObject(html: string): string {
    validateHtml(html);

    return html.replace(/style="([^"]*)"/g, (match, style) => {
        const styleObject = {};

        style.split(';').forEach(property => {
            const [key, value] = property.split(':').map((prop: string) => prop.trim());
            if (key && value) {
                styleObject[key] = value;
            }
        });

        return `style={${JSON.stringify(styleObject)}}`;
    });
}

export function validateHtml(html: string): string {
  if (typeof html !== 'string') {
      throw new TypeError('Input must be a string');
  }

  const tagPattern = /<([^\s>\/]+)/g;
  const tagsRequiringClosing = new Set(['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'form', 'input', 'button', 'textarea', 'select', 'option', 'a']);

  let match: any;
  const errors: string[] = [];

  while ((match = tagPattern.exec(html)) !== null) {
      const tag = match[1].toLowerCase();

      if (!SELF_CLOSING_TAGS.includes(tag) && tagsRequiringClosing.has(tag) && !html.includes(`</${tag}>`)) {
          errors.push(`Tag <${tag}> is not closed.`);
      }
  }

  if (errors.length > 0) {
      throw new Error(errors.join(' '));
  }

  return 'HTML is valid.';
}

export default function convert(html: string): string {
  validateHtml(html);
  html = wrapIntoDiv(html);
  html = closeSelfClosingTags(html);
  html = convertEventAttributesToCamelCase(html);
  html = convertClassToClassName(html);
  html = removeComments(html);
  html = convertStyleToObject(html);

  return indentAllLines(html);
}