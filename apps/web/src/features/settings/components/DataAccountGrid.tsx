import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth'
import { exportAll } from '../api'
import { card } from '../styles'

export function DataAccountGrid() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState('')

  async function handleExport() {
    setExportError('')
    setIsExporting(true)
    try {
      await exportAll()
    } catch {
      setExportError('Error al exportar. Intenta nuevamente.')
    } finally {
      setIsExporting(false)
    }
  }

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div style={{ ...card, marginBottom: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 14 }}>Datos</div>
        <button disabled style={{ ...actionBtn, opacity: 0.5, cursor: 'not-allowed' }}>
          <UploadIcon />
          Importar desde Excel
        </button>
        <button
          onClick={handleExport}
          disabled={isExporting}
          style={{ ...actionBtn, marginBottom: 0, opacity: isExporting ? 0.7 : 1 }}
        >
          <DownloadIcon />
          {isExporting ? 'Exportando…' : 'Exportar todo (.csv)'}
        </button>
        {exportError && (
          <p style={{ fontSize: 12.5, color: 'var(--neg)', marginTop: 8, marginBottom: 0 }}>
            {exportError}
          </p>
        )}
      </div>

      <div style={{ ...card, marginBottom: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 14 }}>Cuenta</div>
        <button disabled style={{ ...actionBtn, opacity: 0.5, cursor: 'not-allowed' }}>
          Reconfigurar fondos
        </button>
        <button
          onClick={handleLogout}
          style={{
            ...actionBtn,
            marginBottom: 0,
            color: 'var(--neg)',
            background: 'var(--neg-bg)',
            border: '1px solid var(--neg)',
            fontWeight: 600,
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

const actionBtn: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  height: 42,
  padding: '0 14px',
  border: '1px solid var(--border)',
  borderRadius: 9,
  background: 'var(--card)',
  fontSize: 13.5,
  fontWeight: 500,
  color: 'var(--text)',
  cursor: 'pointer',
  fontFamily: 'inherit',
  width: '100%',
  marginBottom: 10,
  transition: 'border-color .15s',
}

function UploadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v11M12 3l-4 4M12 3l4 4" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 14V3M12 14l4-4M12 14l-4-4" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  )
}
