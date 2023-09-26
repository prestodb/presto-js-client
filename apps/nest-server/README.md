# nest-server

This application was generated with [Nx](https://nx.dev).

## Running

First run `npm run presto:up` to run a local Presto using `docker-compose` and then `npm run serve nest-server` to serve the application.

Make a `GET` request to `http://localhost:3000/api/call-centers` to see the response from querying the local Presto using `prestodb-js-client` library.
