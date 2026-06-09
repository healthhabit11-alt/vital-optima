// Inspect the CURRENT open page's interactive-element inventory (no navigation).
const CDP = 'http://localhost:9222';
const list = await (await fetch(`${CDP}/json`)).json();
const target = list.find((t) => t.type === 'page');
const ws = new WebSocket(target.webSocketDebuggerUrl);
let id = 0; const pending = new Map();
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
await new Promise((r) => ws.addEventListener('open', r));
const send = (method, params = {}) => new Promise((res) => { const myid = ++id; pending.set(myid, res); ws.send(JSON.stringify({ id: myid, method, params })); });
const ev = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true })).result?.result?.value;

const inv = await ev(`(() => {
  const n = (s) => document.querySelectorAll(s).length;
  const labels = (s) => [...document.querySelectorAll(s)].slice(0, 10).map(e => (e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 28));
  return {
    path: location.pathname,
    buttonEls: n('button'),
    anchorEls: n('a'),
    nested_button_in_button: n('button button'),
    nested_a_in_a: n('a a'),
    nested_button_in_a: n('a button'),
    sampleButtonLabels: labels('button'),
  };
})()`);
console.log(JSON.stringify(inv, null, 2));
process.exit(0);
