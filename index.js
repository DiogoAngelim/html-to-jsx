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
    return html.replace(new RegExp(`<(${selfClosingTags.join('|')})([^>]*)\s*/?>`, 'gi'), (_match, tagName, attributes) => `<${tagName}${attributes ? attributes : ''}/>`).replace(/\/\/>/g, '/>');
}
export function convertEventAttributesToCamelCase(html) {
    return html.replace(/(\bon\w+)=["']([^"']+)["']/g, eventAttributesCallback);
}
export function convertClassToClassName(html) {
    return html.replace(/class=/g, 'className=');
}
export function removeComments(html) {
    return html.replace(/<!--[\s\S]*?-->/g, '');
}
export function indentAllLines(html) {
    return beautify(html, { format: 'html' });
}
const getProperties = (property) => {
    return property.split(':').map((prop) => prop.trim());
};
const getStyle = (style) => {
    const styleObject = {};
    style.split(';').forEach((property) => {
        const [key, value] = getProperties(property);
        if (key && value) {
            styleObject[key] = value;
        }
    });
    return JSON.stringify(styleObject);
};
const styleReplaceCallback = (_match, style) => {
    return `style={${getStyle(style)}}`;
};
export function convertStyleToObject(html) {
    return html.replace(/style="([^"]*)"/g, styleReplaceCallback);
}
const isTagClosed = (tag, html) => {
    return !selfClosingTags.includes(tag) && tagsRequiringClosing.has(tag) && !html.includes(`</${tag}>`);
};
const validateInput = (html) => {
    if (typeof html !== 'string' || html.trim() === '' || !html) {
        throw new TypeError('Input must be valid a string.');
    }
};
const validateTag = (tag, html) => {
    if (!isTagClosed(tag, html)) {
        throw new Error(`Tag <${tag}> is not closed.`);
    }
};
const validateTags = (html) => {
    let match;
    while ((match = /<([^\s>\/]+)/g.exec(html)) !== null) {
        validateTag(match[1].toLowerCase(), html);
    }
};
export function validateHtml(html) {
    validateInput(html);
    validateTags(html);
    return 'HTML is valid.';
}
export default function convert(html) {
    validateHtml(html);
    html = wrapIntoDiv(html);
    html = closeSelfClosingTags(html);
    html = convertEventAttributesToCamelCase(html);
    html = convertClassToClassName(html);
    html = removeComments(html);
    html = convertStyleToObject(html);
    return indentAllLines(html);
}
