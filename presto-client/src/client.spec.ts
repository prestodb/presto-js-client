import { PrestoClient } from './client'
import { PrestoError, PrestoColumn, PrestoResponse, PrestoErrorObject } from './types'

// Mock fetch globally for testing
global.fetch = jest.fn()

// Type definitions for test mocks
interface MockResponse {
  status: number
  json: jest.Mock
  text?: jest.Mock
}

interface MockErrorResponse {
  status: number
  text: jest.Mock
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MockPrestoClient = any

// Helper function to create mock PrestoResponse
function createMockPrestoResponse(partial: Partial<PrestoResponse>): PrestoResponse {
  return {
    id: '',
    nextUri: undefined,
    columns: [],
    data: [],
    error: undefined as unknown as PrestoError,
    stats: { state: 'FINISHED' },
    updateType: '',
    ...partial,
  }
}

describe('PrestoClient', () => {
  describe('Header Configuration', () => {
    it('should set default headers correctly', () => {
      const client = new PrestoClient({
        host: 'localhost',
        port: 8080,
        user: 'testuser',
      })

      // Access private headers property for testing
      const headers = (client as MockPrestoClient).headers

      expect(headers['X-Presto-Client-Info']).toBe('presto-js-client')
      expect(headers['X-Presto-Source']).toBe('presto-js-client')
      expect(headers['X-Presto-User']).toBe('testuser')
    })

    it('should set custom source in X-Presto-Source header when provided', () => {
      const client = new PrestoClient({
        host: 'localhost',
        port: 8080,
        user: 'testuser',
        source: 'my-custom-app',
      })

      const headers = (client as MockPrestoClient).headers

      expect(headers['X-Presto-Source']).toBe('my-custom-app')
    })

    it('should set X-Presto-Time-Zone header when timezone is provided', () => {
      const client = new PrestoClient({
        host: 'localhost',
        port: 8080,
        user: 'testuser',
        timezone: 'America/New_York',
      })

      const headers = (client as MockPrestoClient).headers

      expect(headers['X-Presto-Time-Zone']).toBe('America/New_York')
    })

    it('should not set X-Presto-Time-Zone header when timezone is not provided', () => {
      const client = new PrestoClient({
        host: 'localhost',
        port: 8080,
        user: 'testuser',
      })

      const headers = (client as MockPrestoClient).headers

      expect(headers['X-Presto-Time-Zone']).toBeUndefined()
    })

    it('should set Authorization header with Bearer token when authorizationToken is provided', () => {
      const client = new PrestoClient({
        host: 'localhost',
        port: 8080,
        user: 'testuser',
        authorizationToken: 'my-secret-token',
      })

      const headers = (client as MockPrestoClient).headers

      expect(headers['Authorization']).toBe('Bearer my-secret-token')
    })

    it('should set Authorization header with Basic auth when basicAuthentication is provided', () => {
      const client = new PrestoClient({
        host: 'localhost',
        port: 8080,
        user: 'testuser',
        basicAuthentication: {
          user: 'authuser',
          password: 'authpass',
        },
      })

      const headers = (client as MockPrestoClient).headers
      const expectedAuth = Buffer.from('authuser:authpass').toString('base64')

      expect(headers['Authorization']).toBe(`Basic ${expectedAuth}`)
    })

    it('should prioritize authorizationToken over basicAuthentication', () => {
      const client = new PrestoClient({
        host: 'localhost',
        port: 8080,
        user: 'testuser',
        authorizationToken: 'my-token',
        basicAuthentication: {
          user: 'authuser',
          password: 'authpass',
        },
      })

      const headers = (client as MockPrestoClient).headers

      expect(headers['Authorization']).toBe('Bearer my-token')
    })

    it('should merge extraHeaders with default headers', () => {
      const client = new PrestoClient({
        host: 'localhost',
        port: 8080,
        user: 'testuser',
        extraHeaders: {
          'Custom-Header': 'custom-value',
          'X-Custom-Id': '12345',
        },
      })

      const headers = (client as MockPrestoClient).headers

      expect(headers['Custom-Header']).toBe('custom-value')
      expect(headers['X-Custom-Id']).toBe('12345')
      expect(headers['X-Presto-Client-Info']).toBe('presto-js-client')
      expect(headers['X-Presto-User']).toBe('testuser')
    })

    it('should allow default headers to override extraHeaders when there are conflicts', () => {
      const client = new PrestoClient({
        host: 'localhost',
        port: 8080,
        user: 'testuser',
        extraHeaders: {
          'X-Presto-User': 'overridden-user',
          'X-Presto-Source': 'overridden-source',
        },
      })

      const headers = (client as MockPrestoClient).headers

      // Default headers should take precedence
      expect(headers['X-Presto-User']).toBe('testuser')
      expect(headers['X-Presto-Source']).toBe('presto-js-client')
    })

    it('should handle empty extraHeaders object', () => {
      const client = new PrestoClient({
        host: 'localhost',
        port: 8080,
        user: 'testuser',
        extraHeaders: {},
      })

      const headers = (client as MockPrestoClient).headers

      expect(headers['X-Presto-Client-Info']).toBe('presto-js-client')
      expect(headers['X-Presto-User']).toBe('testuser')
    })

    it('should handle all header options together', () => {
      const client = new PrestoClient({
        host: 'localhost',
        port: 8080,
        user: 'testuser',
        source: 'test-app',
        timezone: 'UTC',
        authorizationToken: 'test-token',
        extraHeaders: {
          'Custom-Header': 'test-value',
        },
      })

      const headers = (client as MockPrestoClient).headers

      expect(headers['X-Presto-Client-Info']).toBe('presto-js-client')
      expect(headers['X-Presto-Source']).toBe('test-app')
      expect(headers['X-Presto-User']).toBe('testuser')
      expect(headers['X-Presto-Time-Zone']).toBe('UTC')
      expect(headers['Authorization']).toBe('Bearer test-token')
      expect(headers['Custom-Header']).toBe('test-value')
    })
  })

  describe('Query Method', () => {
    let client: MockPrestoClient
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

    beforeEach(() => {
      client = new PrestoClient({
        host: 'localhost',
        port: 8080,
        user: 'testuser',
        catalog: 'test_catalog',
        schema: 'test_schema',
      }) as MockPrestoClient
      mockFetch.mockClear()

      // Mock parseWithBigInts to return the response as-is for testing
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(client, 'prestoConversionToJSON').mockImplementation(async ({ response }: any) => {
        const responseJson = await response.json()
        return createMockPrestoResponse({ ...responseJson })
      })
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should execute a successful query and return results', async () => {
      const mockQueryId = 'test-query-id-123'
      const mockColumns: PrestoColumn[] = [
        { name: 'id', type: 'integer' },
        { name: 'name', type: 'varchar' },
      ]
      const mockData: unknown[][] = [
        [1, 'Alice'],
        [2, 'Bob'],
      ]

      const mockFirstResponse: MockResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue({
          id: mockQueryId,
          nextUri: 'http://localhost:8080/v1/statement/executing/test-query-id-123/1', // Indicates query is complete
          columns: mockColumns,
          data: mockData,
        } as Partial<PrestoResponse>),
      }

      // Mock the follow-up GET request (queryResult)
      const mockSecondResponse: MockResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue({
          id: mockQueryId,
          nextUri: undefined, // Indicates query is complete
          columns: mockColumns,
          data: mockData,
        } as Partial<PrestoResponse>),
      }

      mockFetch
        .mockResolvedValueOnce(mockFirstResponse as unknown as Response)
        .mockResolvedValueOnce(mockSecondResponse as unknown as Response)

      const result = await client.query('SELECT id, name FROM users')

      expect(result).toEqual({
        columns: mockColumns,
        data: mockData,
        queryId: mockQueryId,
      })

      // Verify the requests were made correctly
      expect(mockFetch).toHaveBeenCalledTimes(2)

      // Check first request (POST)
      expect(mockFetch).toHaveBeenNthCalledWith(1, 'localhost:8080/v1/statement', {
        body: 'SELECT id, name FROM users',
        headers: expect.objectContaining({
          'X-Presto-Catalog': 'test_catalog',
          'X-Presto-Client-Info': 'presto-js-client',
          'X-Presto-Schema': 'test_schema',
          'X-Presto-Source': 'presto-js-client',
          'X-Presto-User': 'testuser',
        }),
        method: 'POST',
      })

      // Check second request (GET)
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        'http://localhost:8080/v1/statement/executing/test-query-id-123/1',
        {
          method: 'GET',
          headers: expect.objectContaining({
            'X-Presto-User': 'testuser',
            'X-Presto-Catalog': 'test_catalog',
            'X-Presto-Schema': 'test_schema',
          }),
        },
      )
    })

    it('should handle query with custom catalog and schema options', async () => {
      const mockQueryId = 'test-query-id-456'
      const mockColumns: PrestoColumn[] = [{ name: 'count', type: 'integer' }]
      const mockData: unknown[][] = [[42]]

      const mockFirstResponse: MockResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue({
          id: mockQueryId,
          nextUri: 'http://localhost:8080/v1/statement/executing/test-query-id-456/1',
        } as Partial<PrestoResponse>),
      }

      const mockSecondResponse: MockResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue({
          id: mockQueryId,
          nextUri: undefined,
          columns: mockColumns,
          data: mockData,
        } as Partial<PrestoResponse>),
      }

      mockFetch
        .mockResolvedValueOnce(mockFirstResponse as unknown as Response)
        .mockResolvedValueOnce(mockSecondResponse as unknown as Response)

      const result = await client.query('SELECT COUNT(*) FROM custom_table', {
        catalog: 'custom_catalog',
        schema: 'custom_schema',
      })

      expect(result).toEqual({
        columns: mockColumns,
        data: mockData,
        queryId: mockQueryId,
      })

      // Verify custom catalog and schema were used
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        'localhost:8080/v1/statement',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'X-Presto-Catalog': 'custom_catalog',
            'X-Presto-Schema': 'custom_schema',
          }),
          body: 'SELECT COUNT(*) FROM custom_table',
        }),
      )
    })

    it('should handle server overload (503) and retry', async () => {
      const mockQueryId = 'test-query-id-retry'
      const mockColumns: PrestoColumn[] = [{ name: 'result', type: 'varchar' }]
      const mockData: unknown[][] = [['success']]

      const mockFirstResponse: MockResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue({
          id: mockQueryId,
          nextUri: 'http://localhost:8080/v1/statement/executing/test-query-id-retry/1',
        } as Partial<PrestoResponse>),
      }

      // First GET returns 503, second GET succeeds
      const mock503Response: Partial<MockResponse> = { status: 503 }
      const mockSuccessResponse: MockResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue({
          id: mockQueryId,
          nextUri: undefined,
          columns: mockColumns,
          data: mockData,
        } as Partial<PrestoResponse>),
      }

      // Mock delay to avoid actual waiting in tests
      jest.spyOn(client, 'delay').mockResolvedValue(undefined)

      mockFetch
        .mockResolvedValueOnce(mockFirstResponse as unknown as Response)
        .mockResolvedValueOnce(mock503Response as unknown as Response)
        .mockResolvedValueOnce(mockSuccessResponse as unknown as Response)

      const result = await client.query("SELECT 'success' as result")

      expect(result.data).toEqual(mockData)
      expect(mockFetch).toHaveBeenCalledTimes(3) // POST + 503 GET + successful GET
      expect(client.delay).toHaveBeenCalledWith(500) // retryInterval default
    })

    it('should throw PrestoError when query returns an error', async () => {
      const mockQueryId = 'test-query-id-error'
      const mockError: PrestoErrorObject = {
        errorCode: 1,
        errorName: 'SYNTAX_ERROR',
        errorType: 'USER_ERROR',
        message: "line 1:8: Column 'invalid_column' cannot be resolved",
        name: 'PrestoError',
        failureInfo: {
          message: "Column 'invalid_column' cannot be resolved",
          stack: ['com.facebook.presto.sql.analyzer.SemanticException'],
          suppressed: [],
          type: 'com.facebook.presto.sql.analyzer.SemanticException',
        },
      }

      const mockFirstResponse: MockResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue({
          id: mockQueryId,
          nextUri: 'http://localhost:8080/v1/statement/executing/test-query-id-error/1',
        } as Partial<PrestoResponse>),
      }

      const mockErrorResponse: MockResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue({
          id: mockQueryId,
          nextUri: undefined,
          error: mockError,
        } as Partial<PrestoResponse>),
      }

      mockFetch
        .mockResolvedValueOnce(mockFirstResponse as unknown as Response)
        .mockResolvedValueOnce(mockErrorResponse as unknown as Response)
        // Second call
        .mockResolvedValueOnce(mockFirstResponse as unknown as Response)
        .mockResolvedValueOnce(mockErrorResponse as unknown as Response)

      await expect(client.query('SELECT invalid_column FROM users')).rejects.toThrow(PrestoError)

      try {
        await client.query('SELECT invalid_column FROM users')
      } catch (error) {
        expect(error).toBeInstanceOf(PrestoError)
        const prestoError = error as PrestoError
        expect(prestoError.errorCode).toBe(1)
        expect(prestoError.errorName).toBe('SYNTAX_ERROR')
        expect(prestoError.message).toBe("line 1:8: Column 'invalid_column' cannot be resolved")
      }
    })

    it('should throw error when first request fails', async () => {
      const mockErrorResponse: MockErrorResponse = {
        status: 400,
        text: jest.fn().mockResolvedValue('Bad Request'),
      }

      mockFetch.mockResolvedValueOnce(mockErrorResponse as unknown as Response)

      await expect(client.query('INVALID SQL')).rejects.toThrow('Query failed: "Bad Request"')
    })

    it('should throw error when follow-up request fails', async () => {
      const mockQueryId = 'test-query-id-fail'

      const mockFirstResponse: MockResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue({
          id: mockQueryId,
          nextUri: 'http://localhost:8080/v1/statement/executing/test-query-id-fail/1',
        } as Partial<PrestoResponse>),
      }

      const mockFailedResponse: MockErrorResponse = {
        status: 500,
        text: jest.fn().mockResolvedValue('Internal Server Error'),
      }

      mockFetch
        .mockResolvedValueOnce(mockFirstResponse as unknown as Response)
        .mockResolvedValueOnce(mockFailedResponse as unknown as Response)

      await expect(client.query('SELECT * FROM users')).rejects.toThrow(
        'Query failed: "Internal Server Error"',
      )
    })

    it('should throw error when first response has no nextUri', async () => {
      const mockFirstResponse: MockResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue({
          id: 'test-query-id',
          nextUri: undefined, // Missing nextUri
        } as Partial<PrestoResponse>),
      }

      mockFetch.mockResolvedValueOnce(mockFirstResponse as unknown as Response)

      await expect(client.query('SELECT 1')).rejects.toThrow("Didn't receive the first nextUri")
    })

    it('should throw error when query result response is empty', async () => {
      const mockQueryId = 'test-query-id-empty'

      const mockFirstResponse: MockResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue({
          id: mockQueryId,
          nextUri: 'http://localhost:8080/v1/statement/executing/test-query-id-empty/1',
        } as Partial<PrestoResponse>),
      }

      const mockSecondResponse: MockResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue(null), // Empty response
      }

      jest.spyOn(client, 'prestoConversionToJSON').mockResolvedValue(null)

      mockFetch
        .mockResolvedValueOnce(mockFirstResponse as unknown as Response)
        .mockResolvedValueOnce(mockSecondResponse as unknown as Response)

      await expect(client.query('SELECT 1')).rejects.toThrow(
        'Query failed with an empty response from the server.',
      )
    })

    it('should handle multiple data chunks in query result', async () => {
      const mockQueryId = 'test-query-id-chunks'
      const mockColumns: PrestoColumn[] = [{ name: 'id', type: 'integer' }]

      const mockFirstResponse: MockResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue({
          id: mockQueryId,
          nextUri: 'http://localhost:8080/v1/statement/executing/test-query-id-chunks/1',
        } as Partial<PrestoResponse>),
      }

      // First chunk with data and nextUri
      const mockChunk1Response: MockResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue({
          id: mockQueryId,
          nextUri: 'http://localhost:8080/v1/statement/executing/test-query-id-chunks/2',
          columns: mockColumns,
          data: [[1], [2]],
        } as Partial<PrestoResponse>),
      }

      // Second chunk with more data and no nextUri (end)
      const mockChunk2Response: MockResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue({
          id: mockQueryId,
          nextUri: undefined,
          data: [[3], [4]],
        } as Partial<PrestoResponse>),
      }
      mockFetch
        .mockResolvedValueOnce(mockFirstResponse as unknown as Response)
        .mockResolvedValueOnce(mockChunk1Response as unknown as Response)
        .mockResolvedValueOnce(mockChunk2Response as unknown as Response)

      const result = await client.query('SELECT * FROM large_table')

      expect(result).toEqual({
        columns: mockColumns,
        data: [[1], [2], [3], [4]], // Combined data from both chunks
        queryId: mockQueryId,
      })

      expect(mockFetch).toHaveBeenCalledTimes(3) // POST + 2 GETs
    })
  })

  describe('Query Generator Method', () => {
    let client: MockPrestoClient
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

    beforeEach(() => {
      client = new PrestoClient({
        host: 'localhost',
        port: 8080,
        user: 'testuser',
        catalog: 'test_catalog',
        schema: 'test_schema',
      }) as MockPrestoClient
      mockFetch.mockClear()

      // Mock parseWithBigInts to return the response as-is for testing
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(client, 'prestoConversionToJSON').mockImplementation(async ({ response }: any) => {
        const responseJson = await response.json()
        return createMockPrestoResponse({ ...responseJson })
      })
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should yield query ID first, then query result', async () => {
      const mockQueryId = 'test-query-id-generator-123'
      const mockColumns: PrestoColumn[] = [
        { name: 'id', type: 'bigint' },
        { name: 'name', type: 'varchar' },
      ]
      const mockData: unknown[][] = [
        [1, 'Alice'],
        [2, 'Bob'],
      ]

      const mockFirstResponse: MockResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue({
          id: mockQueryId,
          nextUri: 'http://localhost:8080/v1/statement/executing/test-query-id-generator-123/1',
        } as Partial<PrestoResponse>),
      }

      const mockSecondResponse: MockResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue({
          id: mockQueryId,
          nextUri: undefined,
          columns: mockColumns,
          data: mockData,
        } as Partial<PrestoResponse>),
      }

      mockFetch
        .mockResolvedValueOnce(mockFirstResponse as unknown as Response)
        .mockResolvedValueOnce(mockSecondResponse as unknown as Response)

      const generator = client.queryGenerator('SELECT id, name FROM users')

      // First yield should be the query ID
      const { value: queryId, done: firstDone } = await generator.next()
      expect(firstDone).toBe(false)
      expect(queryId).toBe(mockQueryId)

      // Second yield should be the complete query result
      const { value: queryResult, done: secondDone } = await generator.next()
      expect(secondDone).toBe(false)
      expect(queryResult).toEqual({
        columns: mockColumns,
        data: mockData,
        queryId: mockQueryId,
      })

      // Generator should be complete
      const { done: thirdDone } = await generator.next()
      expect(thirdDone).toBe(true)
    })

    it('should yield query ID immediately even if query execution fails later', async () => {
      const mockQueryId = 'test-query-id-generator-error'
      const mockError: PrestoErrorObject = {
        errorCode: 1,
        errorName: 'SYNTAX_ERROR',
        errorType: 'USER_ERROR',
        message: "line 1:8: Column 'invalid_column' cannot be resolved",
        name: 'PrestoError',
        failureInfo: {
          message: "Column 'invalid_column' cannot be resolved",
          stack: ['com.facebook.presto.sql.analyzer.SemanticException'],
          suppressed: [],
          type: 'com.facebook.presto.sql.analyzer.SemanticException',
        },
      }

      const mockFirstResponse: MockResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue({
          id: mockQueryId,
          nextUri: 'http://localhost:8080/v1/statement/executing/test-query-id-generator-error/1',
        } as Partial<PrestoResponse>),
      }

      const mockErrorResponse: MockResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue({
          id: mockQueryId,
          nextUri: undefined,
          error: mockError,
        } as Partial<PrestoResponse>),
      }

      mockFetch
        .mockResolvedValueOnce(mockFirstResponse as unknown as Response)
        .mockResolvedValueOnce(mockErrorResponse as unknown as Response)

      const generator = client.queryGenerator('SELECT invalid_column FROM users')

      // First yield should still return the query ID
      const { value: queryId, done: firstDone } = await generator.next()
      expect(firstDone).toBe(false)
      expect(queryId).toBe(mockQueryId)

      // Second yield should throw PrestoError
      await expect(generator.next()).rejects.toThrow(PrestoError)
    })

    it('should throw error immediately if queryFirst fails', async () => {
      const mockErrorResponse: MockErrorResponse = {
        status: 400,
        text: jest.fn().mockResolvedValue('Bad Request'),
      }

      mockFetch.mockResolvedValueOnce(mockErrorResponse as unknown as Response)

      const generator = client.queryGenerator('INVALID SQL')

      // First call to next() should throw immediately
      await expect(generator.next()).rejects.toThrow('Query failed: "Bad Request"')
    })

    it('should handle multiple data chunks in generator', async () => {
      const mockQueryId = 'test-query-id-generator-chunks'
      const mockColumns: PrestoColumn[] = [{ name: 'id', type: 'bigint' }]

      const mockFirstResponse: MockResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue({
          id: mockQueryId,
          nextUri: 'http://localhost:8080/v1/statement/executing/test-query-id-generator-chunks/1',
        } as Partial<PrestoResponse>),
      }

      // First chunk with data and nextUri
      const mockChunk1Response: MockResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue({
          id: mockQueryId,
          nextUri: 'http://localhost:8080/v1/statement/executing/test-query-id-generator-chunks/2',
          columns: mockColumns,
          data: [[1], [2]],
        } as Partial<PrestoResponse>),
      }

      // Second chunk with more data and no nextUri (end)
      const mockChunk2Response: MockResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue({
          id: mockQueryId,
          nextUri: undefined,
          data: [[3], [4]],
        } as Partial<PrestoResponse>),
      }

      mockFetch
        .mockResolvedValueOnce(mockFirstResponse as unknown as Response)
        .mockResolvedValueOnce(mockChunk1Response as unknown as Response)
        .mockResolvedValueOnce(mockChunk2Response as unknown as Response)

      const generator = client.queryGenerator('SELECT * FROM large_table')

      // Get query ID
      const { value: queryId } = await generator.next()
      expect(queryId).toBe(mockQueryId)

      // Get final result (should combine all chunks)
      const { value: queryResult } = await generator.next()
      expect(queryResult).toEqual({
        columns: mockColumns,
        data: [[1], [2], [3], [4]], // Combined data from both chunks
        queryId: mockQueryId,
      })

      expect(mockFetch).toHaveBeenCalledTimes(3) // POST + 2 GETs
    })
  })
})
