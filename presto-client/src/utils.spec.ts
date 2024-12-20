import { parseWithBigInts } from './utils'

describe('parse big ints', () => {
  it('can be plugged into JSON.parse', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const primitiveNumber = JSON.parse('123', parseWithBigInts)
    expect(primitiveNumber).toBe(123)

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const parsedObject = JSON.parse('{"key": "value"}', parseWithBigInts)
    expect(parsedObject).toHaveProperty('key')
    expect(parsedObject.key).toBe('value')
  })

  it('parses when the JSON.parse reviver context is available', () => {
    const parsedValue = parseWithBigInts('key', Number.MAX_SAFE_INTEGER, {
      source: Number.MIN_SAFE_INTEGER.toString(),
    })
    expect(parsedValue).toBe(Number.MAX_SAFE_INTEGER)
  })

  it('parses when the JSON.parse reviver context is not available', () => {
    const parsedValue = parseWithBigInts('key', Number.MAX_SAFE_INTEGER, undefined)
    expect(parsedValue).toBe(Number.MAX_SAFE_INTEGER)
  })

  it('parses big integers when JSON.parse reviver context is available', () => {
    const largeNumberAsBigInt = BigInt(Number.MAX_SAFE_INTEGER) + 2n
    const largeNumberAsNumber = Number.MAX_SAFE_INTEGER + 2
    const parsedValue = parseWithBigInts('key', largeNumberAsNumber, {
      source: largeNumberAsBigInt.toString(),
    })
    expect(typeof parsedValue).toEqual('bigint')
    expect(parsedValue).toEqual(largeNumberAsBigInt)
  })
})
