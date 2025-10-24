/**
 * Browser compatibility checks
 * Ensures required features are available before app runs
 */

/**
 * Check if all required browser features are supported
 * @returns {Object} { supported: boolean, missing: string[] }
 */
export function checkBrowserCompatibility() {
  const missing = []

  // Check for sessionStorage
  if (typeof sessionStorage === 'undefined') {
    missing.push('sessionStorage')
  }

  // Check for fetch API
  if (typeof fetch === 'undefined') {
    missing.push('fetch')
  }

  // Check for Promise
  if (typeof Promise === 'undefined') {
    missing.push('Promise')
  }

  // Check for ArrayBuffer (needed for PDF parsing)
  if (typeof ArrayBuffer === 'undefined') {
    missing.push('ArrayBuffer')
  }

  // Check for Blob (needed for file handling)
  if (typeof Blob === 'undefined') {
    missing.push('Blob')
  }

  // Check for FileReader
  if (typeof FileReader === 'undefined') {
    missing.push('FileReader')
  }

  // Check for modern JavaScript features
  try {
    // Check for arrow functions
    eval('() => {}')
    // Check for async/await
    eval('async () => {}')
    // Check for spread operator
    eval('[...[], {}]')
  } catch (e) {
    missing.push('Modern JavaScript (ES2017+)')
  }

  return {
    supported: missing.length === 0,
    missing
  }
}

/**
 * Get browser info for debugging
 * @returns {Object} Browser name and version
 */
export function getBrowserInfo() {
  const ua = navigator.userAgent
  let browserName = 'Unknown'
  let version = 'Unknown'

  // Detect browser
  if (ua.includes('Firefox/')) {
    browserName = 'Firefox'
    version = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown'
  } else if (ua.includes('Edg/')) {
    browserName = 'Edge'
    version = ua.match(/Edg\/(\d+)/)?.[1] || 'Unknown'
  } else if (ua.includes('Chrome/')) {
    browserName = 'Chrome'
    version = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown'
  } else if (ua.includes('Safari/')) {
    browserName = 'Safari'
    version = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown'
  }

  return {
    name: browserName,
    version,
    userAgent: ua
  }
}

/**
 * Minimum browser versions required
 */
export const MIN_BROWSER_VERSIONS = {
  Chrome: 90,
  Firefox: 88,
  Safari: 14,
  Edge: 90
}

/**
 * Check if browser version meets minimum requirements
 * @returns {boolean} True if browser is supported
 */
export function isBrowserVersionSupported() {
  const { name, version } = getBrowserInfo()
  const minVersion = MIN_BROWSER_VERSIONS[name]

  if (!minVersion) {
    // Unknown browser - assume compatible but warn
    console.warn(`Unknown browser: ${name}. App may not work correctly.`)
    return true
  }

  const versionNumber = parseInt(version, 10)
  return versionNumber >= minVersion
}

/**
 * Display browser compatibility warning to user
 */
export function showCompatibilityWarning() {
  const { supported, missing } = checkBrowserCompatibility()
  const { name, version } = getBrowserInfo()
  const versionOk = isBrowserVersionSupported()

  if (!supported) {
    const message = `Your browser is missing required features:\n\n${missing.join('\n')}\n\nPlease use a modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)`
    alert(message)
    return false
  }

  if (!versionOk) {
    const minVersion = MIN_BROWSER_VERSIONS[name]
    const message = `Your ${name} version (${version}) is outdated.\n\nMinimum required: ${name} ${minVersion}\n\nPlease update your browser for the best experience.`
    console.warn(message)
    // Don't block - just warn
  }

  return true
}
