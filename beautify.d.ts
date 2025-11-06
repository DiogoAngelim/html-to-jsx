declare module 'beautify' {
  interface BeautifyOptions {
    format?: 'html' | 'css' | 'js';
  }
  function beautify(text: string, options?: BeautifyOptions): string;
  export = beautify;
}