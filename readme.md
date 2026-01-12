### Overview
<!-- Badges -->
![Build Status](https://github.com/DiogoAngelim/html-to-jsx/actions/workflows/publish.yml/badge.svg?t=1)
 [![Coverage Status](https://coveralls.io/repos/github/DiogoAngelim/html-to-jsx/badge.svg?branch=main&t=1)](https://coveralls.io/github/DiogoAngelim/html-to-jsx?branch=main&t=1)
![License](https://img.shields.io/github/license/DiogoAngelim/html-to-jsx?style=flat)

This HTML to JSX Library provides functions to manipulate and transform HTML strings in JavaScript. It has utilities to wrap HTML content, close self-closing tags, convert event attributes to camel case, convert class attributes to className, remove HTML comments, indent HTML code, convert inline styles to objects, and validate HTML structure.

### Installation

To use the HTML Converter Library in your project, you can install it via npm:

`npm install node-html-to-jsx`

### Usage

Import the library into your JavaScript file:

```JavaScript
import convert from 'node-html-to-jsx';
```

Then, you can use the convert function to transform your HTML code:

```JavaScript
const convertedHTML = convert('<div><p class="paragraph">Hello, world!</p></div>');
```

### Demo

See [DEMO](https://diogoangelim.github.io/html-to-jsx-demo/)

### Note

This library is primarily designed for manipulating HTML strings in JavaScript environments, particularly for use with frameworks like React.

### License

This library is open-source and available under the MIT License.

### Contributions

Contributions to the library are welcome. You can contribute by forking the repository and submitting a pull request with your changes.
