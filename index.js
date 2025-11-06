"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceAttributes = exports.removeUnsuportedAttrs = exports.removeInvalidTags = exports.imageFix = exports.convertStyleToObject = exports.toCamelCase = exports.indentAllLines = exports.removeComments = exports.convertClassToClassName = exports.convertEventAttributesToCamelCase = exports.closeSelfClosingTags = exports.wrapIntoDiv = void 0;
var beautify_1 = require("beautify");
var css_to_object_1 = require("css-to-object");
var selfClosingTags = ['input', 'img', 'br', 'hr', 'meta', 'link', 'col', 'area', 'base'];
var tagsRequiringClosing = new Set(['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'form', 'button', 'textarea', 'select', 'option', 'a']);
function wrapIntoDiv(html) {
    return "<div>".concat(html, "</div>");
}
exports.wrapIntoDiv = wrapIntoDiv;
var eventAttributesCallback = function (_match, eventName, handler) {
    var newEventName = eventName.slice(2).split('')[0].toUpperCase();
    return "on".concat(newEventName).concat(eventName.slice(3), "={").concat(handler, "}");
};
function closeSelfClosingTags(html) {
    // Fix: Prevent partial tag name matches
    // e.g., "col" should not match "colgroup", "input" should not match "inputmode", etc.
    // Pattern ensures tag name is immediately followed by whitespace, >, or /
    // This prevents matching "col" in "colgroup" since "colgroup" has "g" (a letter) after "col"
    var result = html.replaceAll(new RegExp("<(".concat(selfClosingTags.join("|"), ")(?=[\\s>/])([^>]*)\\s*/?>"), "gi"), function (_match, tagName, attributes) {
        return "<".concat(tagName).concat(attributes ? attributes : "", "/>");
    });
    return result.replace(/\/\/>/g, "/>");
}
exports.closeSelfClosingTags = closeSelfClosingTags;
function convertEventAttributesToCamelCase(html) {
    return html.replaceAll(/(\bon\w+)=["']([^"']+)["']/g, eventAttributesCallback);
}
exports.convertEventAttributesToCamelCase = convertEventAttributesToCamelCase;
function convertClassToClassName(html) {
    return html.replaceAll(/class=/g, 'className=');
}
exports.convertClassToClassName = convertClassToClassName;
function removeComments(html) {
    return html.replaceAll(/<!--[\s\S]*?-->/g, '');
}
exports.removeComments = removeComments;
function indentAllLines(html) {
    return (0, beautify_1.default)(html, { format: 'html' });
}
exports.indentAllLines = indentAllLines;
var isTagClosed = function (tag) {
    return !selfClosingTags.includes(tag) && tagsRequiringClosing.has(tag);
};
var validateInput = function (html) {
    if (typeof html !== 'string' || html.trim() === '' || !html) {
        throw new TypeError('Input must be valid a string.');
    }
};
var validateTag = function (tag) {
    if (!isTagClosed(tag)) {
        throw new Error("Tag <".concat(tag, "> is not closed."));
    }
};
var validateTags = function (html) {
    var match;
    while ((match = /<([^\s>\/]+)/g.exec(html)) !== null) {
        validateTag(match[1].toLowerCase());
    }
};
function toCamelCase(string) {
    return string
        .split(/[-_\s]/)
        .map(function (word, index) {
        return index === 0
            ? word.toLowerCase()
            : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
        .join('');
}
exports.toCamelCase = toCamelCase;
function convertStyleToObject(html) {
    return html.replaceAll(/style = (".*?")/gi, function (match) {
        return "style={".concat((0, css_to_object_1.default)(match[1]), "}");
    });
}
exports.convertStyleToObject = convertStyleToObject;
function imageFix(html) {
    return html.replaceAll('</img>', '');
}
exports.imageFix = imageFix;
function removeInvalidTags(html) {
    return html.replace(/<!DOCTYPE html>|<!DOCTYPE>/gi, '');
}
exports.removeInvalidTags = removeInvalidTags;
function removeUnsuportedAttrs(html) {
    return html.replaceAll('xmlns:xlink="http://www.w3.org/1999/xlink"', '');
}
exports.removeUnsuportedAttrs = removeUnsuportedAttrs;
function replaceAttributes(html) {
    html = html.replace(/\b(for)\b/gi, 'htmlFor');
    html = html.replace(/\b(autocomplete)\b/gi, 'autoComplete');
    html = html.replace(/\b(tabindex)\b/ig, 'tabIndex');
    html = html.replace(/\b(stroke-width)\b/ig, 'strokeWidth');
    html = html.replace(/\b(stroke-linejoin)\b/ig, 'strokeLinejoin');
    return html.replace(/\b(stroke-linecap)\b/ig, 'strokeLinecap');
}
exports.replaceAttributes = replaceAttributes;
function convert(html) {
    html = removeInvalidTags(html);
    html = wrapIntoDiv(html);
    html = closeSelfClosingTags(html);
    html = convertEventAttributesToCamelCase(html);
    html = convertClassToClassName(html);
    html = removeComments(html);
    html = imageFix(html);
    html = convertStyleToObject(html);
    html = removeUnsuportedAttrs(html);
    return indentAllLines(html);
}
exports.default = convert;
