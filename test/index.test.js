import {
  closeSelfClosingTags,
  convertEventAttributesToCamelCase,
  convertClassToClassName,
  removeComments,
  validateHtml,
  convertInlineStyles
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
});
