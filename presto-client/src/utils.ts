/**
 * Parses a JSON including bigger numbers into BigInts
 * This function checks if JSON.parse reviver callback has a context parameter
 * and falls back onto the default parsing if not.
 * See also:
 * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#browser_compatibility
 * - https://github.com/tc39/proposal-json-parse-with-source
 * @param _ Key
 * @param value Parsed value
 * @param context Context with source text
 * @returns Parsed object with BigInts where required
 */
export function parseWithBigInts(_: string, value: unknown, context: { source: string }) {
  if (!context) return value // Context is not available, fallback to default parse
  const { source } = context
  if (!source) return value // Source is not available, fallback to default parse

  // Ignore non-numbers
  if (typeof value !== 'number') return value

  // If not an integer, use the value
  // TODO: Check if Presto can return floats that could also lose precision
  if (!Number.isInteger(value)) return value

  // If number is a safe integer, we can use it
  if (Number.isSafeInteger(value)) return value

  return BigInt(source)
}
