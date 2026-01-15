const selfClosingTags: string[] = ['input', 'img', 'br', 'hr', 'meta', 'link', 'col', 'area', 'base'];
const tagsRequiringClosing = new Set<string>(['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'form', 'button', 'textarea', 'select', 'option', 'a']);

export function wrapIntoDiv(html: string): string {
    return `<div>${html}</div>`;
}

function cssToObject(cssString: string): string {
    const cleanCss = cssString.replace(/['"]/g, '').trim();

    if (!cleanCss) return '{}';

    const styles = cleanCss.split(';')
        .filter((style: string) => style.trim())
        .map((style: string) => {
            const [property, value] = style.split(':').map((s: string) => s.trim());
            if (!property || !value) return '';

            const camelProperty = property.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());

            return `${camelProperty}: "${value}"`;
        })
        .filter(Boolean);

    return `{${styles.join(', ')}}`;
}

const eventAttributesCallback = (_match: string, eventName: string, handler: string): string => {
    const newEventName: string = eventName.slice(2).split('')[0].toUpperCase();

    return `on${newEventName}${eventName.slice(3)}={${handler}}`;
}

export function closeSelfClosingTags(html: string): string {
    const result = html.replaceAll(
        new RegExp(
            `<(${selfClosingTags.join("|")})(?=[\\s>/])([^>]*)\\s*/?>`,
            "gi",
        ),
        (_match: string, tagName: string, attributes: string) =>
            `<${tagName}${attributes ? attributes : ""}/>`,
    );

    return result.replace(/\/\/>/g, "/>");
}

export function convertEventAttributesToCamelCase(html: string): string {
    return html.replaceAll(/(\bon\w+)=["']([^"']+)["']/g, eventAttributesCallback);
}

export function convertClassToClassName(html: string): string {
    return html.replaceAll(/class=/g, 'className=');
}

export function removeComments(html: string): string {
    return html.replaceAll(/<!--[\s\S]*?-->/g, '');
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
    let match: RegExpExecArray | null;
    const regex = /<([^\s>\/]+)/g;

    while ((match = regex.exec(html)) !== null) {
        validateTag(match[1].toLowerCase());
    }
}

export function toCamelCase(string: string): string {
    return string
        .split(/[-_\s]/)
        .map((word, index) =>
            index === 0
                ? word.toLowerCase()
                : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join('');
}


export function convertStyleToObject(html: string): string {
    return html.replaceAll(/style\s*=\s*(".*?")/gi, (match: string, styleValue: string) => {
        return `style={${cssToObject(styleValue)}}`;
    });
}

export function imageFix(html: string): string {
    return html.replaceAll('</img>', '');
}

export function removeInvalidTags(html: string): string {
    return html.replace(/<!DOCTYPE html>|<!DOCTYPE>/gi, '');
}

export function removeUnsuportedAttrs(html: string): string {
    return html.replaceAll('xmlns:xlink="http://www.w3.org/1999/xlink"', '');
}

export function replaceAttributes(html: string): string {
    html = html.replace(/for=/gi, 'htmlFor=');
    html = html.replace(/\b(autocomplete)\b/gi, 'autoComplete');
    html = html.replace(/\b(tabindex)\b/ig, 'tabIndex');
    html = html.replace(/\b(stroke-width)\b/ig, 'strokeWidth');
    html = html.replace(/\b(stroke-linejoin)\b/ig, 'strokeLinejoin');
    return html.replace(/\b(stroke-linecap)\b/ig, 'strokeLinecap');
}

export function validateHtml(html: string): string {
    if (typeof html !== 'string') {
        throw new TypeError('Input must be a string.');
    }

    if (html.trim() === '') {
        return 'HTML is valid.';
    }

    const tagStack: string[] = [];
    const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
    let match: RegExpExecArray | null;

    while ((match = tagRegex.exec(html)) !== null) {
        const fullTag = match[0];
        const tagName = match[1].toLowerCase();

        if (fullTag.endsWith('/>') || selfClosingTags.includes(tagName)) {
            continue;
        }

        if (fullTag.startsWith('</')) {
            if (tagStack.length === 0) {
                throw new Error(`Unexpected closing tag: ${fullTag}`);
            }
            const lastOpenTag = tagStack.pop();
            if (lastOpenTag !== tagName) {
                throw new Error(`Mismatched tags: expected </${lastOpenTag}> but found </${tagName}>`);
            }
        } else {
            tagStack.push(tagName);
        }
    }

    if (tagStack.length > 0) {
        throw new Error(`Unclosed tags: ${tagStack.map(tag => `<${tag}>`).join(', ')}`);
    }

    return 'HTML is valid.';
}

export interface ConvertOptions {
    indentCode?: boolean;
}

export function indentAllLines(html: string, options?: { indentCode?: boolean }): string {
    if (options && options.indentCode) {
        try {
            // Dynamically require beautify only if indentCode is true
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const beautify = require('beautify');
            return beautify(html, { format: 'html' });
        } catch (e) {
            throw new Error('Beautify is not installed. Please install it or disable indentCode.');
        }
    }
    return html;
}

export default function convert(html: string, options?: ConvertOptions): string {
    html = removeInvalidTags(html);
    html = wrapIntoDiv(html);
    html = closeSelfClosingTags(html);
    html = convertEventAttributesToCamelCase(html);
    html = convertClassToClassName(html);
    html = removeComments(html);
    html = imageFix(html);
    html = convertStyleToObject(html);
    html = removeUnsuportedAttrs(html);
    html = replaceAttributes(html);
    return indentAllLines(html, options);
}

export { isTagClosed, validateTag, validateTags, cssToObject, validateInput };