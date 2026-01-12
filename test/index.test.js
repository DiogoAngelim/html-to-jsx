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
  indentAllLines,
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

describe('indentAllLines', () => {
  it('should beautify HTML', () => {
    expect(indentAllLines('<div><span>Test</span></div>')).toContain('\n');
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

