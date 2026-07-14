import { useRef, useEffect, useState } from 'react'
import SignaturePad from 'signature_pad'
import { Eraser, Check } from 'lucide-react'

interface SignatureCanvasProps {
  onSave: (dataUrl: string) => void
  onCancel: () => void
}

export default function SignatureCanvas({ onSave, onCancel }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const padRef = useRef<SignaturePad | null>(null)
  const [penColor, setPenColor] = useState('#000000')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ratio = Math.max(window.devicePixelRatio || 1, 1)
    canvas.width = canvas.offsetWidth * ratio
    canvas.height = canvas.offsetHeight * ratio
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(ratio, ratio)
    }

    padRef.current = new SignaturePad(canvas, {
      penColor: '#000000',
      backgroundColor: 'rgba(255,255,255,0)',
    })

    return () => {
      padRef.current?.off()
    }
  }, [])

  useEffect(() => {
    if (padRef.current) {
      padRef.current.penColor = penColor
    }
  }, [penColor])

  const clear = () => {
    padRef.current?.clear()
  }

  const save = () => {
    const canvas = canvasRef.current
    if (!canvas || padRef.current?.isEmpty()) return
    const dataUrl = canvas.toDataURL('image/png')
    onSave(dataUrl)
  }

  return (
    <div className="sig-canvas-panel">
      <div className="sig-canvas-header">
        <span>วาดลายเซ็น</span>
        <div className="sig-color-picker">
          <label>
            <input
              type="color"
              value={penColor}
              onChange={(e) => setPenColor(e.target.value)}
            />
            <span style={{ color: penColor }}>●</span>
          </label>
        </div>
      </div>
      <div className="sig-canvas-area">
        <canvas ref={canvasRef} className="sig-canvas" />
      </div>
      <div className="sig-canvas-actions">
        <button className="sig-btn secondary" onClick={clear} title="ล้าง">
          <Eraser size={14} />
          ล้าง
        </button>
        <button className="sig-btn secondary" onClick={onCancel}>
          ยกเลิก
        </button>
        <button className="sig-btn primary" onClick={save}>
          <Check size={14} />
          ใช้ลายเซ็นนี้
        </button>
      </div>
    </div>
  )
}
