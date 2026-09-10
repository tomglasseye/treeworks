/**
 * Generates every icon the site serves from one master, public/favicon.svg.
 *
 * Run with `npm run build:icons` after editing the master. Output is committed,
 * so a deploy never has to run this — sharp stays a devDependency and Netlify
 * never needs to build it.
 */
import {readFile, writeFile} from 'node:fs/promises'
import {fileURLToPath} from 'node:url'
import sharp from 'sharp'

const root = fileURLToPath(new URL('..', import.meta.url))
const master = `${root}public/favicon.svg`

/** The sizes anything actually asks for, and who asks. */
const PNG_TARGETS = [
  {file: 'apple-touch-icon.png', size: 180}, // iOS home screen
  {file: 'icon-192.png', size: 192}, // Android / manifest
  {file: 'icon-512.png', size: 512}, // manifest, install splash
]

const ICO_SIZE = 32

const svg = await readFile(master)

/**
 * The master is a 64-unit viewBox, and sharp rasterises an SVG at its natural
 * size before resizing — which would upscale a 64px bitmap to 512 and blur it.
 * Raising the density renders at the target resolution instead, so every output
 * is vector-crisp.
 */
function render(size) {
  return sharp(svg, {density: Math.ceil((72 * size) / 64)})
    .resize(size, size)
    .png({compressionLevel: 9})
    .toBuffer()
}

/**
 * Wraps a PNG in an ICO container.
 *
 * sharp cannot write ICO, and the format is small enough that a second image
 * dependency is not worth it: a 6-byte directory header, one 16-byte entry, and
 * the PNG bytes verbatim. PNG-inside-ICO has been read by every browser since
 * IE11.
 */
function pngToIco(png, size) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // 1 = icon
  header.writeUInt16LE(1, 4) // one image

  const entry = Buffer.alloc(16)
  entry.writeUInt8(size === 256 ? 0 : size, 0) // 0 encodes 256
  entry.writeUInt8(size === 256 ? 0 : size, 1)
  entry.writeUInt8(0, 2) // palette size, 0 for truecolour
  entry.writeUInt8(0, 3) // reserved
  entry.writeUInt16LE(1, 4) // colour planes
  entry.writeUInt16LE(32, 6) // bits per pixel
  entry.writeUInt32LE(png.length, 8)
  entry.writeUInt32LE(header.length + entry.length, 12) // payload offset

  return Buffer.concat([header, entry, png])
}

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

/**
 * Parses the container back and checks it describes what we meant.
 *
 * A malformed ICO does not throw anywhere — it renders as a blank tab icon,
 * which looks exactly like having no favicon at all. Since this file is
 * assembled by hand, it gets read back before anyone trusts it.
 */
function assertValidIco(buffer, size) {
  const fail = (why) => {
    throw new Error(`Generated favicon.ico is malformed: ${why}`)
  }

  if (buffer.readUInt16LE(0) !== 0) fail('reserved field is not zero')
  if (buffer.readUInt16LE(2) !== 1) fail('type field is not 1 (icon)')
  if (buffer.readUInt16LE(4) !== 1) fail('expected exactly one image')
  if (buffer.readUInt8(0 + 6) !== size) fail(`width byte is not ${size}`)
  if (buffer.readUInt8(1 + 6) !== size) fail(`height byte is not ${size}`)

  const length = buffer.readUInt32LE(8 + 6)
  const offset = buffer.readUInt32LE(12 + 6)
  if (offset + length !== buffer.length) fail('payload length does not match the file')
  if (!buffer.subarray(offset, offset + 8).equals(PNG_MAGIC)) fail('payload is not a PNG')
}

for (const {file, size} of PNG_TARGETS) {
  await writeFile(`${root}public/${file}`, await render(size))
  console.log(`  public/${file}  ${size}x${size}`)
}

const ico = pngToIco(await render(ICO_SIZE), ICO_SIZE)
assertValidIco(ico, ICO_SIZE)
await writeFile(`${root}public/favicon.ico`, ico)
console.log(`  public/favicon.ico  ${ICO_SIZE}x${ICO_SIZE} (verified)`)

console.log('\nIcons rebuilt from public/favicon.svg.')
