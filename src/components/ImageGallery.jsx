import { useRef, useState } from 'react'
import { Camera, X } from 'lucide-react'
import { useImages } from '../hooks/useImages'
import { compressImage } from '../utils/imageStore'

const MAX_IMAGES = 3

function ImageViewer({ src, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col" onClick={onClose}>
      <div className="safe-top flex justify-end px-4 pt-4">
        <button className="p-2 rounded-full bg-white/10 text-white" onClick={onClose}>
          <X size={22} />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center p-3">
        <img src={src} className="max-w-full max-h-full object-contain rounded-xl" alt="Imagem" />
      </div>
    </div>
  )
}

function ThumbnailGrid({ dataUrls, onView, onRemove, onAdd, canAdd, compressing }) {
  return (
    <div className="flex gap-2 flex-wrap mt-2">
      {dataUrls.map((src, idx) => (
        <div key={idx} className="relative shrink-0">
          <button type="button" onClick={() => onView(src)}
            className="w-20 h-20 rounded-xl overflow-hidden border border-white/10 block active:opacity-80">
            <img src={src} className="w-full h-full object-cover" alt={`Foto ${idx + 1}`} />
          </button>
          <button type="button" onClick={() => onRemove(idx)}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shadow">
            <X size={10} className="text-white" />
          </button>
        </div>
      ))}
      {canAdd && (
        <button type="button" onClick={onAdd}
          className="w-20 h-20 rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-slate-400 hover:border-white/30 transition-colors shrink-0">
          {compressing
            ? <span className="text-xs text-center px-1">...</span>
            : <><Camera size={18} /><span className="text-xs">Foto</span></>
          }
        </button>
      )}
    </div>
  )
}

/* ── Mode 1: existing expense (expenseId) ─────────────── */
function GalleryExisting({ expenseId, label }) {
  const { images, addImage, deleteImage } = useImages(expenseId)
  const fileRef = useRef(null)
  const [viewing, setViewing] = useState(null)
  const [busy, setBusy] = useState(false)

  async function handleFile(e) {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    try { await addImage(file) } finally { setBusy(false) }
  }

  const canAdd = images.length < MAX_IMAGES && !busy

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</label>
        {canAdd && (
          <button type="button" onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
            <Camera size={13} />
            {busy ? 'Processando...' : 'Adicionar foto'}
          </button>
        )}
      </div>

      {images.length === 0 ? (
        <button type="button" onClick={() => fileRef.current?.click()}
          className="mt-2 w-full border border-dashed border-white/15 rounded-xl py-3 flex items-center justify-center gap-2 text-slate-500 hover:text-slate-400 hover:border-white/25 transition-colors">
          <Camera size={18} />
          <span className="text-xs">Tirar foto ou escolher da galeria</span>
        </button>
      ) : (
        <ThumbnailGrid
          dataUrls={images.map(i => i.dataUrl)}
          onView={setViewing}
          onRemove={(idx) => deleteImage(images[idx].id)}
          onAdd={() => fileRef.current?.click()}
          canAdd={canAdd}
          compressing={busy}
        />
      )}

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {viewing && <ImageViewer src={viewing} onClose={() => setViewing(null)} />}
    </div>
  )
}

/* ── Mode 2: pending (new expense not yet saved) ─────── */
function GalleryPending({ pendingImages, onAdd, onRemove, label }) {
  const fileRef = useRef(null)
  const [viewing, setViewing] = useState(null)
  const [busy, setBusy] = useState(false)

  async function handleFile(e) {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    try {
      const dataUrl = await compressImage(file)
      onAdd(dataUrl)
    } finally {
      setBusy(false)
    }
  }

  const canAdd = pendingImages.length < MAX_IMAGES && !busy

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</label>
        {canAdd && (
          <button type="button" onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
            <Camera size={13} />
            {busy ? 'Processando...' : 'Adicionar foto'}
          </button>
        )}
      </div>

      {pendingImages.length === 0 ? (
        <button type="button" onClick={() => fileRef.current?.click()}
          className="mt-2 w-full border border-dashed border-white/15 rounded-xl py-3 flex items-center justify-center gap-2 text-slate-500 hover:text-slate-400 hover:border-white/25 transition-colors">
          <Camera size={18} />
          <span className="text-xs">Tirar foto ou escolher da galeria</span>
        </button>
      ) : (
        <ThumbnailGrid
          dataUrls={pendingImages}
          onView={setViewing}
          onRemove={onRemove}
          onAdd={() => fileRef.current?.click()}
          canAdd={canAdd}
          compressing={busy}
        />
      )}

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {viewing && <ImageViewer src={viewing} onClose={() => setViewing(null)} />}
    </div>
  )
}

/* ── Public API ───────────────────────────────────────── */
export function ImageGallery({ expenseId, pendingImages, onAdd, onRemove, label = 'Fotos' }) {
  if (expenseId) {
    return <GalleryExisting expenseId={expenseId} label={label} />
  }
  return <GalleryPending pendingImages={pendingImages || []} onAdd={onAdd} onRemove={onRemove} label={label} />
}
