// Polyfills for browser compatibility
import { Buffer } from 'buffer'

// Make Buffer available globally
window.Buffer = Buffer
globalThis.Buffer = Buffer

// Polyfill process.env for libraries that expect it
if (typeof process === 'undefined') {
  window.process = {
    env: {},
  }
  globalThis.process = window.process
}
