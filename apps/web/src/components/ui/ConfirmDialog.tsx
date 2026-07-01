import { useEffect, type ReactNode } from 'react'

interface ConfirmDialogProps {
  title: string
  description: ReactNode
  confirmLabel?: string
  isPending?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDialog({ title, description, confirmLabel = 'Eliminar', isPending = false, onConfirm, onClose }: ConfirmDialogProps) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 110, background: 'rgba(15,34,64,.42)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, animation: 'wl-fade .15s both' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: 412, maxWidth: '94vw', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow-lg)', padding: 24, animation: 'wl-pop .18s both' }}
      >
        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--neg-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neg)', marginBottom: 16 }}>
          <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          </svg>
        </div>
        <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-.01em' }}>{title}</div>
        <div style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.55, marginTop: 8 }}>{description}</div>
        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button
            type="button"
            onClick={onClose}
            style={{ flex: 1, height: 42, border: '1px solid var(--border-strong)', borderRadius: 9, background: 'var(--card)', color: 'var(--text)', fontFamily: 'inherit', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            style={{ flex: 1, height: 42, border: 'none', borderRadius: 9, background: 'var(--neg)', color: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: isPending ? 0.7 : 1 }}
          >
            {isPending ? 'Eliminando…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
