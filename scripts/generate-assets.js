const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

function createPng(width, height, r, g, b) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit
  ihdrData[9] = 2; // RGB
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdrChunk = Buffer.concat([
    Buffer.from([0, 0, 0, 13]),
    Buffer.from('IHDR'),
    ihdrData,
    Buffer.alloc(4)
  ]);
  const ihdrCrc = crc32(Buffer.concat([Buffer.from('IHDR'), ihdrData]));
  ihdrChunk.writeUInt32BE(ihdrCrc, ihdrChunk.length - 4);

  // Raw image data with filter byte 0 per scanline
  const scanline = Buffer.alloc(1 + width * 3);
  scanline[0] = 0; // filter type None
  for (let x = 0; x < width; x++) {
    scanline[1 + x * 3] = r;
    scanline[1 + x * 3 + 1] = g;
    scanline[1 + x * 3 + 2] = b;
  }

  const rawData = Buffer.alloc((1 + width * 3) * height);
  for (let y = 0; y < height; y++) {
    scanline.copy(rawData, y * (1 + width * 3));
  }

  const deflated = zlib.deflateSync(rawData);
  const idatChunk = Buffer.concat([
    Buffer.alloc(4),
    Buffer.from('IDAT'),
    deflated,
    Buffer.alloc(4)
  ]);
  idatChunk.writeUInt32BE(deflated.length, 0);
  const idatCrc = crc32(Buffer.concat([Buffer.from('IDAT'), deflated]));
  idatChunk.writeUInt32BE(idatCrc, idatChunk.length - 4);

  // IEND
  const iendChunk = Buffer.concat([
    Buffer.from([0, 0, 0, 0]),
    Buffer.from('IEND'),
    Buffer.alloc(4)
  ]);
  const iendCrc = crc32(Buffer.from('IEND'));
  iendChunk.writeUInt32BE(iendCrc, iendChunk.length - 4);

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createIcoFromPng(pngBuffer, size = 32) {
  // ICONDIR
  const dir = Buffer.alloc(6);
  dir.writeUInt16LE(0, 0); // reserved
  dir.writeUInt16LE(1, 2); // type 1 = icon
  dir.writeUInt16LE(1, 4); // count 1

  // ICONDIRENTRY
  const entry = Buffer.alloc(16);
  entry[0] = size; // width
  entry[1] = size; // height
  entry[2] = 0; // color count
  entry[3] = 0; // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bpp
  entry.writeUInt32LE(pngBuffer.length, 8); // size of image
  entry.writeUInt32LE(22, 12); // offset

  return Buffer.concat([dir, entry, pngBuffer]);
}

const publicDir = path.join(__dirname, '..', 'public');
const iconsDir = path.join(publicDir, 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Brand color #FF385C -> RGB(255, 56, 92)
const brandR = 255, brandG = 56, brandB = 92;

// 1. icon-192x192.png
const png192 = createPng(192, 192, brandR, brandG, brandB);
fs.writeFileSync(path.join(iconsDir, 'icon-192x192.png'), png192);

// 2. icon-512x512.png
const png512 = createPng(512, 512, brandR, brandG, brandB);
fs.writeFileSync(path.join(iconsDir, 'icon-512x512.png'), png512);

// 3. og-image.png (1200x630)
const ogPng = createPng(1200, 630, brandR, brandG, brandB);
fs.writeFileSync(path.join(publicDir, 'og-image.png'), ogPng);

// 4. favicon.ico (32x32 PNG inside ICO)
const png32 = createPng(32, 32, brandR, brandG, brandB);
const ico = createIcoFromPng(png32, 32);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico);

console.log('✅ Created favicon.ico, og-image.png, and icons successfully!');

