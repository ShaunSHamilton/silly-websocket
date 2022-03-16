import WebSocket, { WebSocketServer } from "ws";
import {
  findPortWebSocketServerListens,
  parseBuffer,
  parse,
  info,
  warn,
  error,
} from "./utils/index.js";

async function main() {
  // Find peers
  const peerPorts = await findPortWebSocketServerListens(WebSocket, 1500, {
    numberOfPorts: 4,
  });
  info("peerPorts: ", peerPorts);
  // Connect to peers
  for (const peerPort of peerPorts) {
    const peerSocket = new WebSocket(`ws://localhost:${peerPort}`);
    // Connection opened
    peerSocket.on("open", () => {});
    peerSocket.on("message", (data) => {});
    peerSocket.on("error", (err) => {
      error(err);
    });
  }

  // If no peers exist, create a server for future peers to connect to
  if (!peerPorts.length) {
    const availablePort = await findAvailablePort();
    const nodeWebSocketServer = new WebSocketServer({ port: availablePort });
    info(`Listening on port ${availablePort}`);

    nodeWebSocketServer.on("connection", (ws) => {
      ws.on("message", function message(data) {
        const parsedData = parseBuffer(data);
        info(parsedData);
      });

      sock("connect", { data: "Node says 'Hello!!'" });

      function sock(type, data = {}) {
        ws.send(parse({ event: type, data }));
      }
    });
    nodeWebSocketServer.on("error", (err) => {
      error(err);
    });
  }

  // Create a server to listen for client connections
  const availablePort = await findAvailablePort();
  const clientWebSocketServer = new WebSocketServer({ port: availablePort });
  info(`Listening for clients on port: ${availablePort}`);

  clientWebSocketServer.on("connection", (ws) => {
    ws.on("message", function message(data) {
      const parsedData = parseBuffer(data);
      info(parsedData);
    });

    sock("connect", { data: "Client says 'Hello!!'" });

    function sock(type, data = {}) {
      ws.send(parse({ event: type, data }));
    }
  });
}

main();

async function findAvailablePort() {
  const server = require("net").createServer();
  return await new Promise((resolve, reject) => {
    server.listen(0, () => {
      const port = server.address().port;
      server.close(() => {
        resolve(port);
      });
    });
  });
}
