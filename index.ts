import beautify from 'beautify';

const selfClosingTags = ['input', 'img', 'br', 'hr', 'meta', 'link', 'col', 'area', 'base'];
const tagsRequiringClosing = new Set(['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'form', 'button', 'textarea', 'select', 'option', 'a']);

export function wrapIntoDiv(html: string): string {
    return `<div>${html}</div>`;
}

const eventAttributesCallback = (_match: any, eventName: string, handler: string): string => {
    const newEventName = eventName.slice(2).split('');
    newEventName.shift();

    return `on${eventName[0].toUpperCase() + newEventName.join('')}={${handler}}`;
}

export function closeSelfClosingTags(html: string): string {
    return html.replace(new RegExp(`<(${selfClosingTags.join('|')})([^>]*)\s*/?>`, 'gi'), (_match, tagName, attributes) =>  `<${tagName}${attributes ? attributes : ''}/>`).replace(/\/\/>/g, '/>');
}

export function convertEventAttributesToCamelCase(html: string): string {    
    return html.replace(/(\bon\w+)=["']([^"']+)["']/g, eventAttributesCallback);
}

export function convertClassToClassName(html: string): string {
    return html.replace(/class=/g, 'className=');
}

export function removeComments(html: string): string {
    return html.replace(/<!--[\s\S]*?-->/g, '');
}

export function indentAllLines(html: string): string {
  return beautify(html, {format: 'html'});
}

const getProperties = (property: string): string[] => {
    return property.split(':').map((prop: string) => prop.trim());
}

const getStyle = (style: string): any => {
    const styleObject = {};

    style.split(';').forEach((property: string): void => {
        const [key, value] = getProperties(property);
        
        if (key && value) {
            styleObject[key] = value;
        }
    });

    return JSON.stringify(styleObject);
}

const styleReplaceCallback = (_match: any, style: string): string => {
    return `style={${getStyle(style)}}`;
}

export function convertStyleToObject(html: string): string {
    return html.replace(/style="([^"]*)"/g, styleReplaceCallback);
}

const isTagClosed = (tag: string): boolean => {
    return !selfClosingTags.includes(tag) && tagsRequiringClosing.has(tag);
}

const validateInput = (html: string): void => {
    if (typeof html !== 'string' || html.trim() === '' || !html) {
      throw new TypeError('Input must be valid a string.');
    }
}

const validateTag = (tag: string): void => {
    if (!isTagClosed(tag)) {
        throw new Error(`Tag <${tag}> is not closed.`);
    }
}

const validateTags = (html: string): void => {
  let match: any;

  while ((match = /<([^\s>\/]+)/g.exec(html)) !== null) {
    validateTag(match[1].toLowerCase());
  }
}

export function validateHtml(html: string): string {
  validateInput(html);
  validateTags(html);

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