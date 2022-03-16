import PerfMetrics from "./perf-metrics";

const perfMetrics = new PerfMetrics();

export async function findPortWebSocketServerListens(
  WebSocketConstructor,
  timeout = 1500,
  { numberOfPorts = 4 } = {}
) {
  const listeningPorts = [];
  let batchSize = 20;
  let batch = 0;
  const opening = 30000;
  const closing = 32000 - batchSize;
  // const opening = 39000; // Used for debugging
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
          let endTime = 0;
          const socket = new WebSocketConstructor(`ws://localhost:${i}`);
          let startTime = performance.now();

          const time = setTimeout(() => {
            socket.close();
          }, timeout);
          socket.onopen = (_event) => {
            socket.send(parse({ data: "Testing for websocket", type: "ping" }));
            socket.close();
            clearTimeout(time);
            if (!numberOfPorts) {
              stop = true;
              return resolve(i);
            } else {
              listeningPorts.push(i);
            }
          };
          socket.onerror = (_event) => {
            socket.close();
            clearTimeout(time);
          };
          socket.onclose = (_event) => {
            endTime = performance.now();
            perfMetrics.addMetric({
              id: i,
              startTime,
              endTime,
            });
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
        }, 20);
      });
      info("Found port: ", port);
      if (numberOfPorts && numberOfPorts === listeningPorts.length) {
        perfMetrics.calcAverage();
        debug(`Average time socket lived: ${perfMetrics.average()}`);
        return listeningPorts;
      } else if (!numberOfPorts) {
        perfMetrics.calcAverage();
        debug(`Average time socket lived: ${perfMetrics.average()}`);
        return port;
      }
      batch++;
    } catch (e) {
      batch++;
      // warn(e);
    }
  }
  perfMetrics.calcAverage();
  debug(`Average time socket lived: ${perfMetrics.average()}`);
  return listeningPorts;
}

export function parse(obj) {
  return JSON.stringify(obj);
}

export function parseBuffer(buf) {
  return JSON.parse(buf.toString());
}

const LogLevel = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export function info(...args) {
  if (
    process.env.LOG_LEVEL === LogLevel[LogLevel.info] ||
    LogLevel[process.env.LOG_LEVEL] <= LogLevel.debug
  ) {
    console.info("%cINFO: ", "color: blue", ...args);
  }
}
export function warn(...args) {
  if (
    process.env.LOG_LEVEL === LogLevel[LogLevel.warn] ||
    LogLevel[process.env.LOG_LEVEL] <= LogLevel.info
  ) {
    console.warn("%cWARN: ", "color: orange", ...args);
  }
}
export function error(...args) {
  if (
    process.env.LOG_LEVEL === LogLevel[LogLevel.error] ||
    LogLevel[process.env.LOG_LEVEL] <= LogLevel.warm
  ) {
    console.error("%cERROR: ", "color: red", ...args);
  }
}
export function debug(...args) {
  if (process.env.LOG_LEVEL === LogLevel[LogLevel.debug]) {
    console.debug("%cDEBUG: ", "color: green", ...args);
  }
}
