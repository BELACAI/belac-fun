import { Transaction } from '@solana/web3.js'

/**
 * Sign and send a transaction from the backend
 * Uses mobile-safe pattern: signTransaction() + sendRawTransaction()
 */
export async function signAndSendTransaction(
  base64Transaction,
  connection,
  wallet
) {
  try {
    // Detect if we're on mobile
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    const isAndroidChrome = /Android.*Chrome/i.test(navigator.userAgent)

    // Convert base64 to Transaction
    const txBytes = Uint8Array.from(atob(base64Transaction), c => c.charCodeAt(0))
    const transaction = Transaction.from(txBytes)

    // CRITICAL: Refresh blockhash before signing
    // Use 'finalized' for mobile (~32s validity), 'confirmed' for desktop (~100ms)
    const commitment = isMobile ? 'finalized' : 'confirmed'
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash(commitment)

    transaction.recentBlockhash = blockhash
    transaction.lastValidBlockHeight = lastValidBlockHeight

    // Sign transaction
    if (!wallet || !wallet.signTransaction) {
      throw new Error('Wallet not connected or does not support signing')
    }

    const signed = await wallet.signTransaction(transaction)

    // Send as raw transaction
    const signature = await connection.sendRawTransaction(signed.serialize(), {
      skipPreflight: false,
      maxRetries: 3,
    })

    // Confirm transaction
    await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    }, 'confirmed')

    return signature
  } catch (error) {
    // User rejection
    if (error.code === 4001 || error.message?.includes('rejected')) {
      throw new Error('Transaction rejected by user')
    }

    // Connection issues
    if (error.message?.includes('not connected')) {
      throw new Error('Wallet not connected. Please connect first.')
    }

    // Blockhash expired
    if (error.message?.includes('Blockhash not found')) {
      throw new Error('Transaction expired. Please try again.')
    }

    // Insufficient funds
    if (error.message?.includes('insufficient funds')) {
      throw new Error('Insufficient balance for transaction fee.')
    }

    throw error
  }
}
