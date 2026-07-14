# Document Conversion Architecture (PDF & DOCX)

## Overview

ระบบแปลงเอกสารจาก Rich Text Editor (Tiptap) → PDF/DOCX ผ่าน NestJS backend + LibreOffice headless

## Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│  Frontend (React + Tiptap)                          │
│                                                     │
│  editor.getHTML()                                   │
│       │                                             │
│       ▼                                             │
│  buildFullHtml()                                    │
│  ├── extract font-family from inline styles         │
│  ├── inject page styles (padding, font-size, etc)   │
│  └── overlay signature layer (base64 images)        │
│       │                                             │
│       ▼                                             │
│  POST /api/convert/pdf   or   /api/convert/docx     │
│  Body: { html: string, filename: string }           │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│  Backend (NestJS)                                   │
│                                                     │
│  ConvertController                                  │
│  ├── POST /convert/pdf  → convertService.pdf()      │
│  └── POST /convert/docx → convertService.docx()     │
│                                                     │
│  ConvertService                                     │
│  ├── installFontsToSystem() [onModuleInit]          │
│  │   ├── Windows: copy to %LOCALAPPDATA% + registry │
│  │   └── Linux: copy to ~/.local/share/fonts        │
│  │                                                  │
│  ├── wrapHtmlWithStyles()                           │
│  │   └── inject default CSS if not full HTML        │
│  │                                                  │
│  └── runLibreOffice()                               │
│      └── soffice --headless --convert-to {format}   │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│  LibreOffice Headless                               │
│                                                     │
│  PDF:  HTML ──────────────────────► PDF             │
│  DOCX: HTML ──► ODT ──► DOCX  (2-step conversion)  │
└─────────────────────────────────────────────────────┘
```

## API Endpoints

| Method | Path | Content-Type | Description |
|--------|------|-------------|-------------|
| POST | `/api/convert/pdf` | `application/pdf` | HTML → PDF |
| POST | `/api/convert/docx` | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | HTML → DOCX |

### Request Body

```json
{
  "html": "<!DOCTYPE html>...",
  "filename": "document.pdf"
}
```

## PDF Conversion Detail

```
Frontend                          Backend
────────                          ───────
editor.getHTML()
  │
  ▼
buildFullHtml()
  ├─ extractFontFamily(html)  ──  regex: /font-family:\s*([^;"]+)/
  ├─ getComputedStyle(page)      gets padding, font-size, line-height
  ├─ inject <style> block
  └─ overlay signature layer
  │
  ▼
POST /api/convert/pdf
  │                                  wrapHtmlWithStyles()
  │                                    └─ skip if already full HTML
  │                                  write to tmpDir/input.html
  │                                  runLibreOffice(input, output, 'pdf')
  │                                    └─ soffice --headless --convert-to pdf
  │                                  read output/*.pdf
  ▼                                  ▼
receive Blob ◄────────────────── return Buffer
  │
  ▼
download via <a> click
```

## DOCX Conversion Detail

```
Frontend                          Backend
────────                          ───────
editor.getHTML()
  │
  ▼
buildFullHtml()  (same as PDF)
  │
  ▼
POST /api/convert/docx
  │                                  wrapHtmlWithStyles()
  │                                  write to tmpDir/input.html
  │
  │                                  Step 1: HTML → ODT
  │                                    soffice --headless --convert-to odt
  │
  │                                  Step 2: ODT → DOCX
  │                                    soffice --headless --convert-to docx
  │
  │                                  read output/*.docx
  ▼                                  ▼
receive Blob ◄────────────────── return Buffer
  │
  ▼
download via <a> click
```

**Why 2-step?** LibreOffice has no direct HTML→DOCX export filter. HTML→ODT works natively, then ODT→DOCX converts between office formats.

## Font Installation

| Platform | Location | Method |
|----------|----------|--------|
| Windows | `%LOCALAPPDATA%\Microsoft\Windows\Fonts\` | Copy .ttf + registry `HKCU\...\Fonts` |
| Linux | `~/.local/share/fonts/` | Copy .ttf + `fc-cache -f` |

- Runs once on server startup (`OnModuleInit`)
- No admin required (per-user install)
- Fonts: TH Sarabun New, TH Sarabun IT๙, TH SarabunPSK

## Key Files

```
rich-text-back/
├── fonts/
│   ├── THSarabunNew/         (4 .ttf files)
│   ├── THSarabunIT๙/         (8 .ttf files)
│   └── THSarabunPSK/         (4 .ttf files)
└── src/
    ├── main.ts               (NestFactory + Swagger setup)
    ├── convert.controller.ts (POST /convert/pdf, /convert/docx)
    └── convert.service.ts    (font install + LibreOffice exec)

rich-text/src/utils/
├── exportPdf.ts              (buildFullHtml → POST /convert/pdf → download)
└── exportDocx.ts             (buildFullHtml → POST /convert/docx → download)
```

## Font Extraction Logic

```ts
// exportPdf.ts / exportDocx.ts
function extractFontFamily(html: string): string {
  const match = html.match(/font-family:\s*([^;"]+)/i)
  if (match) return match[1].trim()
  return '"TH Sarabun New", sans-serif'
}
```

ดึง font-family จาก inline styles ใน HTML content (ไม่ใช่ computed style ของ page element) เพื่อให้ได้ฟอนต์ที่ผู้ใช้เลือกจริงใน editor
