import {
  findPortWebSocketServerListens,
  parse,
  parseBuffer,
  info,
  error,
} from "../utils/index.js";

const input = document.getElementById("chat-input");
const submitBtn = document.getElementById("chat-send");
const messageBoard = document.getElementById("message-board");

async function main() {
  // TODO: Add loader to messageBoard
  messageBoard.innerHTML = "<h2 style='color: red;'>Finding a server...</h2>";

  const clientPorts = [];
  while (clientPorts.length === 0) {
    // Find listening ports on network.
    clientPorts.push(
      ...(await findPortWebSocketServerListens(WebSocket, {
        timeout: 900,
        startPort: 31000,
        endPort: 31100,
        numberOfPorts: 1,
      }))
    );
    info(`Found all these: ${clientPorts}`);
  }
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
    // TODO: Remove loader
    messageBoard.innerHTML = "";
  });

  // Listen for messages
  socket.addEventListener("message", (event) => {
    const message = parseBuffer(event.data);
    info(`From Server (${event.origin}): `, message.data);
    messageBoard.innerHTML += `<div><span>${message.data.name}: </span><p>${message.data.data}</p></div>`;
  });
  socket.addEventListener("error", (err) => {
    error(err);
  });

  submitBtn.addEventListener("click", () => {
    messageBoard.innerHTML += `<div><span>You: </span><p>${input.value}</p></div>`;
    sock("message", input.value);
    input.value = "";
  });

  function sock(type, data = "") {
    socket.send(parse({ event: type, data }));
  }
}

main();
