import { useState } from 'react'
import { Modal } from '../../../components/ui/Modal'
import { SegmentedTabs } from '../../../components/ui/SegmentedTabs'
import { useCreateCategory, useUpdateCategory } from '../hooks'
import type { Category, CategoryType } from '../types'

const PALETTE = [
  '#16A89A', '#2563EB', '#D97706', '#6BBF3F', '#8B5CF6', '#DC2626',
  '#0EA5E9', '#EC4899', '#F59E0B', '#10B981', '#64748B', '#7C3AED',
]

interface CategoryFormDrawerProps {
  category?: Category
  onClose: () => void
}

export function CategoryFormDrawer({ category, onClose }: CategoryFormDrawerProps) {
  const isEditing = category !== undefined

  const [name, setName] = useState(category?.name ?? '')
  const [type, setType] = useState<CategoryType>(category?.type ?? 'expense')
  const [color, setColor] = useState<string | null>(category?.color ?? null)
  const [error, setError] = useState<string | null>(null)

  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()

  const isSaving = createMutation.isPending || updateMutation.isPending

  async function handleSubmit() {
    if (!name.trim()) {
      setError('El nombre de la categoría es requerido.')
      return
    }
    setError(null)
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: category.id, payload: { name: name.trim(), type, color } })
      } else {
        await createMutation.mutateAsync({ name: name.trim(), type, color })
      }
      onClose()
    } catch {
      setError(isEditing ? 'Error al guardar los cambios. Intenta nuevamente.' : 'Error al crear la categoría. Intenta nuevamente.')
    }
  }

  const previewColor = color ?? 'var(--border-strong)'

  const footer = (
    <div style={{ display: 'flex', gap: 10 }}>
      <button
        type="button"
        onClick={onClose}
        style={{ flex: 1, height: 42, border: '1px solid var(--border)', borderRadius: 9, background: 'var(--card)', color: 'var(--text)', fontFamily: 'inherit', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
      >
        Cancelar
      </button>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSaving}
        style={{ flex: 1.4, height: 42, border: 'none', borderRadius: 9, background: 'var(--grad)', color: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: 'var(--shadow)', opacity: isSaving ? 0.7 : 1 }}
      >
        {isSaving ? (isEditing ? 'Guardando…' : 'Creando…') : (isEditing ? 'Guardar cambios' : 'Crear')}
      </button>
    </div>
  )

  return (
    <Modal title={isEditing ? 'Editar categoría' : 'Nueva categoría'} onClose={onClose} position="right" width={440} footer={footer}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        <div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--muted)', marginBottom: 8 }}>Nombre</div>
          <div style={{ display: 'flex', alignItems: 'center', height: 44, border: '1px solid var(--border-strong)', borderRadius: 10, background: 'var(--field)', padding: '0 14px' }}>
            <input
              autoFocus
              placeholder="Ej. Suscripciones"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontFamily: 'inherit', fontSize: 14, color: 'var(--text)' }}
            />
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--muted)', marginBottom: 8 }}>Tipo</div>
          <SegmentedTabs
            fullWidth
            value={type}
            onChange={setType}
            options={[
              {
                value: 'expense',
                label: (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
                    </svg>
                    Gasto
                  </>
                ),
              },
              {
                value: 'income',
                label: (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
                    </svg>
                    Ingreso
                  </>
                ),
              },
            ]}
          />
        </div>

        <div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--muted)', marginBottom: 10 }}>Color</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 11 }}>
            {PALETTE.map((c) => (
              <span
                key={c}
                onClick={() => setColor(color === c ? null : c)}
                style={{
                  width: 30, height: 30, borderRadius: 8, background: c, cursor: 'pointer', flexShrink: 0,
                  boxShadow: color === c ? `0 0 0 2px var(--card), 0 0 0 4px ${c}` : undefined,
                }}
              />
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--muted)', marginBottom: 8 }}>Vista previa</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13, background: 'var(--card-2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
            <span style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: previewColor }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {name.trim() || 'Nombre de categoría'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Sin movimientos aún</div>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ fontSize: 13, color: 'var(--neg)', background: 'var(--neg-bg)', borderRadius: 8, padding: '10px 14px' }}>
            {error}
          </div>
        )}
      </div>
    </Modal>
  )
}
