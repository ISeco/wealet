import { useState } from 'react'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { Modal } from '../../../components/ui/Modal'
import { TrashIcon } from '../../../app/icons'
import { useCreateFund, useDeleteFund, useUpdateFund } from '../hooks'
import type { Fund, FundClassification } from '../types'

const PRESET_COLORS = ['#16A89A', '#2563EB', '#D97706', '#6BBF3F', '#8B5CF6', '#DC2626']

const CLASSIFICATIONS: { value: FundClassification; label: string; cssColor: string; cssBg: string }[] = [
  { value: 'available', label: 'Disponible', cssColor: 'var(--disp)', cssBg: 'var(--disp-bg)' },
  { value: 'reserve', label: 'Reserva', cssColor: 'var(--res)', cssBg: 'var(--res-bg)' },
  { value: 'committed', label: 'Comprometido', cssColor: 'var(--comp)', cssBg: 'var(--comp-bg)' },
]

interface FundFormDrawerProps {
  fund?: Fund
  onClose: () => void
  onDelete?: () => void
}

export function FundFormDrawer({ fund, onClose, onDelete }: FundFormDrawerProps) {
  const isEditing = fund !== undefined

  const [name, setName] = useState(fund?.name ?? '')
  const [classification, setClassification] = useState<FundClassification>(fund?.classification ?? 'available')
  const [color, setColor] = useState<string | null>(fund?.color ?? null)
  const [countsForRunway, setCountsForRunway] = useState(fund?.countsForRunway ?? false)
  const [targetPercentage, setTargetPercentage] = useState<string>(
    fund?.targetPercentage != null ? String(fund.targetPercentage) : ''
  )
  const [error, setError] = useState<string | null>(null)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  const createMutation = useCreateFund()
  const updateMutation = useUpdateFund()
  const deleteMutation = useDeleteFund()

  const isSaving = createMutation.isPending || updateMutation.isPending

  async function handleSubmit() {
    if (!name.trim()) {
      setError('El nombre del fondo es requerido.')
      return
    }
    const pct = targetPercentage.trim() === '' ? undefined : Number(targetPercentage)
    if (pct !== undefined && (isNaN(pct) || pct < 1 || pct > 100 || !Number.isInteger(pct))) {
      setError('La meta debe ser un número entero entre 1 y 100.')
      return
    }
    setError(null)
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: fund.id, payload: { name: name.trim(), classification, color: color ?? undefined, countsForRunway, targetPercentage: pct } })
      } else {
        await createMutation.mutateAsync({ name: name.trim(), classification, color: color ?? undefined, countsForRunway, targetPercentage: pct })
      }
      onClose()
    } catch {
      setError(isEditing ? 'Error al guardar los cambios. Intenta nuevamente.' : 'Error al crear el fondo. Intenta nuevamente.')
    }
  }

  async function handleDelete() {
    if (!fund) return
    try {
      await deleteMutation.mutateAsync(fund.id)
      onDelete?.()
    } catch {
      setShowConfirmDelete(false)
      setError('Error al eliminar el fondo. Intenta nuevamente.')
    }
  }

  const footer = (
    <div style={{ display: 'flex', gap: 10 }}>
      {isEditing && (
        <button
          type="button"
          onClick={() => setShowConfirmDelete(true)}
          aria-label="Eliminar"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 42, height: 42, border: '1px solid var(--border)', borderRadius: 9, background: 'var(--card)', color: 'var(--neg)', cursor: 'pointer' }}
        >
          <TrashIcon color="var(--neg)" />
        </button>
      )}
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
        {isSaving ? (isEditing ? 'Guardando…' : 'Creando…') : (isEditing ? 'Guardar cambios' : 'Crear fondo')}
      </button>
    </div>
  )

  return (
    <>
    <Modal title={isEditing ? 'Editar fondo' : 'Nuevo fondo'} onClose={onClose} position="right" width={440} footer={footer}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--muted)', marginBottom: 8 }}>Nombre del fondo</div>
          <div style={{ display: 'flex', alignItems: 'center', height: 44, border: '1px solid var(--border-strong)', borderRadius: 10, background: 'var(--field)', padding: '0 14px' }}>
            <input
              autoFocus
              placeholder="Ej. Fondo Vacaciones"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontFamily: 'inherit', fontSize: 14, color: 'var(--text)' }}
            />
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--muted)', marginBottom: 8 }}>Clasificación</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {CLASSIFICATIONS.map((c) => {
              const active = classification === c.value
              return (
                <div
                  key={c.value}
                  onClick={() => setClassification(c.value)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
                    padding: '12px 6px', borderRadius: 10, cursor: 'pointer',
                    border: active ? 'none' : '1px solid var(--border-strong)',
                    background: active ? c.cssBg : 'var(--card)',
                    boxShadow: active ? `0 0 0 1.5px ${c.cssColor}` : undefined,
                  }}
                >
                  <span style={{ width: 9, height: 9, borderRadius: 3, background: c.cssColor }} />
                  <span style={{ fontSize: 12.5, fontWeight: active ? 600 : 500, color: active ? c.cssColor : 'var(--muted)' }}>
                    {c.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--muted)', marginBottom: 8 }}>Color</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {PRESET_COLORS.map((c) => (
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
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--muted)', marginBottom: 8 }}>Meta de asignación <span style={{ fontWeight: 400 }}>(opcional)</span></div>
          <div style={{ display: 'flex', alignItems: 'center', height: 44, border: '1px solid var(--border-strong)', borderRadius: 10, background: 'var(--field)', padding: '0 14px', gap: 8 }}>
            <input
              type="number"
              min={1}
              max={100}
              placeholder="Ej. 30"
              value={targetPercentage}
              onChange={(e) => setTargetPercentage(e.target.value)}
              style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontFamily: 'inherit', fontSize: 14, color: 'var(--text)' }}
            />
            <span style={{ fontSize: 14, color: 'var(--muted)', flexShrink: 0 }}>%</span>
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 6 }}>
            Porcentaje de ingresos que quieres destinar a este fondo. Usado en Salud financiera.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--tint)', border: '1px solid var(--border)', borderRadius: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--disp)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M12 2v20M2 12h20" />
            </svg>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Contar para el runway</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Incluir este fondo como colchón.</div>
            </div>
          </div>
          <div
            onClick={() => setCountsForRunway(!countsForRunway)}
            style={{ width: 38, height: 22, borderRadius: 11, background: countsForRunway ? 'var(--disp)' : 'var(--border-strong)', position: 'relative', flexShrink: 0, cursor: 'pointer', transition: 'background .15s' }}
          >
            <span style={{ position: 'absolute', top: 2, left: countsForRunway ? 18 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .15s' }} />
          </div>
        </div>

        {error && (
          <div style={{ fontSize: 13, color: 'var(--neg)', background: 'var(--neg-bg)', borderRadius: 8, padding: '10px 14px' }}>
            {error}
          </div>
        )}
      </div>
    </Modal>

    {showConfirmDelete && fund && (
      <ConfirmDialog
        title={`Eliminar «${fund.name}»`}
        description="El fondo se eliminará de tu lista. Si tiene movimientos registrados, se archivará en lugar de borrarse permanentemente."
        isPending={deleteMutation.isPending}
        onConfirm={handleDelete}
        onClose={() => setShowConfirmDelete(false)}
      />
    )}
    </>
  )
}
