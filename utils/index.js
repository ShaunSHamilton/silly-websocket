async function findPortWebSocketServerListens(
  WebSocketConstructor,
  timeout = 1500,
  { numberOfPorts = 10 } = {}
) {
  const listeningPorts = [];
  let batchSize = 20;
  let batch = 0;
  const opening = 30000;
  const closing = 65535 - batchSize;
  // const opening = 39300; // Used for debugging
  // const closing = opening + batchSize * 5; // Used for debugging
  while (batch * batchSize + opening < closing) {
    try {
      const port = await new Promise(async (resolve, reject) => {
        // Ping websockets until one responds
        let stop = false;
        const start = opening + batch * batchSize;
        const end = start + batchSize;
        let closedSockets = 0;
        for (let i = start; i < end; i++) {
          if (stop) {
            break;
          }
          const socket = new WebSocketConstructor(`ws://localhost:${i}`);
          const time = setTimeout(() => {
            socket.close();
          }, timeout);
          socket.onopen = (_event) => {
            socket.send(parse({ data: "Testing for websocket", type: "ping" }));
            socket.close();
            clearTimeout(time);
            stop = true;
            return resolve(i);
          };
          socket.onerror = (_event) => {
            socket.close();
            clearTimeout(time);
          };
          socket.onclose = (_event) => {
            closedSockets++;
          };
        }
        const interval = setInterval(() => {
          // Check if all sockets are closed
          if (closedSockets >= end - start) {
            clearInterval(interval);
            return reject("No port found: " + start + " - " + end);
          }
          // Poll every 10ms
        }, 10);
      });
      info("Found port: ", port);
      if (numberOfPorts && numberOfPorts > listeningPorts.length) {
        listeningPorts.push(port);
      } else if (numberOfPorts && numberOfPorts === listeningPorts.length) {
        return listeningPorts;
      } else if (!numberOfPorts) {
        return port;
      }
      batch++;
    } catch (e) {
      batch++;
      warn(e);
    }
  }
  return listeningPorts;
}

function parse(obj) {
  return JSON.stringify(obj);
}

function parseBuffer(buf) {
  return JSON.parse(buf.toString());
}

function info(...args) {
  console.info("%cINFO: ", "color: blue", ...args);
}
function warn(...args) {
  console.warn("%cWARN: ", "color: orange", ...args);
}
function error(...args) {
  console.error("%cERROR: ", "color: red", ...args);
}

export {
  findPortWebSocketServerListens,
  parse,
  parseBuffer,
  info,
  warn,
  error,
};
