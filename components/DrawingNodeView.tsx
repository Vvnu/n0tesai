'use client'

import { NodeViewWrapper } from '@tiptap/react'
import { useRef, useState, useEffect, useCallback } from 'react'
import { Pen, Eraser, Trash2, GripVertical } from 'lucide-react'

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
   Constants
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
const MAX_STROKES = 200
const MAX_POINTS_PER_STROKE = 300
const SAVE_DEBOUNCE_MS = 600
const MIN_HEIGHT = 150
const MIN_WIDTH = 200

/* ================================
   Helpers
================================ */
function simplifyPoints(points: Point[]): Point[] {
  if (points.length <= 10) return points
  return points.filter((_, i) => i % 2 === 0 || i === points.length - 1)
}

function estimateSize(strokes: Stroke[]): number {
  return JSON.stringify(strokes).length
}

/* ================================
   Component
================================ */
export default function DrawingNodeView({ node, updateAttributes, selected }: any) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDrawing = useRef(false)
  const isResizingH = useRef(false)  // resizing height (bottom handle)
  const isResizingW = useRef(false)  // resizing width (right handle)
  const isResizingC = useRef(false)  // resizing both (corner handle)
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 })
  const currentStroke = useRef<Point[]>([])
  const saveTimer = useRef<NodeJS.Timeout | null>(null)

  const [tool, setTool] = useState<'pen' | 'eraser'>('pen')
  const [color, setColor] = useState('#000000')
  const [strokeWidth, setStrokeWidth] = useState(4)
  const [strokes, setStrokes] = useState<Stroke[]>(node.attrs.strokes || [])
  const [sizeWarning, setSizeWarning] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [customColor, setCustomColor] = useState('#000000')
  const [isResizing, setIsResizing] = useState(false)

  const width: number = node.attrs.width || 600
  const height: number = node.attrs.height || 300

  /* ================================
     Redraw
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

  useEffect(() => { redraw(strokes) }, [strokes, redraw])

  // Redraw when canvas dimensions change
  useEffect(() => { redraw(strokes) }, [width, height])

  /* ================================
     Resize handlers
  ================================ */
  const startResize = useCallback((
    e: React.MouseEvent,
    mode: 'height' | 'width' | 'corner'
  ) => {
    e.preventDefault()
    e.stopPropagation()
    resizeStart.current = { x: e.clientX, y: e.clientY, w: width, h: height }
    if (mode === 'height') isResizingH.current = true
    if (mode === 'width') isResizingW.current = true
    if (mode === 'corner') isResizingC.current = true
    setIsResizing(true)
  }, [width, height])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isResizingH.current && !isResizingW.current && !isResizingC.current) return
      const dx = e.clientX - resizeStart.current.x
      const dy = e.clientY - resizeStart.current.y

      if (isResizingH.current) {
        const newH = Math.max(MIN_HEIGHT, resizeStart.current.h + dy)
        updateAttributes({ height: Math.round(newH) })
      }
      if (isResizingW.current) {
        const newW = Math.max(MIN_WIDTH, resizeStart.current.w + dx)
        updateAttributes({ width: Math.round(newW) })
      }
      if (isResizingC.current) {
        const newW = Math.max(MIN_WIDTH, resizeStart.current.w + dx)
        const newH = Math.max(MIN_HEIGHT, resizeStart.current.h + dy)
        updateAttributes({ width: Math.round(newW), height: Math.round(newH) })
      }
    }

    const onMouseUp = () => {
      isResizingH.current = false
      isResizingW.current = false
      isResizingC.current = false
      setIsResizing(false)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [updateAttributes])

  /* ================================
     Canvas position helper
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
    if (isResizing) return
    e.preventDefault()
    isDrawing.current = true
    const pos = getPos(e)
    currentStroke.current = [pos]
    const ctx = canvasRef.current!.getContext('2d')!
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }

  const onMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current || isResizing) return
    e.preventDefault()
    const pos = getPos(e)
    currentStroke.current.push(pos)
    const ctx = canvasRef.current!.getContext('2d')!
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color
    ctx.lineWidth = tool === 'eraser' ? strokeWidth * 3 : strokeWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over'
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    ctx.globalCompositeOperation = 'source-over'
  }

  /* ================================
     Debounced save
  ================================ */
  const debouncedSave = (updated: Stroke[]) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      if (estimateSize(updated) > 900_000) { setSizeWarning(true); return }
      setSizeWarning(false)
      updateAttributes({ strokes: updated })
    }, SAVE_DEBOUNCE_MS)
  }

  const onEnd = () => {
    if (!isDrawing.current) return
    isDrawing.current = false
    if (currentStroke.current.length < 2) return
    const newStroke: Stroke = {
      points: simplifyPoints(currentStroke.current).slice(0, MAX_POINTS_PER_STROKE),
      color,
      width: tool === 'eraser' ? strokeWidth * 3 : strokeWidth,
      tool,
    }
    const updated = [...strokes, newStroke].slice(-MAX_STROKES)
    setStrokes(updated)
    debouncedSave(updated)
    currentStroke.current = []
  }

  const handleClear = () => {
    setStrokes([])
    setSizeWarning(false)
    updateAttributes({ strokes: [] })
    const canvas = canvasRef.current
    if (canvas) canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height)
  }

  const handleUndo = () => {
    const updated = strokes.slice(0, -1)
    setStrokes(updated)
    debouncedSave(updated)
    redraw(updated)
  }

  return (
    <NodeViewWrapper>
      <div
        ref={containerRef}
        className={`my-4 rounded-2xl border-2 overflow-visible transition-all relative ${
          selected ? 'border-blue-400 shadow-lg shadow-blue-100' : 'border-gray-200'
        }`}
        style={{ userSelect: 'none', width: `${width}px`, maxWidth: '100%' }}
      >
        {/* Toolbar */}
        <div className="flex items-center gap-1.5 px-2 sm:px-3 py-2 bg-gray-50 border-b border-gray-200 flex-wrap rounded-t-2xl">

          <div className="text-gray-300 cursor-grab mr-1" data-drag-handle>
            <GripVertical size={16} />
          </div>

          {/* Pen / Eraser */}
          <button onMouseDown={e => { e.preventDefault(); setTool('pen') }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              tool === 'pen' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-200'
            }`}>
            <Pen size={13} /> Pen
          </button>
          <button onMouseDown={e => { e.preventDefault(); setTool('eraser') }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              tool === 'eraser' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-200'
            }`}>
            <Eraser size={13} /> Eraser
          </button>

          <div className="h-4 w-px bg-gray-300" />

          {/* Colors */}
          <div className="flex items-center gap-1">
            {COLORS.map(c => (
              <button key={c.value} title={c.label}
                onMouseDown={e => { e.preventDefault(); setColor(c.value); setTool('pen') }}
                className={`w-5 h-5 rounded-full border-2 transition-all hover:scale-110 ${
                  color === c.value && tool === 'pen' ? 'border-gray-900 scale-125' : 'border-gray-300'
                }`}
                style={{ backgroundColor: c.value }}
              />
            ))}
            {/* Custom color */}
            <div className="relative">
              <button title="Custom color"
                onMouseDown={e => { e.preventDefault(); setShowColorPicker(v => !v) }}
                className={`w-5 h-5 rounded-full border-2 overflow-hidden transition-all hover:scale-110 ${
                  showColorPicker ? 'border-gray-900 scale-125' : 'border-gray-300'
                }`}
                style={{ background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }}
              />
              {showColorPicker && (
                <div className="absolute top-8 left-0 z-50 bg-white border border-gray-200 rounded-xl p-3 shadow-xl">
                  <p className="text-xs text-gray-500 mb-2">Custom color</p>
                  <input type="color" value={customColor}
                    onChange={e => { setCustomColor(e.target.value); setColor(e.target.value); setTool('pen') }}
                    className="w-24 h-8 cursor-pointer rounded border border-gray-200"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="h-4 w-px bg-gray-300" />

          {/* Stroke widths */}
          <div className="flex items-center gap-1">
            {WIDTHS.map(w => (
              <button key={w} title={`${w}px`}
                onMouseDown={e => { e.preventDefault(); setStrokeWidth(w) }}
                className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all ${
                  strokeWidth === w ? 'bg-gray-900' : 'hover:bg-gray-200'
                }`}>
                <div className="rounded-full" style={{
                  width: Math.min(w + 8, 20),
                  height: Math.min(w + 8, 20),
                  backgroundColor: strokeWidth === w ? 'white' : '#374151',
                }} />
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-gray-300" />

          {/* Stroke count */}
          <span className="text-xs text-gray-400">{strokes.length}/{MAX_STROKES}</span>

          {/* Undo / Clear */}
          <button onMouseDown={e => { e.preventDefault(); handleUndo() }}
            disabled={strokes.length === 0}
            className="px-2.5 py-1.5 rounded-lg text-xs text-gray-600 hover:bg-gray-200 disabled:opacity-30 transition-all">
            Undo
          </button>
          <button onMouseDown={e => { e.preventDefault(); handleClear() }}
            disabled={strokes.length === 0}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-red-500 hover:bg-red-50 disabled:opacity-30 transition-all">
            <Trash2 size={12} /> Clear
          </button>

          {/* Size display */}
          <span className="text-xs text-gray-400 ml-auto">
            {width}×{height}px
          </span>
        </div>

        {/* Size warning */}
        {sizeWarning && (
          <div className="px-3 py-2 bg-amber-50 border-b border-amber-200 text-xs text-amber-700">
            ⚠️ Drawing is getting large. Use Clear or Undo to free up space.
          </div>
        )}

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="block bg-white rounded-b-2xl"
          style={{
            width: `${width}px`,
            height: `${height}px`,
            maxWidth: '100%',
            cursor: isResizing ? 'nwse-resize' : tool === 'eraser' ? 'cell' : 'crosshair',
            touchAction: 'none',
            display: 'block',
          }}
          onMouseDown={onStart}
          onMouseMove={onMove}
          onMouseUp={onEnd}
          onMouseLeave={onEnd}
          onTouchStart={onStart}
          onTouchMove={onMove}
          onTouchEnd={onEnd}
        />

        {/* ── Resize handle: bottom edge (height only) ── */}
        <div
          onMouseDown={e => startResize(e, 'height')}
          className="absolute bottom-0 left-4 right-4 h-3 flex items-center justify-center cursor-s-resize group"
          style={{ bottom: '-6px' }}
        >
          <div className="w-12 h-1.5 rounded-full bg-gray-300 group-hover:bg-blue-400 transition-colors" />
        </div>

        {/* ── Resize handle: right edge (width only) ── */}
        <div
          onMouseDown={e => startResize(e, 'width')}
          className="absolute top-4 bottom-4 right-0 w-3 flex items-center justify-center cursor-e-resize group"
          style={{ right: '-6px' }}
        >
          <div className="h-12 w-1.5 rounded-full bg-gray-300 group-hover:bg-blue-400 transition-colors" />
        </div>

        {/* ── Resize handle: bottom-right corner (both) ── */}
        <div
          onMouseDown={e => startResize(e, 'corner')}
          className="absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize flex items-end justify-end p-1"
          style={{ bottom: '-6px', right: '-6px' }}
        >
          <div className="w-3 h-3 rounded-sm border-r-2 border-b-2 border-gray-400 hover:border-blue-400 transition-colors" />
        </div>

      </div>
    </NodeViewWrapper>
  )
}