import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'

const MAX_DIMENSION = 1600
const JPEG_QUALITY = 0.8

export type CompressedFile = {
  uri: string
  name: string
  mimeType: string
}

async function renderCompressed(uri: string) {
  const context = ImageManipulator.manipulate(uri)
  const original = await context.renderAsync()

  let finalImage = original
  if (original.width > MAX_DIMENSION) {
    context.reset()
    context.resize({ width: MAX_DIMENSION, height: null })
    finalImage = await context.renderAsync()
  }

  return finalImage
}

export async function compressImageForUpload(uri: string, name: string): Promise<CompressedFile> {
  const finalImage = await renderCompressed(uri)
  const result = await finalImage.saveAsync({ format: SaveFormat.JPEG, compress: JPEG_QUALITY })

  const jpegName = name.replace(/\.[^.]+$/, '') + '.jpg'

  return { uri: result.uri, name: jpegName, mimeType: 'image/jpeg' }
}

export async function compressImageToDataUrl(uri: string): Promise<string> {
  const finalImage = await renderCompressed(uri)
  const result = await finalImage.saveAsync({ format: SaveFormat.JPEG, compress: JPEG_QUALITY, base64: true })

  return `data:image/jpeg;base64,${result.base64}`
}
