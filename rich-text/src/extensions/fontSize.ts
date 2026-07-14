import { Extension } from '@tiptap/core'
import '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType
      unsetFontSize: () => ReturnType
    }
  }
}

export const FontSize = Extension.create({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element: HTMLElement) =>
              element.style.fontSize?.replace(/['"]+/g, '') || null,
            renderHTML: (attributes: Record<string, unknown>) => {
              if (!attributes.fontSize) return {}
              return { style: `font-size: ${attributes.fontSize as string}` }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setFontSize:
        (size: string) =>
        ({ commands }) => {
          return commands.setMark('textStyle', { fontSize: size })
        },
      unsetFontSize:
        () =>
        ({ commands }) => {
          return commands.setMark('textStyle', { fontSize: null })
        },
    }
  },
})
