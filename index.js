import beautify from 'beautify';

const selfClosingTags = ['input', 'img', 'br', 'hr', 'meta', 'link', 'col', 'area', 'base'];
const tagsRequiringClosing = new Set(['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'form', 'button', 'textarea', 'select', 'option', 'a']);
export function wrapIntoDiv(html) {
    return `<div>${html}</div>`;
}
const eventAttributesCallback = (_match, eventName, handler) => {
    const eventPart = eventName.slice(2);
    console.log(eventPart);
    
    return `on${eventPart.charAt(0).toUpperCase()}${eventPart.slice(1)}={${handler}}`;
};
export function closeSelfClosingTags(html) {
    return html.replaceAll(new RegExp(`<(${selfClosingTags.join('|')})([^>]*)\s*/?>`, 'gi'), (_match, tagName, attributes) => `<${tagName}${attributes ? attributes : ''}/>`).replace(/\/\/>/g, '/>');
}
export function convertEventAttributesToCamelCase(html) {
    return html.replaceAll(/(\bon\w+)=["']([^"']+)["']/g, eventAttributesCallback);
}
export function convertClassToClassName(html) {
    return html.replaceAll(/class=/g, 'className=');
}
export function removeComments(html) {
    return html.replaceAll(/<!--[\s\S]*?-->/g, '');
}
export function indentAllLines(html) {
    return beautify(html, { format: 'html' });
}
export function toCamelCase(string) {
    return string
        .split(/[-_\s]/)
        .map((word, index) => index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
}

function parseStyleString(style) {
    const entries = style.split(';').filter(Boolean).map(rule => {
      const [key, value] = rule.split(':');
      if (!key || !value) return null;
  
      const camelKey = key.trim().replace(/-([a-z])/g, (_, char) => char.toUpperCase());
      return [camelKey, value.trim()];
    }).filter(Boolean);
  
    const styleObject = Object.fromEntries(entries);
  
    return JSON.stringify(styleObject).replace(/"([^"]+)":/g, '$1:'); // Strip object keys' quotes
  } 
export function convertInlineStylesToReactStyles(html) {
  return html.replace(/style="(.*?)"/g, (_match, style) => {
    const reactStyleObject = {};
    style.split(';').forEach(styleRule => {
      if (styleRule.trim()) {
        const [property, value] = styleRule.split(':').map(s => s.trim());
        const camelCaseProperty = property.replace(/-([a-z])/g, g => g[1].toUpperCase());
        reactStyleObject[camelCaseProperty] = value;
      }
    });

    return `style={${JSON.stringify(reactStyleObject)}}`;
  }).replace(/style="([^"]+)"/g, (_, styleString) => {
    const styleObj = parseStyleString(styleString);
    return `style={${styleObj}}`;
  });
}

export function imageFix(html) {
    return html.replaceAll('</img>', '');
}
export function removeInvalidTags(html) {
    return html.replace(/<!DOCTYPE html>/gi, '');
}
export function removeUnsuportedAttrs(html) {
    return html.replaceAll('xmlns:xlink="http://www.w3.org/1999/xlink"', '');
}
export function replaceAttributes(html) {
    html = html.replace(/for=/gi, 'htmlFor=');
    html = html.replace(/\b(autocomplete)\b/gi, 'autoComplete');
    html = html.replace(/\b(tabindex)\b/ig, 'tabIndex');
    html = html.replace(/\b(stroke-width)\b/ig, 'strokeWidth');
    html = html.replace(/\b(stroke-linejoin)\b/ig, 'strokeLinejoin');
    return html.replace(/\b(stroke-linecap)\b/ig, 'strokeLinecap');	
}
export default function convert(html) {
    html = wrapIntoDiv(html);
    html = removeInvalidTags(html);
    html = removeComments(html);
    html = imageFix(html);
    // html = convertInlineStylesToReactStyles(html);
    html = removeUnsuportedAttrs(html);
    html = closeSelfClosingTags(html);
    html = convertClassToClassName(html);
    html = convertEventAttributesToCamelCase(html);
    html = replaceAttributes(html);
    return indentAllLines(html);
}
