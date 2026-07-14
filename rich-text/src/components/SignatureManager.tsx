import { useState } from 'react'
import { PenTool, Plus, Trash2 } from 'lucide-react'
import SignatureCanvas from './SignatureCanvas'
import type { SignatureData } from './SignatureLayer'

interface SignatureManagerProps {
  signatures: SignatureData[]
  onAdd: (sig: SignatureData) => void
  onRemove: (id: string) => void
  onClear: () => void
}

export default function SignatureManager({
  signatures,
  onAdd,
  onRemove,
  onClear,
}: SignatureManagerProps) {
  const [showCanvas, setShowCanvas] = useState(false)
  const [signerName, setSignerName] = useState('')

  const handleSave = (dataUrl: string) => {
    const name = signerName.trim() || `ผู้ลงนาม ${signatures.length + 1}`
    const now = new Date()
    const timestamp = now.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    onAdd({
      id: `sig-${Date.now()}`,
      dataUrl,
      signerName: name,
      position: { x: 0, y: 0 },
      size: { width: 180, height: 80 },
      timestamp,
    })

    setSignerName('')
    setShowCanvas(false)
  }

  return (
    <div className="sig-manager">
      {!showCanvas ? (
        <>
          <div className="sig-manager-header">
            <PenTool size={14} />
            <span>ลายเซ็น ({signatures.length})</span>
          </div>
          <div className="sig-manager-actions">
            <input
              type="text"
              placeholder="ชื่อผู้ลงนาม..."
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              className="sig-name-input"
            />
            <button className="sig-btn primary small" onClick={() => setShowCanvas(true)}>
              <Plus size={14} />
              สร้างลายเซ็น
            </button>
            {signatures.length > 0 && (
              <button className="sig-btn danger small" onClick={onClear}>
                <Trash2 size={14} />
                ลบทั้งหมด
              </button>
            )}
          </div>
          {signatures.length > 0 && (
            <div className="sig-list">
              {signatures.map((sig) => (
                <div key={sig.id} className="sig-list-item">
                  <img src={sig.dataUrl} alt={sig.signerName} className="sig-thumb" />
                  <div className="sig-info">
                    <span className="sig-name">{sig.signerName}</span>
                    <span className="sig-time">{sig.timestamp}</span>
                  </div>
                  <button
                    className="sig-remove-btn"
                    onClick={() => onRemove(sig.id)}
                    title="ลบ"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <SignatureCanvas onSave={handleSave} onCancel={() => setShowCanvas(false)} />
      )}
    </div>
  )
}
