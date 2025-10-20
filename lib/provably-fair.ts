import crypto from 'crypto'

/**
 * Provably Fair Algorithm Implementation
 * Uses commit-reveal scheme with server + client seeds
 */

export interface SpinResult {
  resultValue: number // 0-1 normalized
  combinedHash: string
  serverSeed: string
  clientSeed: string
  nonce: number
}

/**
 * Generate a cryptographically secure random seed
 */
export function generateSeed(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Create hash from seeds and nonce
 */
export function createHash(serverSeed: string, clientSeed: string, nonce: number): string {
  const combined = `${serverSeed}:${clientSeed}:${nonce}`
  return crypto.createHash('sha256').update(combined).digest('hex')
}

/**
 * Convert hash to normalized 0-1 value
 */
export function hashToNumber(hash: string): number {
  // Take first 8 characters (32 bits)
  const subHash = hash.substring(0, 8)
  const decimal = parseInt(subHash, 16)
  const maxValue = parseInt('ffffffff', 16)
  return decimal / maxValue
}

/**
 * Generate provably fair spin result
 */
export function generateSpinResult(
  serverSeed: string,
  clientSeed: string,
  nonce: number
): SpinResult {
  const combinedHash = createHash(serverSeed, clientSeed, nonce)
  const resultValue = hashToNumber(combinedHash)

  return {
    resultValue,
    combinedHash,
    serverSeed,
    clientSeed,
    nonce,
  }
}

/**
 * Verify a spin result
 */
export function verifySpinResult(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  expectedHash: string,
  expectedValue: number
): boolean {
  const result = generateSpinResult(serverSeed, clientSeed, nonce)
  return (
    result.combinedHash === expectedHash &&
    Math.abs(result.resultValue - expectedValue) < 0.000001
  )
}

/**
 * Select wheel option based on result value and weights
 */
export function selectOptionByWeight(
  resultValue: number,
  options: Array<{ id: string; weight: number }>
): string {
  // Calculate total weight
  const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0)

  // Normalize weights to 0-1 range
  const normalizedOptions = options.map((opt) => ({
    id: opt.id,
    threshold: opt.weight / totalWeight,
  }))

  // Find selected option
  let cumulative = 0
  for (const option of normalizedOptions) {
    cumulative += option.threshold
    if (resultValue <= cumulative) {
      return option.id
    }
  }

  // Fallback to last option (should never happen)
  return options[options.length - 1].id
}

/**
 * Calculate win probability for an option
 */
export function calculateProbability(
  optionWeight: number,
  totalWeight: number
): number {
  return (optionWeight / totalWeight) * 100
}

/**
 * Generate client seed (can be user-provided or random)
 */
export function generateClientSeed(userInput?: string): string {
  if (userInput && userInput.length >= 8) {
    return crypto.createHash('sha256').update(userInput).digest('hex')
  }
  return generateSeed()
}

/**
 * Pre-commit server seed (hash it before revealing)
 */
export function commitServerSeed(serverSeed: string): string {
  return crypto.createHash('sha256').update(serverSeed).digest('hex')
}
