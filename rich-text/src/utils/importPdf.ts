import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.9.155/build/pdf.worker.min.mjs`

export async function importPdf(file: File) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const totalPages = pdf.numPages
  const textContent: string[] = []

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()

    let lastY: number | null = null
    const paragraph: string[] = []

    for (const item of content.items) {
      if (lastY !== null && Math.abs(item.y - lastY) > 5) {
        textContent.push(paragraph.join(' '))
        paragraph.length = 0
      }
      paragraph.push(item.str)
      lastY = item.y
    }

    if (paragraph.length > 0) {
      textContent.push(paragraph.join(' '))
    }
  }

  const html = textContent
    .filter((line) => line.trim())
    .map((line) => `<p>${line}</p>`)
    .join('\n')

  return {
    html,
    totalPages,
    warning: 'PDF import: ผลลัพธ์อาจไม่สมบูรณ์ 100% เนื่องจาก PDF ไม่เก็บโครงสร้างเอกสารแบบเดียวกับ HTML',
  }
}
