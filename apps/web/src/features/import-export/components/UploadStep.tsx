import { useRef, useState } from 'react'

interface Props {
  onFileReady: (file: File) => void
  isPending: boolean
  error: string | null
}

const ACCEPTED = ['.xlsx', '.csv']

function validateFile(file: File): string | null {
  const name = file.name.toLowerCase()
  if (!ACCEPTED.some((ext) => name.endsWith(ext))) {
    return 'Formato no válido. Usa un archivo .xlsx o .csv.'
  }
  return null
}

export function UploadStep({ onFileReady, isPending, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  function handleFile(file: File) {
    const err = validateFile(file)
    if (err) {
      setLocalError(err)
      setSelectedFile(null)
      return
    }
    setLocalError(null)
    setSelectedFile(file)
    onFileReady(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const displayError = localError ?? error

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          background: 'var(--card)',
          border: `2px ${dragOver ? 'solid' : 'dashed'} ${dragOver ? 'var(--info)' : 'var(--border-strong)'}`,
          borderRadius: 16,
          padding: '56px 24px',
          textAlign: 'center',
          opacity: isPending ? 0.6 : 1,
          pointerEvents: isPending ? 'none' : 'auto',
          transition: 'border-color 0.15s',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: 'var(--tint)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--info)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v11M12 3l-4 4M12 3l4 4" />
            <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
          </svg>
        </div>
        <div style={{ fontSize: 16, fontWeight: 600 }}>
          {isPending ? 'Analizando archivo…' : 'Arrastra tu cartola o Excel aquí'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>
          Formatos .xlsx, .csv · columnas fecha, descripción, monto, fondo
        </div>

        {displayError && (
          <div style={{ fontSize: 13, color: 'var(--neg)', marginTop: 10, fontWeight: 500 }}>
            {displayError}
          </div>
        )}

        {!isPending && (
          <>
            <button
              onClick={() => inputRef.current?.click()}
              style={{
                marginTop: 20,
                height: 40,
                padding: '0 18px',
                border: '1px solid var(--border)',
                borderRadius: 9,
                background: 'var(--card)',
                color: 'var(--text)',
                fontFamily: 'inherit',
                fontSize: 13.5,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Seleccionar archivo
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.csv"
              style={{ display: 'none' }}
              onChange={handleInputChange}
            />
          </>
        )}
      </div>

      {selectedFile && !isPending && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            boxShadow: 'var(--shadow)',
            padding: '14px 18px',
            marginTop: 16,
          }}
        >
          <span
            style={{
              width: 38,
              height: 38,
              borderRadius: 9,
              background: 'var(--pos-bg)',
              color: 'var(--pos)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 'none',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 3v5h5" />
              <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            </svg>
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>{selectedFile.name}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
              {(selectedFile.size / 1024).toFixed(0)} KB
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
