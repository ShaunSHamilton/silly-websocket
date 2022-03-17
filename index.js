import WebSocket, { WebSocketServer } from "ws";
import {
  findPortWebSocketServerListens,
  parseBuffer,
  parse,
  info,
  debug,
  error,
} from "./utils/index.js";

async function main() {
  // Find peers
  const peerPorts = await findPortWebSocketServerListens(WebSocket, {
    timeout: 400,
    startPort: 30000,
    endPort: 30100,
    numberOfPorts: 3,
  });
  info("peerPorts: ", peerPorts);
  // Connect to peers
  for (const peerPort of peerPorts) {
    const peerSocket = new WebSocket(`ws://localhost:${peerPort}`);
    // Connection opened
    peerSocket.on("open", () => {});
    peerSocket.on("message", (data) => {
      const message = parseBuffer(data);
      info(`From peer (${peerPort}): `, message.data);
    });
    peerSocket.on("error", (err) => {
      error(err);
    });
  }

  // Create a server for future peers to connect to
  const availableServerPort = await findAvailablePort(30000, 30100);
  const nodeWebSocketServer = new WebSocketServer({
    port: availableServerPort,
  });
  info(`Listening for peers on port ${availableServerPort}`);

  nodeWebSocketServer.on("connection", (ws, req) => {
    ws.on("message", (data) => {
      const message = parseBuffer(data);
      info(`From peer (${req.socket.localPort}): `, message.data);
    });

    sock("connect", "Node says 'Hello!!'");

    function sock(type, data = {}) {
      ws.send(parse({ event: type, data }));
    }
  });
  nodeWebSocketServer.on("error", (err) => {
    error(err);
  });

  // Create a server to listen for client connections
  const availableClientPort = await findAvailablePort(31000, 31100);
  const clientWebSocketServer = new WebSocketServer({
    port: availableClientPort,
  });
  info(`Listening for clients on port: ${availableClientPort}`);

  clientWebSocketServer.on("connection", (ws, req) => {
    ws.on("message", (data) => {
      const message = parseBuffer(data);
      info(`From client (${req.socket.remoteAddress}): `, message.data);
      sock("message", {
        name: "Camper",
        data: passiveAggressiveReplies[
          Math.floor(Math.random() * passiveAggressiveReplies.length)
        ],
      });
    });

    sock("connect", { name: "Camper", data: "Node says 'Hello!'" });

    function sock(type, data = {}) {
      ws.send(parse({ event: type, data }));
    }
  });
}

main();

async function findAvailablePort(startPort, endPort) {
  // Listen on ports between 30000 and 30100
  try {
    const availablePort = await new Promise((resolve, reject) => {
      for (let port = startPort; port < endPort; port++) {
        const server = require("net").createServer();
        server.listen(port);
        server.on("listening", () => {
          server.close();
          return resolve(port);
        });
        server.on("error", (err) => {
          if (err.code === "EADDRINUSE") {
            debug(`Port in use: ${port}`);
          } else {
            error(err);
          }
        });
      }
    });
    return availablePort;
  } catch (err) {
    error(err);
  }
}

const passiveAggressiveReplies = [
  "I'm not sure what you mean...",
  "No, I do not want to.",
  "Please try again.",
  "I'm sorry, I don't understand.",
  "I'm afraid I can't do that.",
  "The answer is no.",
  "Do you want to play a game?",
  "I do not speak to strangers.",
  "Send me another message, I dare you!",
  "No, I do not know Tom.",
];
