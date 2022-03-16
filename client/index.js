import {
  findPortWebSocketServerListens,
  parse,
  info,
  error,
} from "../utils/index.js";

async function main() {
  const CP = await findPortWebSocketServerListens(WebSocket, 800);
  info(`Connected on port ${CP}`);
  if (!CP) {
    throw new Error("No port found");
  }
  const socket = new WebSocket(`ws://localhost:${CP}`);

  // Connection opened
  socket.addEventListener("open", (_event) => {
    info("opened");
    socket.send(parse({ data: "Hello from client", type: "connect" }));
  });

  // Listen for messages
  socket.addEventListener("message", (event) => {
    info("Message from server: ", event.data);
  });
  socket.addEventListener("error", (err) => {
    error(err);
  });
}

main();
