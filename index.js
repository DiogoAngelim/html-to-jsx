import beautify from 'beautify';

const selfClosingTags = ['input', 'img', 'br', 'hr', 'meta', 'link', 'col', 'area', 'base'];
const tagsRequiringClosing = new Set(['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'form', 'button', 'textarea', 'select', 'option', 'a']);
export function wrapIntoDiv(html) {
    return `<div>${html}</div>`;
}
const eventAttributesCallback = (_match, eventName, handler) => {
    const newEventName = eventName.slice(2).split('');
    newEventName.shift();
    return `on${eventName[0].toUpperCase() + newEventName.join('')}={${handler}}`;
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
const isTagClosed = (tag) => {
    return !selfClosingTags.includes(tag) && tagsRequiringClosing.has(tag);
};
const validateTag = (tag) => {
    if (!isTagClosed(tag)) {
        throw new Error(`Tag <${tag}> is not closed.`);
    }
};
export function toCamelCase(string) {
    return string
        .split(/[-_\s]/)
        .map((word, index) => index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
}
export function convertInlineStylesToReactStyles(html) {
  // Create a DOM element to use for parsing the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Recursively process each element to convert styles
  function processElement(element) {
    if (element.nodeType === 1) { // Check if the node is an element
      const style = element.getAttribute('style');
      if (style) {
        element.style.cssText = style;
        const reactStyleObject = {};
        for (let i = 0; i < element.style.length; i++) {
          const propertyName = element.style[i];
          const camelCaseProperty = propertyName.replace(/-([a-z])/g, g => g[1].toUpperCase());
          reactStyleObject[camelCaseProperty] = element.style.getPropertyValue(propertyName);
        }
        // Set the new React style as a JSON object
        element.setAttribute('data-react-style', JSON.stringify(reactStyleObject));
        element.removeAttribute('style'); // Optionally remove original style
      }
    }

    // Process child elements recursively
    for (let child of element.children) {
      processElement(child);
    }
  }

  // Process the root element
  processElement(tempDiv);

  // Return the updated HTML
  return tempDiv.innerHTML;
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
export default function convert(html) {
    html = wrapIntoDiv(html);
    html = removeInvalidTags(html);
    html = closeSelfClosingTags(html);
    html = convertEventAttributesToCamelCase(html);
    html = convertClassToClassName(html);
    html = removeComments(html);
    html = imageFix(html);
    html = convertInlineStylesToReactStyles(html);
    html = removeUnsuportedAttrs(html);
    return indentAllLines(html);
}
