import beautify from 'beautify';

const SELF_CLOSING_TAGS = ['input', 'img', 'br', 'hr', 'meta', 'link', 'col', 'area', 'base'];

export function wrapIntoDiv(html) {
    return `
    <div>
      ${html}
    </div>
    `;
}

export function closeSelfClosingTags(html) {
    if (typeof html !== 'string') {
        throw new TypeError('Input must be a string');
    }

    const selfClosingTagPattern = new RegExp(`<(${SELF_CLOSING_TAGS.join('|')})([^>]*)\s*/?>`, 'g');

    return html.replace(selfClosingTagPattern, (match, tagName, attributes) => {
        return `<${tagName}${attributes ? attributes : ''}/>`;
    }).replace(/\/\/>/g, '/>');
}

export function convertEventAttributesToCamelCase(html) {
    if (typeof html !== 'string') {
        throw new TypeError('Input must be a string');
    }

    const eventAttributesPattern = /(\bon\w+)=["']([^"']+)["']/g;
    
    return html.replace(eventAttributesPattern, (match, eventName, handler) => {
        eventName = eventName.slice(2).split('');
        const eventNameChar = eventName[0].toUpperCase();
        eventName.shift();
        eventName = eventNameChar + eventName.join('');

        return `on${eventName}={${handler}}`;
    });
}

export function convertClassToClassName(html) {
    if (typeof html !== 'string') {
        throw new TypeError('Input must be a string');
    }

    return html.replace(/class=/g, 'className=');
}

export function removeComments(html) {
    if (typeof html !== 'string') {
        throw new TypeError('Input must be a string');
    }

    return html.replace(/<!--[\s\S]*?-->/g, '');
}

export function indentAllLines(html) {
    return beautify(html, {format: 'html'});
}

export function convertStyleToObject(html) {
    if (typeof html !== 'string') {
        throw new TypeError('Input must be a string');
    }

    return html.replace(/style="([^"]*)"/g, (match, style) => {
        const styleObject = {};

        style.split(';').forEach(property => {
            const [key, value] = property.split(':').map(prop => prop.trim());
            if (key && value) {
                styleObject[key] = value;
            }
        });

        return `style={${JSON.stringify(styleObject)}}`;
    });
}

export function validateHTML(html) {
    if (typeof html !== 'string') {
        throw new TypeError('Input must be a string');
    }

    const tagPattern = /<([^\s>\/]+)/g;
    const tagsRequiringClosing = new Set(['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'form', 'input', 'button', 'textarea', 'select', 'option', 'a']);

    let match;
    let errors = [];

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

export default function convert(html) {
    if (typeof validateHTML(html) === 'string') {
        html = wrapIntoDiv(html);
        html = closeSelfClosingTags(html);
        html = convertEventAttributesToCamelCase(html);
        html = convertClassToClassName(html);
        html = removeComments(html);
        html = convertStyleToObject(html);
        html = indentAllLines(html);

        return html;
    }

    throw new Error('Invalid HTML');

}