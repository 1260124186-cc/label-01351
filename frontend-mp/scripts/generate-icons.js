const fs = require('fs');
const path = require('path');

function createPNG(width, height, drawCallback) {
  const signature = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
  ]);
  
  const ihdr = createChunk('IHDR', Buffer.from([
    (width >> 24) & 0xFF, (width >> 16) & 0xFF, (width >> 8) & 0xFF, width & 0xFF,
    (height >> 24) & 0xFF, (height >> 16) & 0xFF, (height >> 8) & 0xFF, height & 0xFF,
    8, 6, 0, 0, 0
  ]));
  
  const rawData = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    rawData[y * (1 + width * 4)] = 0;
    for (let x = 0; x < width; x++) {
      const offset = y * (1 + width * 4) + 1 + x * 4;
      const pixel = drawCallback(x, y, width, height);
      rawData[offset] = pixel.r;
      rawData[offset + 1] = pixel.g;
      rawData[offset + 2] = pixel.b;
      rawData[offset + 3] = pixel.a;
    }
  }
  
  const zlib = require('zlib');
  const compressed = zlib.deflateSync(rawData);
  const idat = createChunk('IDAT', compressed);
  const iend = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdr, idat, iend]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  
  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  
  const crc = crc32(crcData);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc >>> 0, 0);
  
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function crc32(data) {
  let crc = 0xFFFFFFFF;
  const table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  for (let i = 0; i < data.length; i++) {
    crc = table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  }
  return crc ^ 0xFFFFFFFF;
}

function drawPeopleIcon(x, y, width, height, color) {
  const cx = width / 2;
  const cy = height / 2;
  const scale = width / 81;
  
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  
  const headRadius = 12 * scale;
  const bodyWidth = 20 * scale;
  const bodyHeight = 22 * scale;
  
  const offsetX = 10 * scale;
  
  function drawPerson(px, py) {
    const dxHead = x - (cx + px - headRadius);
    const dyHead = y - (cy + py - headRadius * 1.2);
    const distHead = Math.sqrt(dxHead * dxHead + dyHead * dyHead);
    
    if (distHead <= headRadius) {
      return { r, g, b, a: 255 };
    }
    
    const bodyTop = cy + py + headRadius * 0.5;
    const bodyBottom = bodyTop + bodyHeight;
    const bodyLeft = cx + px - bodyWidth / 2;
    const bodyRight = cx + px + bodyWidth / 2;
    
    if (x >= bodyLeft && x <= bodyRight && y >= bodyTop && y <= bodyBottom) {
      return { r, g, b, a: 255 };
    }
    
    return null;
  }
  
  const person1 = drawPerson(-offsetX, 0);
  if (person1) return person1;
  
  const person2 = drawPerson(offsetX, 0);
  if (person2) return person2;
  
  return { r: 0, g: 0, b: 0, a: 0 };
}

const iconsDir = path.join(__dirname, '..', 'assets', 'icons');

const grayPNG = createPNG(81, 81, (x, y, w, h) => drawPeopleIcon(x, y, w, h, '#999999'));
const brownPNG = createPNG(81, 81, (x, y, w, h) => drawPeopleIcon(x, y, w, h, '#8B4513'));

fs.writeFileSync(path.join(iconsDir, 'people.png'), grayPNG);
fs.writeFileSync(path.join(iconsDir, 'people-active.png'), brownPNG);

console.log('Icons generated successfully!');
console.log('- people.png (gray, unselected)');
console.log('- people-active.png (brown, selected)');
