// Throwaway CDP screenshot helper for the prototype. Uses Node's built-in
// WebSocket + fetch (Node 22+). Launches Chrome, waits for React render,
// then captures a full-page screenshot.
import { setTimeout as sleep } from "node:timers/promises";
import fs from "node:fs";

const URL = process.argv[2] || "http://127.0.0.1:5598/index.html";
const OUT = process.argv[3] || "prototype-screenshot.png";
const WIDTH = Number(process.argv[4] || 1320);
const PORT = Number(process.argv[5] || 9334);

let id = 0;
const pending = new Map();
function send(ws, method, params = {}) {
  return new Promise((resolve) => {
    const msgId = ++id;
    pending.set(msgId, resolve);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });
}

async function getWsUrl() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      const data = await res.json();
      if (data.webSocketDebuggerUrl) return data.webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error("Chrome DevTools endpoint not reachable");
}

async function main() {
  const browserWsUrl = await getWsUrl();
  const bws = new WebSocket(browserWsUrl);
  await new Promise((r) => (bws.onopen = r));
  bws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
  };

  const { targetId } = await send(bws, "Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send(bws, "Target.attachToTarget", { targetId, flatten: true });

  const sessionPending = new Map();
  let sid = 0;
  function ssend(method, params = {}) {
    return new Promise((resolve) => {
      const msgId = ++sid + 100000;
      sessionPending.set(msgId, resolve);
      bws.send(JSON.stringify({ id: msgId, sessionId, method, params }));
    });
  }
  bws.addEventListener("message", (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && sessionPending.has(m.id)) { sessionPending.get(m.id)(m.result); sessionPending.delete(m.id); }
  });

  await ssend("Page.enable");
  await ssend("Runtime.enable");
  await ssend("Emulation.setDeviceMetricsOverride", {
    width: WIDTH, height: 1200, deviceScaleFactor: 1, mobile: false,
  });
  await ssend("Page.navigate", { url: URL });

  let rendered = false;
  for (let i = 0; i < 40; i++) {
    await sleep(500);
    const r = await ssend("Runtime.evaluate", {
      expression: "(document.getElementById('root')&&document.getElementById('root').children.length)||0",
      returnByValue: true,
    });
    if (r.result && r.result.value > 0) { rendered = true; break; }
  }
  console.log("rendered:", rendered);
  await sleep(1500);

  const metrics = await ssend("Page.getLayoutMetrics");
  const css = metrics.cssContentSize || metrics.contentSize;
  const height = Math.ceil(css.height);
  const width = Math.ceil(css.width);

  const shot = await ssend("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    clip: { x: 0, y: 0, width, height, scale: 1 },
  });
  fs.writeFileSync(OUT, Buffer.from(shot.data, "base64"));
  console.log(`SAVED ${OUT} (${width}x${height})`);
  await send(bws, "Target.closeTarget", { targetId });
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
