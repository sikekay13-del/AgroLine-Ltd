import fs from 'node:fs';
import zlib from 'node:zlib';

function createPNG(width, height, r, g, b) {
  // A simple valid PNG generator with solid color and simple inner circle/wheat emblem
  const rowLength = width * 4 + 1; // 1 filter byte + RGBA per pixel
  const rawData = Buffer.alloc(rowLength * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.38;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Check if inside central emblem
      const isWheatSprout = Math.abs(dx) < width * 0.04 && Math.abs(dy) < height * 0.28;
      const isLeaf = (Math.abs(dx) - (height * 0.2 - Math.abs(dy))) < 0 && Math.abs(dy) < height * 0.22 && dist < radius;

      if (isWheatSprout || isLeaf) {
        // Golden ochre wheat color #E2B144
        rawData[pxOffset] = 226;
        rawData[pxOffset + 1] = 177;
        rawData[pxOffset + 2] = 68;
        rawData[pxOffset + 3] = 255;
      } else if (dist < radius) {
        // Deep forest agricultural green #1E3F20
        rawData[pxOffset] = 30;
        rawData[pxOffset + 1] = 63;
        rawData[pxOffset + 2] = 32;
        rawData[pxOffset + 3] = 255;
      } else {
        // Outer dark earth #132717
        rawData[pxOffset] = r;
        rawData[pxOffset + 1] = g;
        rawData[pxOffset + 2] = b;
        rawData[pxOffset + 3] = 255;
      }
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // CRC32 implementation
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c;
  }
  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const full = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(full), 0);
    return Buffer.concat([len, full, crcBuf]);
  }

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

if (!fs.existsSync('/public')) {
  fs.mkdirSync('/public', { recursive: true });
}

fs.writeFileSync('/public/pwa-192x192.png', createPNG(192, 192, 19, 39, 23));
fs.writeFileSync('/public/pwa-512x512.png', createPNG(512, 512, 19, 39, 23));
fs.writeFileSync('/public/pwa-maskable-512x512.png', createPNG(512, 512, 19, 39, 23));
fs.writeFileSync('/public/apple-touch-icon.png', createPNG(180, 180, 19, 39, 23));

console.log('Generated PNG icons successfully.');
