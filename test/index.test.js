// 100% coverage targeted tests
describe('targeted coverage for uncovered lines', () => {
  it('wrapIntoDiv should handle empty string', () => {
    expect(wrapIntoDiv('')).toBe('<div></div>'); // line 16
  });

  it('cssToObject should handle quotes and whitespace', () => {
    expect(cssToObject('"color: red;"')).toBe('{color: "red"}'); // line 24-25
  });

  it('closeSelfClosingTags should handle no matches', () => {
    expect(closeSelfClosingTags('<div></div>')).toBe('<div></div>'); // line 95
  });

  it('convertEventAttributesToCamelCase should handle no event attributes', () => {
    expect(convertEventAttributesToCamelCase('<div></div>')).toBe('<div></div>'); // line 111
  });

  it('convertClassToClassName should handle no class attribute', () => {
    expect(convertClassToClassName('<div></div>')).toBe('<div></div>'); // line 123
  });
});

// Stress test: Convert HTML to React syntax and transpile with Babel
const babel = require('@babel/core');
const htmlToJsx = require('../index.js').default;

describe('stress test: Babel transpile React output', () => {
  it('should transpile converted JSX to valid JS', () => {
    const html = '<div class="test"><span>Hello <b>world</b>!</span></div>';
    const jsx = htmlToJsx(html); // Your converter function
    const code = `import React from 'react';\nexport default () => (${jsx});`;
    const result = babel.transformSync(code, {
      presets: [require.resolve('@babel/preset-env'), require.resolve('@babel/preset-react')],
    });
    expect(result && result.code).toMatch(/createElement/);
  });

  it('should handle complex SVGs and style attributes', () => {
    const edgeCases = [
      // Complex SVG with nested elements and attributes
      `<svg width="100" height="100"><g><rect x="10" y="10" width="80" height="80" style="fill: red; stroke-width: 2; stroke: black;"/><circle cx="50" cy="50" r="30" style="fill: blue; opacity: 0.5;"/></g></svg>`,
      // Inline style with various CSS properties
      `<div style="background: linear-gradient(to right, #fff, #000); border: 1px solid #ccc; padding: 10px;">Styled Div</div>`,
      // SVG with unsupported/edge attributes
      `<svg><path d="M10 10 H 90 V 90 H 10 Z" vector-effect="non-scaling-stroke"/></svg>`,
      // Deeply nested elements
      `<div><section><article><p style="color: green; font-weight: bold;">Deep</p></article></section></div>`,
      // SVG with camelCase and kebab-case attributes
      `<svg><ellipse cx="50" cy="50" rx="30" ry="20" stroke-width="4" stroke-linecap="round"/></svg>`,
      // HTML with class, for, and style
      `<label for="input1" style="display: block; margin-bottom: 5px;">Label</label><input id="input1" class="input-class" style="border: 0; outline: none;"/>`,
      // SVG with nested <text> and <tspan>
      `<svg><text x="10" y="20" style="font-size: 16px;"><tspan fill="red">Red</tspan> and <tspan fill="blue">Blue</tspan></text></svg>`,
      // HTML with multiple style and class attributes
      `<div class="a b c" style="color: #123; background: #eee;">Multi-class styled</div>`,
      // SVG with <defs> and <linearGradient>
      `<svg><defs><linearGradient id="grad1"><stop offset="0%" style="stop-color:rgb(255,255,0);stop-opacity:1" /><stop offset="100%" style="stop-color:rgb(255,0,0);stop-opacity:1" /></linearGradient></defs><rect width="100" height="100" fill="url(#grad1)" /></svg>`,
      // HTML with unusual whitespace and comments
      `<div   style = " color : red ; "> <!-- comment --> Weird spacing </div>`
    ];
    for (const html of edgeCases) {
      const jsx = htmlToJsx(html);
      const code = `import React from 'react';\nexport default () => (${jsx});`;
      const result = babel.transformSync(code, {
        presets: [require.resolve('@babel/preset-env'), require.resolve('@babel/preset-react')],
      });
      expect(result && result.code).toMatch(/createElement/);
    }
  });
});
import {
  closeSelfClosingTags,
  convertEventAttributesToCamelCase,
  convertClassToClassName,
  removeComments,
  validateHtml,
  convertStyleToObject,
  replaceAttributes,
  wrapIntoDiv,
  cssToObject,
  toCamelCase,
  imageFix,
  removeInvalidTags,
  removeUnsuportedAttrs,
  validateInput,
  isTagClosed,
  validateTag,
  validateTags,
  default as convert
} from '../index.js';

describe('HTML to JSX Converter Tests', () => {
  describe('closeSelfClosingTags', () => {
    it('should convert self-closing tags correctly', () => {
      const html = '<input><img><br>';
      const expected = '<input/><img/><br/>';
      expect(closeSelfClosingTags(html)).toBe(expected);
    });
  });

  describe('removeUnsuportedAttrs', () => {
    it('should remove unsupported xmlns:xlink attribute', () => {
      expect(removeUnsuportedAttrs('<svg xmlns:xlink="http://www.w3.org/1999/xlink"></svg>')).toBe('<svg ></svg>');
    });
  });

  describe('validateInput', () => {
    it('should throw TypeError for non-string input', () => {
      expect(() => validateInput(123)).toThrow(TypeError);
    });
    it('should throw TypeError for empty string', () => {
      expect(() => validateInput('')).toThrow(TypeError);
    });
  });

  describe('isTagClosed', () => {
    it('should return false for self-closing tag', () => {
      expect(isTagClosed('img')).toBe(false);
    });
    it('should return true for closing tag', () => {
      expect(isTagClosed('div')).toBe(true);
    });
  });

  describe('validateTag', () => {
    it('should throw error for unclosed tag', () => {
      expect(() => validateTag('img')).toThrow(Error);
    });
    it('should not throw for closed tag', () => {
      expect(() => validateTag('div')).not.toThrow();
    });
  });

  describe('validateTags', () => {
    it('should throw error for HTML with unclosed tag', () => {
      expect(() => validateTags('<img>')).toThrow(Error);
    });
    it('should not throw for HTML with closed tag', () => {
      expect(() => validateTags('<div></div>')).not.toThrow();
    });
  });

  describe('convert (default export)', () => {
    it('should convert HTML to beautified JSX', () => {
      const html = '<!DOCTYPE html><div class="container" style="color: red;"></div>';
      const result = convert(html);
      expect(result).toContain('className');
      expect(result).toContain('style={');
      expect(result).not.toContain('DOCTYPE');
    });
    it('should handle empty input gracefully', () => {
      expect(() => convert('')).not.toThrow();
    });
  });

  it('should throw TypeError for invalid input', () => {
    expect(() => convertEventAttributesToCamelCase(123)).toThrow(TypeError);
  });

  describe('convertClassToClassName', () => {
    it('should convert class attributes to className correctly', () => {
      const html =
        '<div class="container"><p class="text">Hello, world!</p></div>';
      const expected =
        '<div className="container"><p className="text">Hello, world!</p></div>';
      expect(convertClassToClassName(html)).toBe(expected);
    });

    it('should handle empty input', () => {
      const html = '';
      const expected = '';
      expect(convertClassToClassName(html)).toBe(expected);
    });

    it('should throw TypeError for invalid input', () => {
      expect(() => convertClassToClassName(123)).toThrow(TypeError);
    });
  });

  describe('removeComments', () => {
    it('should remove HTML comments correctly', () => {
      const html =
        '<!-- This is a comment --><p>Hello, world!</p><!-- Another comment -->';
      const expected = '<p>Hello, world!</p>';
      expect(removeComments(html)).toBe(expected);
    });

    it('should handle empty input', () => {
      const html = '';
      const expected = '';
      expect(removeComments(html)).toBe(expected);
    });

    it('should throw TypeError for invalid input', () => {
      expect(() => removeComments(123)).toThrow(TypeError);
    });
  });

  describe('validateHtml', () => {
    it('should validate valid HTML', () => {
      const html = '<div><p>Hello, world!</p></div>';
      expect(validateHtml(html)).toBe('HTML is valid.');
    });

    it('should detect unclosed tags', () => {
      const html = '<div><p>Hello, world!</div>';
      expect(() => validateHtml(html)).toThrow(Error);
    });

    it('should handle empty input', () => {
      const html = '';
      expect(validateHtml(html)).toBe('HTML is valid.');
    });

    it('should handle self-closing tags without closing slash', () => {
      const html = '<input><br>';
      expect(validateHtml(html)).toBe('HTML is valid.');
    });

    it('validateHtml should throw for non-string input', () => {
      expect(() => validateHtml(123)).toThrow(TypeError);
    });

    it('validateHtml should detect unclosed tags', () => {
      expect(() => validateHtml('<div><span>')).toThrow(/Unclosed tags/);
    });

    it('validateHtml should detect unexpected closing tag', () => {
      expect(() => validateHtml('</div>')).toThrow(/Unexpected closing tag/);
    });

    it('validateHtml should detect mismatched tags', () => {
      expect(() => validateHtml('<div></span></div>')).toThrow(/Mismatched tags/);
    });
  });

  describe('replaceAttributes', () => {
    it('should convert for= attributes to htmlFor= correctly', () => {
      const html = '<label for="username">Username</label>';
      const expected = '<label htmlFor="username">Username</label>';
      expect(replaceAttributes(html)).toBe(expected);
    });

    it('should handle mixed case for attributes', () => {
      const html = '<label FOR="email">Email</label>';
      const expected = '<label htmlFor="email">Email</label>';
      expect(replaceAttributes(html)).toBe(expected);
    });

    it('should NOT replace text containing "for"', () => {
      const html = '<p>This is for testing purposes only</p>';
      const expected = '<p>This is for testing purposes only</p>';
      expect(replaceAttributes(html)).toBe(expected);
    });

    it('should handle multiple for attributes', () => {
      const html = '<label for="input1">Label 1</label><label for="input2">Label 2</label>';
      const expected = '<label htmlFor="input1">Label 1</label><label htmlFor="input2">Label 2</label>';
      expect(replaceAttributes(html)).toBe(expected);
    });

    it('should handle other attribute conversions', () => {
      const html = '<input autocomplete="off" tabindex="1">';
      const expected = '<input autoComplete="off" tabIndex="1">';
      expect(replaceAttributes(html)).toBe(expected);
    });

    it('should handle empty input', () => {
      const html = '';
      const expected = '';
      expect(replaceAttributes(html)).toBe(expected);
    });

    it('should not replace unrelated attributes', () => {
      expect(replaceAttributes('<div foo="bar"></div>')).toBe('<div foo="bar"></div>');
    });
  });
});
// Additional coverage tests
describe('validateInput', () => {
  it('should throw TypeError for null input', () => {
    expect(() => validateInput(null)).toThrow(TypeError);
  });
  it('should throw TypeError for undefined input', () => {
    expect(() => validateInput(undefined)).toThrow(TypeError);
  });
  it('should throw TypeError for empty string', () => {
    expect(() => validateInput('')).toThrow(TypeError);
  });
  it('should not throw for valid string', () => {
    expect(() => validateInput('<div></div>')).not.toThrow();
  });
});

describe('validateTag', () => {
  it('should throw Error for self-closing tag', () => {
    expect(() => validateTag('img')).toThrow(Error);
  });
  it('should not throw for closing tag', () => {
    expect(() => validateTag('div')).not.toThrow();
  });
});

describe('validateTags', () => {
  it('should throw Error for HTML with unclosed tag', () => {
    expect(() => validateTags('<img>')).toThrow(Error);
  });
  it('should not throw for HTML with closed tag', () => {
    expect(() => validateTags('<div></div>')).not.toThrow();
  });
});

describe('replaceAttributes', () => {
  it('should convert stroke attributes', () => {
    const html = '<svg stroke-width="2" stroke-linejoin="round" stroke-linecap="square"></svg>';
    const expected = '<svg strokeWidth="2" strokeLinejoin="round" strokeLinecap="square"></svg>';
    expect(replaceAttributes(html)).toBe(expected);
  });
  it('should not replace unrelated attributes', () => {
    const html = '<div data-test="value"></div>';
    expect(replaceAttributes(html)).toBe(html);
  });
});

describe('convert (default export)', () => {
  it('should handle HTML with comments and unsupported attributes', () => {
    const html = '<!--comment--><svg xmlns:xlink="http://www.w3.org/1999/xlink"></svg>';
    const result = convert(html);
    expect(result).not.toContain('xmlns:xlink');
    expect(result).not.toContain('<!--');
  });
  it('should handle HTML with multiple attributes', () => {
    const html = '<label for="id" autocomplete="off" tabindex="1"></label>';
    const result = convert(html);
    expect(result).toContain('htmlFor');
    expect(result).toContain('autoComplete');
    expect(result).toContain('tabIndex');
  });
  it('should handle HTML with style and class', () => {
    const html = '<div class="x" style="color: blue;"></div>';
    const result = convert(html);
    expect(result).toContain('className');
    expect(result).toContain('style={');
  });
});
describe('wrapIntoDiv', () => {
  it('should wrap HTML into a div', () => {
    expect(wrapIntoDiv('<span>Test</span>')).toBe('<div><span>Test</span></div>');
  });
});

describe('cssToObject', () => {
  it('should convert CSS string to object', () => {
    expect(cssToObject('color: red; font-size: 12px;')).toBe('{color: "red", fontSize: "12px"}');
  });
  it('should handle empty CSS string', () => {
    expect(cssToObject('')).toBe('{}');
  });
});



describe('toCamelCase', () => {
  it('should convert kebab-case to camelCase', () => {
    expect(toCamelCase('font-size')).toBe('fontSize');
    expect(toCamelCase('background_color')).toBe('backgroundColor');
    expect(toCamelCase('border radius')).toBe('borderRadius');
  });
});

describe('convertStyleToObject', () => {
  it('should convert style attribute to JSX object', () => {
    expect(convertStyleToObject('<div style="color: red;">')).toContain('style={');
  });
});

describe('imageFix', () => {
  it('should remove closing img tags', () => {
    expect(imageFix('<img src="a.jpg"></img>')).toBe('<img src="a.jpg">');
  });
});
  describe('Stress Test: Diverse HTML Inputs', () => {
    const stressCases = [
      // Simple tags
      '<div>Hello</div>',
      // Nested tags
      '<div><span><b>Bold</b></span><i>Italic</i></div>',
      // Self-closing tags
      '<img src="a.jpg"/><br/><hr/>',
      // Large input
      '<ul>' + '<li>Item</li>'.repeat(1000) + '</ul>',
      // Invalid HTML
      '<div><span>Missing close',
      // Comments and unsupported attributes
      '<!--comment--><svg xmlns:xlink="http://www.w3.org/1999/xlink"></svg>',
      // Mixed case and attributes
      '<LaBeL FOR="id" autocomplete="off" tabindex="1"></LaBeL>',
      // Style and class
      '<div class="x" style="color: blue; font-size: 14px;"></div>',
      // Deeply nested
      '<div>' + '<span>'.repeat(50) + 'end' + '</span>'.repeat(50) + '</div>',
      // Special characters
      '<p>&amp; &lt; &gt; &quot; &#39;</p>',
      // Script/style tags
      '<script>alert("x")</script><style>.x{color:red;}</style>',
      // SVG with attributes
      '<svg stroke-width="2" stroke-linejoin="round"></svg>',
      // Table structure
      '<table><tr><td>Cell</td></tr></table>',
      // Form elements
      '<form><input type="text"/><button>Go</button></form>',
      // Large attribute set
      '<div ' + Array(50).fill('data-x="1"').join(' ') + '></div>',
      // Unusual whitespace
      '<div>   <span>   spaced   </span>   </div>',
      // HTML entities
      '<div>&#169; &#x1F600;</div>',
      // Multiple root elements
      '<div>One</div><div>Two</div>',
      // Empty input
      '',
    ];

    stressCases.forEach((html, idx) => {
      it(`should robustly convert stress case #${idx + 1}`, () => {
        expect(() => convert(html)).not.toThrow();
        const result = convert(html);
        expect(typeof result).toBe('string');
        // For non-empty input, result should not be empty
        if (html) expect(result.length).toBeGreaterThan(0);
      });
    });
  });

