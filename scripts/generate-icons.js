// Renders icon.svg → icon-192.png and icon-512.png using sharp
import sharp from 'sharp'
import { readFileSync } from 'fs'
import { mkdir } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT  = path.join(__dirname, '..', 'public', 'icons')
const SVG  = path.join(__dirname, '..', 'public', 'icons', 'icon.svg')

await mkdir(OUT, { recursive: true })

const svgBuffer = readFileSync(SVG)

for (const size of [192, 512]) {
  const outFile = path.join(OUT, `icon-${size}.png`)
  await sharp(svgBuffer)
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(outFile)
  console.log(`✅ icon-${size}.png  (${size}×${size})`)
}
