import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../components/ui/Button'
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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
      <div style={{ ...card, marginBottom: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 14 }}>Datos</div>
        <Button
          variant="secondary"
          onClick={() => navigate('/import')}
          style={{ ...actionBtnStyle, marginBottom: 10 }}
        >
          <UploadIcon />
          Importar desde Excel
        </Button>
        <Button
          variant="secondary"
          onClick={handleExport}
          disabled={isExporting}
          style={actionBtnStyle}
        >
          <DownloadIcon />
          {isExporting ? 'Exportando…' : 'Exportar todo (.xlsx)'}
        </Button>
        {exportError && (
          <p style={{ fontSize: 12.5, color: 'var(--neg)', marginTop: 8, marginBottom: 0 }}>
            {exportError}
          </p>
        )}
      </div>

      <div style={{ ...card, marginBottom: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 14 }}>Cuenta</div>
        <Button
          variant="secondary"
          onClick={() => navigate('/onboarding?from=settings')}
          style={{ ...actionBtnStyle, marginBottom: 10 }}
        >
          Reconfigurar fondos
        </Button>
        <Button
          variant="secondary"
          onClick={handleLogout}
          style={{
            ...actionBtnStyle,
            color: 'var(--neg)',
            background: 'var(--neg-bg)',
            border: '1px solid var(--neg)',
            fontWeight: 600,
          }}
        >
          Cerrar sesión
        </Button>
      </div>
    </div>
  )
}

const actionBtnStyle: React.CSSProperties = {
  gap: 10,
  height: 42,
  fontSize: 13.5,
  width: '100%',
  marginBottom: 0,
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
