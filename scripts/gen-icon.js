/* eslint-disable */
// Dependency-free PNG generator for the Vital Optima app icon.
// Draws a bold silver-grey "V" (arms overextending off the top) on a pine-green
// field, anti-aliased via 4x4 supersampling. Run: `node scripts/gen-icon.js`.
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

// ---- colours ----
const PINE = [27, 67, 50]; // #1B4332
const SILVER = [203, 211, 205]; // #CBD3CD silver-grey

// ---- PNG encoding (RGBA, 8-bit) ----
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}
function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type RGBA
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter: none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

// ---- geometry ----
function distToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 ? ((px - ax) * dx + (py - ay) * dy) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}

// inset=false → arms run off the top edges (full-bleed look, for icon.png)
// inset=true  → arms kept inside the safe zone (survives circular masking)
function renderV(size, { bg, fg, transparent, inset }) {
  const rgba = Buffer.alloc(size * size * 4);
  const s = size / 1024;
  const yTop = (inset ? 70 : -90) * s;
  const yBot = (inset ? 858 : 968) * s;
  const cx = 512 * s;
  const lTop = (inset ? 268 : 188) * s;
  const rTop = (inset ? 756 : 836) * s;
  const halfT = (inset ? 86 : 98) * s;
  const SS = 4;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let cov = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = x + (sx + 0.5) / SS;
          const py = y + (sy + 0.5) / SS;
          const d = Math.min(
            distToSegment(px, py, lTop, yTop, cx, yBot),
            distToSegment(px, py, rTop, yTop, cx, yBot),
          );
          if (d <= halfT) cov++;
        }
      }
      const a = cov / (SS * SS);
      const idx = (y * size + x) * 4;
      if (transparent) {
        rgba[idx] = fg[0];
        rgba[idx + 1] = fg[1];
        rgba[idx + 2] = fg[2];
        rgba[idx + 3] = Math.round(a * 255);
      } else {
        rgba[idx] = Math.round(fg[0] * a + bg[0] * (1 - a));
        rgba[idx + 1] = Math.round(fg[1] * a + bg[1] * (1 - a));
        rgba[idx + 2] = Math.round(fg[2] * a + bg[2] * (1 - a));
        rgba[idx + 3] = 255;
      }
    }
  }
  return rgba;
}

const outDir = path.join(__dirname, '..', 'assets');
fs.mkdirSync(outDir, { recursive: true });

const targets = [
  { file: 'icon.png', size: 1024, bg: PINE, fg: SILVER, transparent: false, inset: false },
  { file: 'adaptive-icon.png', size: 1024, bg: PINE, fg: SILVER, transparent: true, inset: true },
  { file: 'splash-icon.png', size: 1024, bg: PINE, fg: SILVER, transparent: true, inset: true },
  { file: 'favicon.png', size: 64, bg: PINE, fg: SILVER, transparent: false, inset: true },
];

for (const t of targets) {
  const rgba = renderV(t.size, t);
  const png = encodePNG(t.size, t.size, rgba);
  fs.writeFileSync(path.join(outDir, t.file), png);
  console.log(`wrote assets/${t.file} (${t.size}x${t.size}, ${png.length} bytes)`);
}
console.log('done');
