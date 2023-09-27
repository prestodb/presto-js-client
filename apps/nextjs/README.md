# Next.js Application

This application was generated with [Nx](https://nx.dev).

## Running the Application

To run this Next.js application, please follow these steps:

1. Start a local Presto instance using `docker-compose` by running the following command:

   ```bash
   npm run presto:up
   ```

2. After the Presto instance is up and running, you can start the Next.js application by running:

   ```bash
   npm run serve nextjs
   ```

3. Once the Next.js application is running, open your web browser and navigate to the following URL:

   ```
   http://localhost:4200/
   ```

   This will allow you to access the Next.js server-side rendering (SSR) application, which queries the local Presto container using the `prestodb-js-client` library.

Make sure to ensure that all necessary dependencies are installed and properly configured before running the provided commands.
