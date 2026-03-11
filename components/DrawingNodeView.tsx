'use client'

import { NodeViewWrapper } from '@tiptap/react'
import { useRef, useState, useEffect, useCallback } from 'react'
import { Pen, Eraser, Trash2, GripVertical, Minus, Plus } from 'lucide-react'

/* ================================
   Types
================================ */
type Point = { x: number; y: number }
type Stroke = {
  points: Point[]
  color: string
  width: number
  tool: 'pen' | 'eraser'
}

/* ================================
   Color palette
================================ */
const COLORS = [
  { value: '#000000', label: 'Black' },
  { value: '#ef4444', label: 'Red' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#22c55e', label: 'Green' },
  { value: '#f59e0b', label: 'Yellow' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#ffffff', label: 'White' },
]

const WIDTHS = [2, 4, 8, 14]

/* ================================
   Component
================================ */
export default function DrawingNodeView({ node, updateAttributes, selected }: any) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)
  const currentStroke = useRef<Point[]>([])

  const [tool, setTool] = useState<'pen' | 'eraser'>('pen')
  const [color, setColor] = useState('#000000')
  const [strokeWidth, setStrokeWidth] = useState(4)
  const [strokes, setStrokes] = useState<Stroke[]>(node.attrs.strokes || [])
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [customColor, setCustomColor] = useState('#000000')

  const width: number = node.attrs.width || 600
  const height: number = node.attrs.height || 300

  /* ================================
     Redraw canvas from strokes
  ================================ */
  const redraw = useCallback((strokeList: Stroke[]) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    strokeList.forEach(stroke => {
      if (stroke.points.length < 2) return
      ctx.beginPath()
      ctx.strokeStyle = stroke.tool === 'eraser' ? '#ffffff' : stroke.color
      ctx.lineWidth = stroke.width
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over'
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y)
      stroke.points.forEach(p => ctx.lineTo(p.x, p.y))
      ctx.stroke()
    })
    ctx.globalCompositeOperation = 'source-over'
  }, [])

  useEffect(() => {
    redraw(strokes)
  }, [strokes, redraw])

  /* ================================
     Get canvas-relative position
  ================================ */
  const getPos = (e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  /* ================================
     Draw handlers
  ================================ */
  const onStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    isDrawing.current = true
    const pos = getPos(e)
    currentStroke.current = [pos]

    // Start live drawing
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }

  const onMove = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    if (!isDrawing.current) return
    const pos = getPos(e)
    currentStroke.current.push(pos)

    // Live draw current stroke
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color
    ctx.lineWidth = tool === 'eraser' ? strokeWidth * 3 : strokeWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over'
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    ctx.globalCompositeOperation = 'source-over'
  }

  const onEnd = () => {
    if (!isDrawing.current) return
    isDrawing.current = false

    if (currentStroke.current.length < 2) return

    const newStroke: Stroke = {
      points: currentStroke.current,
      color,
      width: tool === 'eraser' ? strokeWidth * 3 : strokeWidth,
      tool,
    }

    const updated = [...strokes, newStroke]
    setStrokes(updated)
    updateAttributes({ strokes: updated })
    currentStroke.current = []
  }

  const handleClear = () => {
    setStrokes([])
    updateAttributes({ strokes: [] })
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')!
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  const handleUndo = () => {
    const updated = strokes.slice(0, -1)
    setStrokes(updated)
    updateAttributes({ strokes: updated })
    redraw(updated)
  }

  return (
    <NodeViewWrapper>
      <div
        className={`my-4 rounded-2xl border-2 overflow-hidden transition-all ${
          selected ? 'border-blue-400 shadow-lg shadow-blue-100' : 'border-gray-200'
        }`}
        style={{ userSelect: 'none' }}
      >
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200 flex-wrap">

          {/* Drag handle */}
          <div className="text-gray-300 cursor-grab mr-1" data-drag-handle>
            <GripVertical size={16} />
          </div>

          {/* Tool: Pen */}
          <button
            onClick={() => setTool('pen')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              tool === 'pen' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Pen size={13} />
            Pen
          </button>

          {/* Tool: Eraser */}
          <button
            onClick={() => setTool('eraser')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              tool === 'eraser' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Eraser size={13} />
            Eraser
          </button>

          <div className="h-4 w-px bg-gray-300" />

          {/* Color palette */}
          <div className="flex items-center gap-1">
            {COLORS.map(c => (
              <button
                key={c.value}
                title={c.label}
                onClick={() => { setColor(c.value); setTool('pen'); }}
                className={`w-5 h-5 rounded-full border-2 transition-all hover:scale-110 ${
                  color === c.value && tool === 'pen'
                    ? 'border-gray-900 scale-125'
                    : 'border-gray-300'
                }`}
                style={{ backgroundColor: c.value }}
              />
            ))}

            {/* Custom color */}
            <div className="relative">
              <button
                title="Custom color"
                onClick={() => setShowColorPicker(v => !v)}
                className={`w-5 h-5 rounded-full border-2 overflow-hidden transition-all hover:scale-110 ${
                  showColorPicker ? 'border-gray-900 scale-125' : 'border-gray-300'
                }`}
                style={{
                  background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)'
                }}
              />
              {showColorPicker && (
                <div className="absolute top-8 left-0 z-50 bg-white border border-gray-200 rounded-xl p-3 shadow-xl">
                  <p className="text-xs text-gray-500 mb-2">Custom color</p>
                  <input
                    type="color"
                    value={customColor}
                    onChange={e => {
                      setCustomColor(e.target.value)
                      setColor(e.target.value)
                      setTool('pen')
                    }}
                    className="w-24 h-8 cursor-pointer rounded border border-gray-200"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="h-4 w-px bg-gray-300" />

          {/* Stroke width */}
          <div className="flex items-center gap-1">
            {WIDTHS.map(w => (
              <button
                key={w}
                onClick={() => setStrokeWidth(w)}
                className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all ${
                  strokeWidth === w ? 'bg-gray-900' : 'hover:bg-gray-200'
                }`}
                title={`${w}px`}
              >
                <div
                  className="rounded-full"
                  style={{
                    width: Math.min(w + 8, 20),
                    height: Math.min(w + 8, 20),
                    backgroundColor: strokeWidth === w ? 'white' : '#374151',
                  }}
                />
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-gray-300" />

          {/* Undo */}
          <button
            onClick={handleUndo}
            disabled={strokes.length === 0}
            className="px-2.5 py-1.5 rounded-lg text-xs text-gray-600 hover:bg-gray-200 disabled:opacity-30 transition-all"
          >
            Undo
          </button>

          {/* Clear */}
          <button
            onClick={handleClear}
            disabled={strokes.length === 0}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-red-500 hover:bg-red-50 disabled:opacity-30 transition-all"
          >
            <Trash2 size={12} />
            Clear
          </button>

          {/* Resize height */}
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={() => updateAttributes({ height: Math.max(150, height - 50) })}
              className="p-1 rounded hover:bg-gray-200 text-gray-500"
            >
              <Minus size={12} />
            </button>
            <span className="text-xs text-gray-400">{height}px</span>
            <button
              onClick={() => updateAttributes({ height: height + 50 })}
              className="p-1 rounded hover:bg-gray-200 text-gray-500"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full bg-white block"
          style={{
            cursor: tool === 'eraser' ? 'cell' : 'crosshair',
            height: `${height}px`,
            touchAction: 'none',
          }}
          onMouseDown={onStart}
          onMouseMove={onMove}
          onMouseUp={onEnd}
          onMouseLeave={onEnd}
          onTouchStart={onStart}
          onTouchMove={onMove}
          onTouchEnd={onEnd}
        />
      </div>
    </NodeViewWrapper>
  )
}