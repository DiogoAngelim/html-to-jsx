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

    it('should handle empty input', () => {
      const html = '';
      const expected = '';
      expect(closeSelfClosingTags(html)).toBe(expected);
    });

    it('should throw TypeError for invalid input', () => {
      expect(() => closeSelfClosingTags(123)).toThrow(TypeError);
    });

    it('should not match partial tag names - colgroup should not match col', () => {
      const html = '<colgroup><col>';
      const expected = '<colgroup><col/>';
      expect(closeSelfClosingTags(html)).toBe(expected);
    });

    it('should not match partial tag names - inputmode should not match input', () => {
      const html = '<div inputmode="numeric"><input>';
      const expected = '<div inputmode="numeric"><input/>';
      expect(closeSelfClosingTags(html)).toBe(expected);
    });

    it('should correctly handle col tag with attributes', () => {
      const html = '<col span="2" style="width: 50%">';
      const expected = '<col span="2" style="width: 50%"/>';
      expect(closeSelfClosingTags(html)).toBe(expected);
    });

    it('should correctly handle colgroup with nested col tags', () => {
      const html = '<colgroup><col span="2"><col></colgroup>';
      const expected = '<colgroup><col span="2"/><col/></colgroup>';
      expect(closeSelfClosingTags(html)).toBe(expected);
    });

    it('should handle self-closing tags with attributes', () => {
      const html = '<input type="text" name="username"><img src="image.jpg" alt="test">';
      const expected = '<input type="text" name="username"/><img src="image.jpg" alt="test"/>';
      expect(closeSelfClosingTags(html)).toBe(expected);
    });
  });

  describe('convertEventAttributesToCamelCase', () => {
    it('should convert event attributes to camel case correctly', () => {
      const html = '<button onclick="handleClick">Click me</button>';
      const expected = '<button onClick={handleClick}>Click me</button>';
      expect(convertEventAttributesToCamelCase(html)).toBe(expected);
    });

    it('should handle multiple event attributes', () => {
      const html = '<input onchange="handleChange" onclick="handleClick">';
      const expected = '<input onChange={handleChange} onClick={handleClick}>';
      expect(convertEventAttributesToCamelCase(html)).toBe(expected);
    });

    it('should handle empty input', () => {
      const html = '';
      const expected = '';
      expect(convertEventAttributesToCamelCase(html)).toBe(expected);
    });

    it('should throw TypeError for invalid input', () => {
      expect(() => convertEventAttributesToCamelCase(123)).toThrow(TypeError);
    });
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
describe('wrapIntoDiv', () => {
  const { wrapIntoDiv } = require('../index.js');
  it('should wrap HTML into a div', () => {
    expect(wrapIntoDiv('<span>Test</span>')).toBe('<div><span>Test</span></div>');
  });
});

describe('cssToObject', () => {
  const fn = require('../index.js').cssToObject;
  it('should convert CSS string to object', () => {
    expect(fn('color: red; font-size: 12px;')).toBe('{color: "red", fontSize: "12px"}');
  });
  it('should handle empty CSS string', () => {
    expect(fn('')).toBe('{}');
  });
});

describe('indentAllLines', () => {
  const fn = require('../index.js').indentAllLines;
  it('should beautify HTML', () => {
    expect(fn('<div><span>Test</span></div>')).toContain('\n');
  });
});

describe('toCamelCase', () => {
  const { toCamelCase } = require('../index.js');
  it('should convert kebab-case to camelCase', () => {
    expect(toCamelCase('font-size')).toBe('fontSize');
    expect(toCamelCase('background_color')).toBe('backgroundColor');
    expect(toCamelCase('border radius')).toBe('borderRadius');
  });
});

describe('convertStyleToObject', () => {
  const { convertStyleToObject } = require('../index.js');
  it('should convert style attribute to JSX object', () => {
    expect(convertStyleToObject('<div style="color: red;">')).toContain('style={');
  });
});

describe('imageFix', () => {
  const { imageFix } = require('../index.js');
  it('should remove closing img tags', () => {
    expect(imageFix('<img src="a.jpg"></img>')).toBe('<img src="a.jpg">');
  });
});

describe('removeInvalidTags', () => {
  const { removeInvalidTags } = require('../index.js');
  it('should remove DOCTYPE tags', () => {
    expect(removeInvalidTags('<!DOCTYPE html><div></div>')).toBe('<div></div>');
  });
});

describe('removeUnsuportedAttrs', () => {
  const { removeUnsuportedAttrs } = require('../index.js');
  it('should remove unsupported xmlns:xlink attribute', () => {
    expect(removeUnsuportedAttrs('<svg xmlns:xlink="http://www.w3.org/1999/xlink"></svg>')).toBe('<svg ></svg>');
  });
});

describe('validateInput', () => {
  const fn = require('../index.js').validateInput;
  it('should throw TypeError for non-string input', () => {
    expect(() => fn(123)).toThrow(TypeError);
  });
  it('should throw TypeError for empty string', () => {
    expect(() => fn('')).toThrow(TypeError);
  });
});

describe('isTagClosed', () => {
  const fn = require('../index.js').isTagClosed;
  it('should return false for self-closing tag', () => {
    expect(fn('img')).toBe(false);
  });
  it('should return true for closing tag', () => {
    expect(fn('div')).toBe(true);
  });
});

describe('validateTag', () => {
  const { validateTag } = require('../index.js');
  it('should throw error for unclosed tag', () => {
    expect(() => validateTag('img')).toThrow(Error);
  });
  it('should not throw for closed tag', () => {
    expect(() => validateTag('div')).not.toThrow();
  });
});

describe('validateTags', () => {
  const { validateTags } = require('../index.js');
  it('should throw error for HTML with unclosed tag', () => {
    expect(() => validateTags('<img>')).toThrow(Error);
  });
  it('should not throw for HTML with closed tag', () => {
    expect(() => validateTags('<div></div>')).not.toThrow();
  });
});



describe('convert (default export)', () => {
  const convert = require('../index.js').default;
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
