// Run with Node 22+ to check standalone mockups in headless Edge.
import { spawn, execFileSync } from 'node:child_process';
import { readFile, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const here = resolve('design/page');
const profile = resolve('.edge-design-check');
if (!profile.startsWith(resolve('.') + '\\')) throw new Error('Preview profile escaped the workspace');
const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const pages = ['index.html', 'sign-in.html', 'policies.html', 'policy-detail.html', 'create-endorsement-request.html', 'beneficiary-request-th.html', 'request-types-th.html', 'policy-evidence.html', 'check-endorsement-eligibility.html', 'proposal-review.html', 'change-history.html', 'policy-detail-coverage.html', 'shadcn-theme-preview.html'];
const child = spawn(edge, ['--headless=new', '--disable-gpu', '--disable-extensions', '--no-first-run', `--user-data-dir=${profile}`, '--remote-debugging-port=0', pathToFileURL(join(here, pages[0])).href], { stdio: 'ignore', windowsHide: true });
const wait = (ms) => new Promise((done) => setTimeout(done, ms));
let ws;
try {
  let port;
  for (let i = 0; i < 50; i++) {
    try { port = Number((await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]); break; } catch { await wait(200); }
  }
  if (!port) throw new Error('Edge debugging port unavailable');
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  ws = new WebSocket(targets.find((item) => item.type === 'page').webSocketDebuggerUrl);
  await new Promise((done, reject) => { ws.addEventListener('open', done, { once: true }); ws.addEventListener('error', reject, { once: true }); });
  let nextId = 1;
  const pending = new Map();
  ws.addEventListener('message', (event) => { const message = JSON.parse(event.data); if (pending.has(message.id)) { const { resolve: done, reject } = pending.get(message.id); pending.delete(message.id); message.error ? reject(new Error(message.error.message)) : done(message.result); } });
  const send = (method, params = {}) => new Promise((done, reject) => { const id = nextId++; pending.set(id, { resolve: done, reject }); ws.send(JSON.stringify({ id, method, params })); });
  await send('Page.enable');
  for (const width of [320, 1440]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
    for (const page of pages) {
      await send('Page.navigate', { url: pathToFileURL(join(here, page)).href });
      await wait(120);
      const value = await send('Runtime.evaluate', { expression: '({width: innerWidth, scrollWidth: document.documentElement.scrollWidth, title: document.title})', returnByValue: true });
      const result = value.result.value;
      console.log(`${width} ${page} viewport=${result.width} scroll=${result.scrollWidth}`);
      if (result.scrollWidth > result.width) process.exitCode = 1;
    }
  }
} finally {
  ws?.close();
  try { execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' }); } catch { child.kill(); }
  await wait(500);
  await rm(profile, { recursive: true, force: true }).catch(() => {});
}
