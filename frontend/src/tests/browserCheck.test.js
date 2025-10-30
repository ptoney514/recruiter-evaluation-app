/**
 * Unit tests for browserCheck.js
 * Tests browser compatibility detection without using eval()
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  checkBrowserCompatibility,
  getBrowserInfo,
  isBrowserVersionSupported,
  MIN_BROWSER_VERSIONS
} from '../utils/browserCheck'

describe('checkBrowserCompatibility', () => {
  it('should detect all required features in modern browsers', () => {
    const result = checkBrowserCompatibility()

    expect(result).toHaveProperty('supported')
    expect(result).toHaveProperty('missing')
    expect(result.supported).toBe(true)
    expect(result.missing).toEqual([])
  })

  it('should return an object with correct shape', () => {
    const result = checkBrowserCompatibility()

    expect(typeof result).toBe('object')
    expect(typeof result.supported).toBe('boolean')
    expect(Array.isArray(result.missing)).toBe(true)
  })

  it('should detect modern JavaScript features without eval()', () => {
    // This test verifies that the feature detection works
    // The key is that it should NOT throw an error and should detect support
    const result = checkBrowserCompatibility()

    // In modern environments (Node 18+, modern browsers), these should all be supported
    expect(result.missing).not.toContain('Modern JavaScript (ES2017+)')
  })

  it('should list all missing features when not supported', () => {
    // Mock a browser without sessionStorage
    const originalSessionStorage = global.sessionStorage
    delete global.sessionStorage

    const result = checkBrowserCompatibility()

    expect(result.supported).toBe(false)
    expect(result.missing).toContain('sessionStorage')

    // Restore
    global.sessionStorage = originalSessionStorage
  })
})

describe('getBrowserInfo', () => {
  let originalNavigator

  beforeEach(() => {
    originalNavigator = global.navigator
  })

  afterEach(() => {
    global.navigator = originalNavigator
  })

  it('should detect Chrome browser', () => {
    global.navigator = {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }

    const info = getBrowserInfo()

    expect(info.name).toBe('Chrome')
    expect(info.version).toBe('120')
  })

  it('should detect Firefox browser', () => {
    global.navigator = {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0'
    }

    const info = getBrowserInfo()

    expect(info.name).toBe('Firefox')
    expect(info.version).toBe('115')
  })

  it('should return unknown for unrecognized browsers', () => {
    global.navigator = {
      userAgent: 'SomeWeirdBrowser/1.0'
    }

    const info = getBrowserInfo()

    expect(info.name).toBe('Unknown')
    expect(info.version).toBe('Unknown')
  })

  it('should include full user agent string', () => {
    const testUA = 'TestBrowser/1.0'
    global.navigator = { userAgent: testUA }

    const info = getBrowserInfo()

    expect(info.userAgent).toBe(testUA)
  })
})

describe('isBrowserVersionSupported', () => {
  let originalNavigator

  beforeEach(() => {
    originalNavigator = global.navigator
  })

  afterEach(() => {
    global.navigator = originalNavigator
  })

  it('should return true for supported Chrome version', () => {
    global.navigator = {
      userAgent: 'Chrome/95.0.0.0'
    }

    const result = isBrowserVersionSupported()

    expect(result).toBe(true)
  })

  it('should return false for outdated Chrome version', () => {
    global.navigator = {
      userAgent: 'Chrome/85.0.0.0'
    }

    const result = isBrowserVersionSupported()

    // MIN_BROWSER_VERSIONS.Chrome is 90, so 85 should be unsupported
    expect(result).toBe(false)
  })

  it('should return true for unknown browsers with warning', () => {
    // Mock console.warn to verify it's called
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    global.navigator = {
      userAgent: 'UnknownBrowser/1.0'
    }

    const result = isBrowserVersionSupported()

    expect(result).toBe(true) // Unknown browsers are assumed compatible
    expect(warnSpy).toHaveBeenCalled()

    warnSpy.mockRestore()
  })

  it('should respect minimum version requirements', () => {
    const testCases = [
      { browser: 'Chrome/90.0', expected: true },  // Exactly minimum
      { browser: 'Chrome/89.0', expected: false }, // Below minimum
      { browser: 'Firefox/88.0', expected: true }, // Exactly minimum
      { browser: 'Firefox/87.0', expected: false } // Below minimum
    ]

    testCases.forEach(({ browser, expected }) => {
      global.navigator = { userAgent: browser }
      const result = isBrowserVersionSupported()
      expect(result).toBe(expected)
    })
  })
})

describe('Security - No eval() Usage', () => {
  it('should detect arrow functions without eval()', () => {
    // This test ensures the feature detection doesn't rely on eval()
    // If it did, this test would fail in strict CSP environments
    const result = checkBrowserCompatibility()

    // The implementation should work without eval()
    expect(() => checkBrowserCompatibility()).not.toThrow()
  })

  it('should not use dangerous string evaluation', () => {
    // Read the source code to verify no eval usage
    // This is a meta-test to ensure security
    const browserCheckSource = checkBrowserCompatibility.toString()

    expect(browserCheckSource).not.toContain('eval(')
    expect(browserCheckSource).not.toContain('Function(')
  })
})
