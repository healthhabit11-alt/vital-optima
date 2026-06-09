// One session: complete onboarding, then click each bottom tab and screenshot it.
import { writeFileSync } from 'node:fs';

const CDP = 'http://localhost:9222';
const APP = 'http://localhost:8081/';
const DIR = process.argv[2] || '.';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const list = await (await fetch(`${CDP}/json`)).json();
const target = list.find((t) => t.type === 'page');
const ws = new WebSocket(target.webSocketDebuggerUrl);
let id = 0; const pending = new Map();
ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
await new Promise((r) => ws.addEventListener('open', r));
const send = (method, params = {}) => new Promise((res) => { const myid = ++id; pending.set(myid, res); ws.send(JSON.stringify({ id: myid, method, params })); });
const evaluate = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || JSON.stringify(r.result.exceptionDetails));
  return r.result?.result?.value;
};

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 412, height: 915, deviceScaleFactor: 2, mobile: true });

const HELPERS = `
  window.__find = (t) => { const a = Array.from(document.querySelectorAll('div,span,a,button,[role="button"]')).filter(e => (e.textContent||'').trim() === t); a.sort((x,y) => x.getElementsByTagName('*').length - y.getElementsByTagName('*').length); return a; };
  window.__click = (el) => { const r = el.getBoundingClientRect(); const o = { bubbles:true, cancelable:true, clientX:r.left+r.width/2, clientY:r.top+r.height/2 }; el.dispatchEvent(new MouseEvent('mousedown',o)); el.dispatchEvent(new MouseEvent('mouseup',o)); el.dispatchEvent(new MouseEvent('click',o)); };
  window.__clickText = (t) => { const a = window.__find(t); if(!a.length) return false; window.__click(a[0]); return true; };
  window.__clickTab = (t) => { const a = window.__find(t); if(!a.length) return false; a.sort((x,y)=> y.getBoundingClientRect().top - x.getBoundingClientRect().top); window.__click(a[0]); return true; };
  window.__setInput = (v) => { const i = document.querySelector('input'); if(!i) return false; const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set; s.call(i,v); i.dispatchEvent(new Event('input',{bubbles:true})); return true; };
  true;
`;
const waitText = async (t, ms = 25000) => { const s = Date.now(); while (Date.now()-s < ms) { if (await evaluate(`window.__find(${JSON.stringify(t)}).length>0`)) return true; await sleep(400); } return false; };
const shot = async (name) => { const r = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(`${DIR}/${name}.png`, Buffer.from(r.result.data, 'base64')); const txt = await evaluate('(document.body.innerText||"").replace(/\\n+/g," | ").slice(0,220)'); console.log(`[${name}]`, txt); };

await send('Page.navigate', { url: APP });
await sleep(1500);
for (let i = 0; i < 40; i++) { await evaluate(HELPERS).catch(()=>{}); if (await evaluate(`typeof window.__clickTab==='function'`).catch(()=>false)) break; await sleep(400); }

await waitText('GET STARTED'); await evaluate(HELPERS);
await evaluate(`window.__clickText('GET STARTED')`); await sleep(1000);
await waitText('CONTINUE'); await evaluate(HELPERS);
await evaluate(`window.__setInput('Alex')`); await sleep(300);
await evaluate(`window.__clickText('CONTINUE')`); await sleep(1000);
await waitText('Skip for now'); await evaluate(HELPERS);
await evaluate(`window.__clickText('Skip for now')`); await sleep(2500);
await evaluate(HELPERS);
await shot('tab_dashboard');

for (const [label, name] of [['Meds','tab_meds'], ['Glucose','tab_glucose'], ['Nutrition','tab_nutrition'], ['Vita','tab_companion'], ['Settings','tab_settings']]) {
  await evaluate(HELPERS);
  const ok = await evaluate(`window.__clickTab(${JSON.stringify(label)})`);
  await sleep(2200);
  console.log(`click tab ${label}:`, ok);
  await shot(name);
}
process.exit(0);
