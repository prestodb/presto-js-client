/**
 * Parses a JSON including bigger numbers into BigInts
 * @param _ Key
 * @param value Parsed value
 * @param context Context with source text
 * @returns Parsed object with BigInts where required
 */
export function parseWithBigInts(_: string, value: unknown, { source }: { source: string }) {
  // Ignore non-numbers
  if (typeof value !== 'number') return value

  // If not an integer, use the value
  // TODO: Check if Presto can return floats that could also lose precision
  if (!Number.isInteger(value)) return value

  // If number is a safe integer, we can use it
  if (Number.isSafeInteger(value)) return value

  return BigInt(source)
}

/**
 * Checks if JSON.parse reviver callback has a context parameter
 * See also:
 * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#browser_compatibility
 * - https://github.com/tc39/proposal-json-parse-with-source
 *
 * This implementation is based on suggestion here:
 * - https://github.com/tc39/proposal-json-parse-with-source/issues/40
 */
export function isJsonParseContextAvailable() {
  let contextAvailable
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  JSON.parse('"x"', function (key, value, x) {
    contextAvailable = typeof x !== 'undefined'
  })
  return contextAvailable
}
