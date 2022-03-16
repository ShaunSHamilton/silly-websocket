# Silly WebSocket

How to get going:

1. Start at least 1 server:

```bash
npm run start:s
```

2. Start the client server:

```bash
npm run dev:client
```

3. Open the client in a browser.

## Notes

- Need to decrease range of ports for client and _node_
  - Avoid conflicts
  - Reduce computation

Call with logging flags:

```bash
LOG_LEVEL=debug npm run start:s
```

LogLevels:

0. `debug`
1. `info`
2. `warn`
3. `error`
