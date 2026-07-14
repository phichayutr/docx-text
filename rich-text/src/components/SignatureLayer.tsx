import { Maximize2, Move, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export interface SignatureData {
  id: string;
  dataUrl: string;
  signerName: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  timestamp: string;
}

interface SignatureItemProps {
  sig: SignatureData;
  onUpdate: (id: string, updates: Partial<SignatureData>) => void;
  onRemove: (id: string) => void;
}

function SignatureItem({ sig, onUpdate, onRemove }: SignatureItemProps) {
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const startSize = useRef({ width: 0, height: 0, mouseX: 0, mouseY: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
    const item = (e.target as HTMLElement).closest(".signature-item");
    if (!item) return;
    const rect = item.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const handleResizeDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setResizing(true);
      startSize.current = {
        width: sig.size.width,
        height: sig.size.height,
        mouseX: e.clientX,
        mouseY: e.clientY,
      };
    },
    [sig.size],
  );

  useEffect(() => {
    if (!dragging) return;

    const handleMove = (e: MouseEvent) => {
      const item = document.querySelector(`[data-sig-id="${sig.id}"]`);
      if (!item) return;
      const page = item.closest(".a4-page");
      if (!page) return;
      const pageRect = page.getBoundingClientRect();

      const newX = e.clientX - pageRect.left - dragOffset.current.x;
      const newY = e.clientY - pageRect.top - dragOffset.current.y;

      onUpdate(sig.id, {
        position: {
          x: Math.max(0, Math.min(pageRect.width - sig.size.width, newX)),
          y: Math.max(0, Math.min(pageRect.height - sig.size.height, newY)),
        },
      });
    };

    const handleUp = () => setDragging(false);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [dragging, sig.id, sig.size.width, sig.size.height, onUpdate]);

  useEffect(() => {
    if (!resizing) return;

    const handleMove = (e: MouseEvent) => {
      const dx = e.clientX - startSize.current.mouseX;
      const dy = e.clientY - startSize.current.mouseY;
      const newWidth = Math.max(80, startSize.current.width + dx);
      const newHeight = Math.max(40, startSize.current.height + dy);
      onUpdate(sig.id, { size: { width: newWidth, height: newHeight } });
    };

    const handleUp = () => setResizing(false);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [resizing, sig.id, onUpdate]);

  return (
    <div
      className="signature-item"
      data-sig-id={sig.id}
      style={{
        left: sig.position.x,
        top: sig.position.y,
        width: sig.size.width,
        height: sig.size.height,
      }}
    >
      <img src={sig.dataUrl} alt={sig.signerName} draggable={false} />
      <div className="sig-item-controls">
        <button className="sig-control-btn" onMouseDown={handleMouseDown} title="ลากเพื่อย้าย">
          <Move size={12} />
        </button>
        <button className="sig-control-btn" onMouseDown={handleResizeDown} title="ลากเพื่อขยาย/ย่อ">
          <Maximize2 size={12} />
        </button>
        <button className="sig-control-btn delete" onClick={() => onRemove(sig.id)} title="ลบลายเซ็น">
          <X size={12} />
        </button>
      </div>
      <div className="sig-item-label">
        <span className="text-dark">{sig.signerName}</span>
        {/* <span className="sig-timestamp">{sig.timestamp}</span> */}
      </div>
    </div>
  );
}

interface SignatureLayerProps {
  signatures: SignatureData[];
  onUpdate: (id: string, updates: Partial<SignatureData>) => void;
  onRemove: (id: string) => void;
}

export default function SignatureLayer({ signatures, onUpdate, onRemove }: SignatureLayerProps) {
  return (
    <div className="signature-layer">
      {signatures.map((sig) => (
        <SignatureItem key={sig.id} sig={sig} onUpdate={onUpdate} onRemove={onRemove} />
      ))}
    </div>
  );
}
