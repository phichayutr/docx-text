# System Analysis: Rich Text Editor (Thai Government Document POC)

## Overview

Web-based rich text editor for Thai government documents. Supports template selection, DOCX/PDF import/export, and adjustable page margins. Built as a POC for Track 2 (Template Flow + Import/Export).

## Tech Stack

| Layer | Library | Version | Purpose |
|-------|---------|---------|---------|
| Framework | React | ^19.2.7 | UI components, state management |
| Language | TypeScript | ^7.0.2 | Type safety |
| Bundler | Vite | ^8.1.1 | Dev server, build, HMR |
| Editor Core | TipTap (ProseMirror) | ^3.27.3 | Rich text editing engine |
| Icons | Lucide React | ^1.24.0 | Toolbar/sidebar icons |
| DOCX Export | docx | ^9.7.1 | Generate .docx files |
| PDF Export | html2pdf.js | ^0.14.0 | HTML → PDF conversion |
| DOCX Import | mammoth | ^1.12.0 | .docx → HTML conversion |
| PDF Import | pdfjs-dist | ^4.9.155 | Extract text from PDF |
| Linter | oxlint | ^1.71.0 | Code linting |

## TipTap Extensions Used

| Extension | Package | Feature |
|-----------|---------|---------|
| StarterKit | @tiptap/starter-kit | Core: paragraphs, headings, lists, code, blockquote, history |
| TextAlign | @tiptap/extension-text-align | Left/center/right/justify alignment |
| Table | @tiptap/extension-table | Resizable table with header row support |
| TableRow | @tiptap/extension-table-row | Table row structure |
| TableCell | @tiptap/extension-table-cell | Table cell with selection |
| TableHeader | @tiptap/extension-table-header | Header row styling |
| Image | @tiptap/extension-image | Inline/base64 image embedding |
| Highlight | @tiptap/extension-highlight | Text highlighting |
| Underline | @tiptap/extension-underline | Underline formatting |
| Placeholder | @tiptap/extension-placeholder | Empty editor placeholder text |
| TextStyle | @tiptap/extension-text-style | Inline style marks (color, font) |
| FontFamily | @tiptap/extension-font-family | Font family selection |
| Color | @tiptap/extension-color | Text color |

## Architecture

```
src/
├── main.tsx                          # Entry point
├── App.tsx                           # Root layout (Sidebar + Editor)
├── vite-env.d.ts                     # Vite type declarations
├── components/
│   ├── Editor.tsx                    # Main editor: template switch, import/export, margins
│   ├── Toolbar.tsx                   # Formatting toolbar: bold, italic, headings, etc.
│   ├── Sidebar.tsx                   # Navigation sidebar: Home, Templates, Import, etc.
│   └── PageMarginRuler.tsx           # Interactive margin adjustment panel
├── templates/
│   └── index.ts                      # 3 Thai government document templates
├── utils/
│   ├── exportDocx.ts                 # HTML → DOCX (using docx library)
│   ├── exportPdf.ts                  # HTML → PDF (using html2pdf.js)
│   ├── importDocx.ts                 # DOCX → HTML (using mammoth)
│   └── importPdf.ts                  # PDF → text → HTML (using pdfjs-dist)
└── styles/
    ├── editor.css                    # Editor layout, toolbar, margin ruler CSS
    ├── document.css                  # A4 page styling, print CSS
    └── sidebar.css                   # Sidebar navigation CSS
```

## Component Responsibilities

### App.tsx
- Root layout: flex container with Sidebar (fixed left) + main content area
- Manages `activeNav` state for sidebar navigation

### Editor.tsx
- Initializes TipTap editor with all extensions
- Template switching (3 templates: internalMemo, officialLetter, memoNote)
- Import handling: accepts .docx and .pdf files
- Export handling: DOCX and PDF output
- Page margin state management

### Toolbar.tsx
- 20+ formatting buttons: undo/redo, font family, headings, bold/italic/underline/strike/highlight, alignment, lists, image/table insert, clear formatting
- Font family selector with 10 Thai/English font options

### Sidebar.tsx
- 7 navigation items: Home, New Document, Templates, Import, Export, Sign, Settings
- Collapsible (220px → 60px) with toggle button
- Active state highlighting

### PageMarginRuler.tsx
- Visual A4 page representation with draggable margin edges
- 4 presets: ราชการ (25/25/30/15mm), มาตรฐาน (25.4mm all), แคบ (12.7mm all), กว้าง (20/20/35/20mm)
- Numeric input fields for precise margin control

## Templates

| Key | Name | Description |
|-----|------|-------------|
| internalMemo | หนังสือ内部 | Internal memorandum with header, body, signature block |
| officialLetter | หนังสือประทับตรา | Official sealed letter with numbered items |
| memoNote | บันทึกข้อความ | Internal note with table header, numbered sections |

## Export/Import Flow

### Export DOCX
```
Editor.getHTML() → parseHTMLToDocxElements() → docx.Document → Packer.toBlob() → download
```
- Parses HTML nodes recursively (headings, paragraphs, tables, lists)
- Handles inline styles: bold, italic, underline, strike
- Sets A4 page size (11906×16838 twips), Thai government margins

### Export PDF
```
Editor.getHTML() → create hidden container → html2pdf.js → jsPDF → download
```
- Renders HTML to canvas (scale: 2x, JPEG quality: 0.98)
- A4 format, portrait orientation
- Page break mode: avoid-all, css, legacy

### Import DOCX
```
File → mammoth.convertToHtml() → Editor.setContent()
```
- Style mapping: Heading 1-3 → h1-h3, Title → h1, Subtitle → h2
- Images converted to base64 inline
- Returns warnings for unsupported elements

### Import PDF
```
File → pdfjs.getDocument() → getTextContent() → paragraph reconstruction → <p> tags → Editor.setContent()
```
- Y-coordinate based paragraph detection (threshold: 5px)
- Warning: PDF structure loss is expected

## CSS Architecture

| File | Purpose | Lines |
|------|---------|-------|
| editor.css | Layout, toolbar, margin ruler, font selector, import dropdown | 514 |
| document.css | A4 page dimensions, header/footer, print styles | 107 |
| sidebar.css | Sidebar navigation, collapse animation | 106 |

## Print Support

- `@media print` rules hide UI elements (`.no-print`)
- A4 page rendered with proper margins (25mm top/bottom, 30mm left, 15mm right)
- Header/footer positioned with `position: fixed`

## Known Limitations

1. **PDF Import**: Text-only extraction loses formatting, tables, images
2. **No pagination**: TipTap has no built-in page break handling
3. **No digital signature**: Track 3 not yet implemented
4. **Font rendering**: Export may differ from on-screen display
5. **Large documents**: No virtual scrolling for very long documents
