# Ahana PrestoDB Sandbox

Run the container:

```
npm run presto:up
```

## Others:

Use the Presto-CLI to run queries:

```
docker exec -it prestodb presto-cli --catalog tpcds --schema sf1
```

Examples:

```
show tables;

describe call_center;

SELECT cc_name, cc_city, cc_state, cc_country FROM call_center limit 10;
```
