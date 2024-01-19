# Presto JS Client

This is a Presto JavaScript client that connects to Presto via Presto's REST API to run queries.

## Installation

```sh
npm install @prestodb/presto-js-client
```

## Usage

Import the PrestoClient class from `@prestodb/presto-js-client`.

Create a new instance by passing the connection parameters.

### Example

Import the Client class:

```typescript
import PrestoClient from '@prestodb/presto-js-client'
```

Instantiate a client with connection parameters:

```typescript
const client = PrestoClient({
  catalog: 'tpcs',
  host: 'localhost',
  port: 8080,
  schema: 'tiny',
  timezone: 'America/Costa_Rica',
  user: 'root',
})
```

### Parameters

The Presto client can be configured with the following parameters:

- `host`: The hostname or IP address of the Presto coordinator. (Default: `http://localhost`)
- `port`: The port number of the Presto coordinator. (Default: `8080`)
- `user`: The username to use for authentication. (Default: `undefined`)
- `catalog`: The default catalog to use for queries. (Default: `undefined`)
- `schema`: The default schema to use for queries. (Default: `undefined`)
- `source`: The name of the source you want to use for reporting purposes (Default: `presto-js-client`)
- `timezone`: The timezone to use for queries. (Default: `undefined`)
- `interval`: (DEPRECATED) The interval in milliseconds between checks for the status of a running query. (Default: `100`)

## Querying

The `query` method takes a single `string` parameter, which is the SQL query to be executed. The method returns a PrestoQuery object, which contains the results of the query, including the columns, data, and query ID. If the query fails, the `query` method will throw an error.

The `string` parameter to the `query` method must be a valid SQL query. The query can be any type of SQL query, including `SELECT`, `INSERT`, `UPDATE`, and `DELETE` statements.

### Return data structure (or error state)

The `query` method returns a PrestoQuery object, which contains the results of the query, including the columns, data, and query ID.

If the query succeeds, the PrestoQuery object will have the following properties:

- `columns`: An array of objects that describe the columns in the results.
- `data`: An array of arrays that contain the actual data for the results.
- `queryId`: The ID of the query.

If the query fails, you can catch the error as a PrestoError which contains all information returned by Presto.

### Example usage

The following example shows how to use the query() method to execute a SELECT statement:

```typescript
const client = new PrestoClient({
  catalog: 'tpcds',
  host: 'http://localhost',
  port: 8080,
  schema: 'sf1',
  user: 'root',
})

const query = `SELECT * FROM my_table`

try {
  const prestoQuery = await client.query(query)
  const results = prestoQuery.data
} catch (error) {
  if (error instanceof PrestoError) {
    // Handle the error.
    console.error(error.errorCode)
  }
}
```

### Additional notes

Additional notes

- The `query` method is asynchronous and will return a promise that resolves to a PrestoQuery object.
- The `query` method will automatically retry the query if it fails due to a transient error.
- The `query` method will cancel the query if the client is destroyed.

## Get Query metadata information

### Get Query Information

The `getQueryInfo` method retrieves comprehensive information about a specific query, based on its identifier. It returns metadata including status, execution details, statistics, and more, encapsulated within a `QueryInfo` object or undefined if the query does not exist.

#### Parameters

- `queryId`: The unique identifier string of the query for which information is being retrieved.

#### Example usage

````typescript
const queryInfo = await prestoClient.getQueryInfo('your_query_id');
console.log(queryInfo);
```

## Query catalog, schema, table and column metadata

### Get Catalogs

The `getCatalogs` method retrieves all available database catalogs, returning them as an array of strings.

#### Example usage

```typescript
const catalogs = await prestoClient.getCatalogs()
console.log(catalogs)
````

### Get Schemas

The `getSchemas` method retrieves all schemas within a given catalog. It accepts a catalog parameter, which is a string representing the name of the catalog.

Parameters

- `catalog`: The name of the catalog for which to retrieve schemas.

#### Example usage

```typescript
const schemas = await prestoClient.getSchemas('tpch')
console.log(schemas)
```

### Get Tables

The `getTables` method retrieves a list of tables (of type `Table`) filtered by the given catalog and, optionally, the schema. It accepts an object containing `catalog` and optional `schema` parameters.

Parameters

- `catalog`: The catalog name.
- `schema` (optional): The schema name.

#### Example usage

```typescript
const tables: Table[] = await prestoClient.getTables({ catalog: 'tpch', schema: 'sf100' })
console.log(tables)
```

### Get Columns

The `getColumns` method retrieves a list of columns (of type `Column`) filtered for the given catalog and optional schema and table filters. It accepts an object with `catalog`, and optional `schema` and `table` parameters.

Parameters

- `catalog`: The catalog name.
- `schema` (optional): The schema name.
- `table` (optional): The table name.

#### Example usage

```typescript
const columns: Column[] = await prestoClient.getColumns({
  catalog: 'tpch',
  schema: 'sf100',
  table: 'orders',
})
console.log(columns)
```
