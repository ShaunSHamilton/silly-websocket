import {
  findPortWebSocketServerListens,
  parse,
  parseBuffer,
  info,
  error,
} from "../utils/index.js";

async function main() {
  const clientPorts = await findPortWebSocketServerListens(WebSocket, {
    timeout: 800,
    startPort: 31000,
    endPort: 31100,
  });
  info(`Found all these: ${clientPorts}`);
  const CP = clientPorts[Math.floor(Math.random() * clientPorts.length)];
  info(`Connected on port ${CP}`);
  if (!CP) {
    throw new Error("No port found");
  }
  const socket = new WebSocket(`ws://localhost:${CP}`);

  // Connection opened
  socket.addEventListener("open", (_event) => {
    info("opened");
    sock("connect", "Client says 'Hello'");
  });

  // Listen for messages
  socket.addEventListener("message", (event) => {
    const message = parseBuffer(event.data);
    info(`From Server (${event.origin}): `, message.data);
  });
  socket.addEventListener("error", (err) => {
    error(err);
  });
  function sock(type, data = "") {
    socket.send(parse({ event: type, data }));
  }
}

main();
