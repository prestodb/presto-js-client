# Presto JS Client

This is a Presto JavaScript client that connects to Presto via Presto's REST API to run queries.

## Installation

```sh
npm install @presto/client
```

## Usage

Import the PrestoClient class from `@presto/client`.

Create a new instance by passing the connection parameters.

### Example

```typescript
import { GetPrestoDataParams, PrestoClient } from '@presto/client'

...

const client = PrestoClient({
  catalog: 'tpcs',
  host: 'localhost',
  interval: 0,
  port: 8080,
  schema: 'tiny',
  timezone: 'America/Costa_Rica',
  user: 'root'
})
```

### Parameters

The Presto client can be configured with the following parameters:

- `host`: The hostname or IP address of the Presto coordinator. (Default: `http://localhost`)
- `port`: The port number of the Presto coordinator. (Default: `8080`)
- `user`: The username to use for authentication. (Default: `undefined`)
- `catalog`: The default catalog to use for queries. (Default: `undefined`)
- `schema`: The default schema to use for queries. (Default: `undefined`)
- `timezone`: The timezone to use for queries. (Default: `undefined`)
- `interval`: The interval in milliseconds between checks for the status of a running query. (Default: `100`)

## Querying

The `query` method takes a single `string` parameter, which is the SQL query to be executed. The method returns a PrestoQuery object, which contains the results of the query, including the columns, data, and query ID. If the query fails, the `query` method will throw an error.

The `string` parameter to the `query` method must be a valid SQL query. The query can be any type of SQL query, including `SELECT`, `INSERT`, `UPDATE`, and `DELETE` statements.

### Return data structure (or error state)

The `query` method returns a PrestoQuery object, which contains the results of the query, including the columns, data, and query ID.

If the query succeeds, the PrestoQuery object will have the following properties:

- `columns`: An array of objects that describe the columns in the results.
- `data`: An array of arrays that contain the actual data for the results.
- `queryId`: The ID of the query.

If the query fails, the PrestoQuery object will have the following properties:

- `error`: An object that contains information about the error.
- `queryId`: The ID of the query.

You can use the `error` property to get more information about the error that occurred. You can also use the `queryId` property to cancel the query or to get more information about the status of the query.

### Example usage

The following example shows how to use the query() method to execute a SELECT statement:

```typescript
const client = new PrestoClient({
  catalog: 'tpcds',
  host: 'http://localhost',
  port: 8080,
  schema: 'sf10',
  user: 'root',
})

const query = `SELECT * FROM my_table`

const prestoQuery = await client.query(query)

if (prestoQuery.error) {
  // Handle the error.
} else {
  // Use the results of the query.
}
```

### Additional notes

Additional notes

- The `query` method is asynchronous and will return a promise that resolves to a PrestoQuery object.
- The `query` method will automatically retry the query if it fails due to a transient error.
- The `query` method will cancel the query if the client is destroyed.
