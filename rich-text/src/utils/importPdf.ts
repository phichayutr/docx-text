import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.9.155/build/pdf.worker.min.mjs`

export interface PdfPageData {
  pageNumber: number
  width: number
  height: number
  canvas: HTMLCanvasElement
}

export async function importPdf(file: File): Promise<{
  pdfData: ArrayBuffer
  totalPages: number
  pages: PdfPageData[]
}> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise
  const totalPages = pdf.numPages
  const pages: PdfPageData[] = []

  const SCALE = 1.5

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: SCALE })

    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext('2d')!

    await page.render({ canvasContext: ctx, viewport }).promise

    pages.push({
      pageNumber: i,
      width: viewport.width,
      height: viewport.height,
      canvas,
    })
  }

  return {
    pdfData: arrayBuffer,
    totalPages,
    pages,
  }
}
