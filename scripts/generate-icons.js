// Generates icon-192.png and icon-512.png using only Node.js built-ins
import { createWriteStream } from 'fs'
import { mkdir } from 'fs/promises'
import zlib from 'zlib'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '..', 'public', 'icons')

await mkdir(OUT, { recursive: true })

function writePng(filePath, size) {
  // Navy-to-blue gradient square with a white plane silhouette
  const data = new Uint8Array(size * size * 4)

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      // Background: dark navy gradient
      const t = (x + y) / (2 * size)
      data[i]     = Math.round(30  + t * 20)   // R
      data[i + 1] = Math.round(58  + t * 10)   // G
      data[i + 2] = Math.round(95  + t * 70)   // B
      data[i + 3] = 255                          // A
    }
  }

  // Draw a simple plane shape in the center
  const cx = size / 2, cy = size / 2, sc = size / 8

  function setPixel(px, py) {
    const ix = Math.round(cx + px * sc)
    const iy = Math.round(cy + py * sc)
    if (ix < 0 || ix >= size || iy < 0 || iy >= size) return
    const i = (iy * size + ix) * 4
    data[i] = data[i + 1] = data[i + 2] = 255
    data[i + 3] = 230
  }

  // Body (vertical line)
  for (let t = -3.5; t <= 2; t += 0.1) setPixel(0, t)

  // Wings
  for (let t = -2; t <= 2; t += 0.1) {
    setPixel(t, -0.5 + Math.abs(t) * 0.3)
    setPixel(t * 0.9, -0.4 + Math.abs(t) * 0.25)
  }

  // Tail
  for (let t = -1; t <= 1; t += 0.1) {
    setPixel(t * 0.5, 1.5 + Math.abs(t) * 0.3)
  }

  // Build PNG binary
  function adler32(data) {
    let a = 1, b = 0
    for (const byte of data) { a = (a + byte) % 65521; b = (b + a) % 65521 }
    return (b << 16) | a
  }

  function crc32(data) {
    const table = []
    for (let i = 0; i < 256; i++) {
      let c = i
      for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      table[i] = c
    }
    let crc = 0xffffffff
    for (const byte of data) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8)
    return (crc ^ 0xffffffff) >>> 0
  }

  function chunk(type, data) {
    const typeBytes = Buffer.from(type)
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
    const crcInput = Buffer.concat([typeBytes, data])
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(crcInput))
    return Buffer.concat([len, typeBytes, data, crc])
  }

  // IHDR
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0

  // Raw scanlines (filter byte 0 + RGB data)
  const raw = Buffer.alloc(size * (1 + size * 3))
  for (let y = 0; y < size; y++) {
    raw[y * (1 + size * 3)] = 0
    for (let x = 0; x < size; x++) {
      const si = (y * size + x) * 4
      const di = y * (1 + size * 3) + 1 + x * 3
      raw[di]     = data[si]
      raw[di + 1] = data[si + 1]
      raw[di + 2] = data[si + 2]
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 6 })
  const idat = chunk('IDAT', compressed)

  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    idat,
    chunk('IEND', Buffer.alloc(0)),
  ])

  const ws = createWriteStream(filePath)
  ws.write(png)
  ws.end()
  console.log(`✅ ${path.basename(filePath)} (${size}x${size})`)
}

writePng(path.join(OUT, 'icon-192.png'), 192)
writePng(path.join(OUT, 'icon-512.png'), 512)
