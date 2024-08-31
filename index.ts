import beautify from 'beautify';
import parse from 'style-to-object';
import cssToObject from 'css-to-object';

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


function convertInlineStyles(html) {
    const style = [html.matchAll(/style\s *=\s * (['"])(.*?)\1/gm)];
    style.map((_m, _g1, g2) => {
        html = html.replaceAll(g2, parse(g2));
    });

    return html;
}

export function closeSelfClosingTags(html: string): string {
    return html.replaceAll(new RegExp(`<(${selfClosingTags.join('|')})([^>]*)\s*/?>`, 'gi'), (_match, tagName, attributes) => `<${tagName}${attributes ? attributes : ''}/>`).replace(/\/\/>/g, '/>');
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

export function indentAllLines(html: string): string {
    return beautify(html, { format: 'html' });
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
    return html.replaceAll(/style = (".*?")/gi, (match) => {
        return `style={${cssToObject(match[1])}}`
    })
}

export function imageFix(html: string): string {
    return html.replaceAll('</img>', '');
}

export function removeInvalidTags(html: string): string {
    return html.replace(/<!DOCTYPE html>/gi, '');
}

export default function convert(html: string): string {
    html = wrapIntoDiv(html);
    html = removeInvalidTags(html);
    html = closeSelfClosingTags(html);
    html = convertEventAttributesToCamelCase(html);
    html = convertClassToClassName(html);
    html = removeComments(html);
    html = imageFix(html);
    html = convertInlineStyles(html);
    html = convertStyleToObject(html);

    return indentAllLines(html);
}