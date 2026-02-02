/**
 * Detect if we're on a mobile device
 */
export function isMobileDevice() {
  if (typeof window === 'undefined') return false
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

/**
 * Detect if we're on Android Chrome (best support for MWA)
 */
export function isAndroidChrome() {
  if (typeof window === 'undefined') return false
  const isAndroid = /Android/i.test(navigator.userAgent)
  const isChrome = /Chrome/i.test(navigator.userAgent) && !/Edg|OPR|Samsung/i.test(navigator.userAgent)
  return isAndroid && isChrome
}

/**
 * Ensure wallet is ready for transaction signing
 */
export async function ensureWalletReady(connected, publicKey, wallet) {
  if (!connected || !publicKey) {
    throw new Error('Wallet is not connected. Please connect your wallet first.')
  }

  if (!wallet) {
    throw new Error('Wallet is not available. Please ensure your wallet is open and unlocked.')
  }

  if (!wallet.signTransaction || typeof wallet.signTransaction !== 'function') {
    throw new Error('Wallet does not support transaction signing.')
  }

  return true
}
