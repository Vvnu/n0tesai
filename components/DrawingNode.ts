import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import DrawingNodeView from './DrawingNodeView'

export interface DrawingOptions {}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    drawing: {
      insertDrawing: () => ReturnType
    }
  }
}

export const DrawingNode = Node.create<DrawingOptions>({
  name: 'drawing',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      strokes: {
        default: [],
        parseHTML: el => {
          try {
            return JSON.parse(el.getAttribute('data-strokes') || '[]')
          } catch {
            return []
          }
        },
        renderHTML: attrs => ({
          'data-strokes': JSON.stringify(attrs.strokes),
        }),
      },
      width: { default: 600 },
      height: { default: 300 },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="drawing"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'drawing' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(DrawingNodeView)
  },

  addCommands() {
    return {
      insertDrawing:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { strokes: [], width: 600, height: 300 },
          })
        },
    }
  },
})