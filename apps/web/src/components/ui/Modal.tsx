import { useEffect, type ReactNode } from 'react'
import { CloseIcon } from '../../app/icons'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  width?: number
  position?: 'center' | 'right'
}

export function Modal({ title, onClose, children, footer, width = 480, position = 'center' }: ModalProps) {
  const isDrawer = position === 'right'

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
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15,34,64,.42)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: isDrawer ? 'stretch' : 'center',
        justifyContent: isDrawer ? 'flex-end' : 'center',
        zIndex: 100,
        padding: isDrawer ? 0 : 16,
        animation: 'wl-fade .15s both',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: isDrawer ? width : '100%',
          maxWidth: isDrawer ? '94vw' : width,
          height: isDrawer ? '100%' : undefined,
          maxHeight: isDrawer ? undefined : '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--card)',
          borderRadius: isDrawer ? 0 : 16,
          borderLeft: isDrawer ? '1px solid var(--border)' : undefined,
          border: isDrawer ? undefined : '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 22px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{title}</div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              width: 30,
              height: 30,
              border: 'none',
              borderRadius: 8,
              background: 'var(--card-2)',
              color: 'var(--muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CloseIcon />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 22 }}>{children}</div>
        {footer && <div style={{ padding: '18px 22px', borderTop: '1px solid var(--border)' }}>{footer}</div>}
      </div>
    </div>
  )
}
