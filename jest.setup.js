// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Polyfill TransformStream for jsdom environment
if (typeof global.TransformStream === 'undefined') {
  const { Readable, Transform } = require('stream');
  global.TransformStream = class TransformStream {
    constructor(transformer) {
      this.transformer = transformer;
    }
  };
}

// Mock scrollIntoView for jsdom (only in jsdom environment)
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = jest.fn();
}
