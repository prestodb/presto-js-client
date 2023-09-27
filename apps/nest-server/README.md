# Nest Server

This application was generated using [Nx](https://nx.dev).

## Running the Application

To run this application, follow these steps:

1. Start a local Presto instance using `docker-compose` by running the following command:

   ```bash
   npm run presto:up
   ```

2. Once the Presto instance is up and running, you can start the Nest Server by running:

   ```bash
   npm run serve nest-server
   ```

3. After starting the Nest Server, you can make a `GET` request to the following URL to see the response from querying the local Presto container using the `prestodb-js-client` library:

   ```
   http://localhost:3000/api/call-centers
   ```

Make sure you have all the necessary dependencies installed and configured before running the commands above.
