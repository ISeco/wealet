import { useState, type SubmitEvent } from 'react'
import { Modal } from '../../components/ui/Modal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Select } from '../../components/ui/Select'
import { DateInput } from '../../components/ui/DateInput'
import { SegmentedTabs } from '../../components/ui/SegmentedTabs'
import { Button } from '../../components/ui/Button'
import { TrashIcon } from '../../components/ui/icons'
import { activeFunds, useFunds } from '../funds'
import { useCategories } from '../categories'
import { formatThousands, parseMoney } from '../../lib/money'
import { useFormFieldErrors } from '../../lib/useFormFieldErrors'
import { ApiError } from '../../lib/api/client'
import { useCreateTransaction, useDeleteTransaction, useUpdateTransaction } from './hooks'
import type { Transaction, TransactionType } from './types'

const CURRENCY = 'CLP'
const REQUIRED_FIELDS = ['fundId', 'categoryId', 'amount', 'occurredOn'] as const

interface TransactionFormModalProps {
  transaction: Transaction | null
  onClose: () => void
}

function minorUnitsToInput(amount: string): string {
  return BigInt(amount).toString()
}

export function TransactionFormModal({ transaction, onClose }: TransactionFormModalProps) {
  const isEditing = transaction !== null
  const { data: funds } = useFunds()
  const { data: categories } = useCategories()

  const [type, setType] = useState<TransactionType>(transaction?.type ?? 'expense')
  const [fundId, setFundId] = useState(transaction?.fundId ?? '')
  const [categoryId, setCategoryId] = useState(transaction?.categoryId ?? '')
  const [amount, setAmount] = useState(transaction ? minorUnitsToInput(transaction.amount) : '')
  const [description, setDescription] = useState(transaction?.description ?? '')
  const [occurredOn, setOccurredOn] = useState(
    transaction?.occurredOn ? transaction.occurredOn.slice(0, 10) : new Date().toISOString().slice(0, 10),
  )
  const [error, setError] = useState<string | null>(null)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const { fieldErrors, register, clearFieldError, validate } = useFormFieldErrors(REQUIRED_FIELDS)

  const createMutation = useCreateTransaction()
  const updateMutation = useUpdateTransaction()
  const deleteMutation = useDeleteTransaction()

  const isSaving = createMutation.isPending || updateMutation.isPending
  const filteredCategories = (categories ?? []).filter((category) => category.type === type)
  const selectedFund = (funds ?? []).find((fund) => fund.id === fundId)

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const isValid = validate({
      fundId: !fundId,
      categoryId: !categoryId,
      amount: !amount,
      occurredOn: !occurredOn,
    })
    if (!isValid) {
      setError('Completa todos los campos requeridos.')
      return
    }

    let minorUnits: string
    try {
      minorUnits = parseMoney(amount, CURRENCY)
    } catch {
      setError('Monto inválido.')
      validate({ amount: true })
      return
    }

    const payload = {
      fundId,
      categoryId,
      type,
      amount: minorUnits,
      currency: CURRENCY,
      description: description || undefined,
      occurredOn,
    }

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: transaction.id, payload })
      } else {
        await createMutation.mutateAsync(payload)
      }
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar la transacción.')
    }
  }

  async function handleDelete() {
    if (!transaction) return
    try {
      await deleteMutation.mutateAsync(transaction.id)
      onClose()
    } catch (err) {
      setShowConfirmDelete(false)
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar la transacción.')
    }
  }

  const fieldStyle = {
    width: '100%',
    height: 44,
    border: '1px solid var(--border)',
    borderRadius: 10,
    background: 'var(--field)',
    padding: '0 14px',
    fontFamily: 'inherit',
    fontSize: 14,
    color: 'var(--text)',
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  return (
    <>
    <Modal
      title={isEditing ? 'Editar transacción' : 'Nueva transacción'}
      onClose={onClose}
      position="right"
      width={440}
      footer={
        <div style={{ display: 'flex', gap: 10 }}>
          {isEditing && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowConfirmDelete(true)}
              aria-label="Eliminar"
              style={{ width: 42, height: 42, padding: 0 }}
            >
              <TrashIcon color="var(--neg)" />
            </Button>
          )}
          <Button type="button" variant="secondary" onClick={onClose} style={{ flex: 1, height: 42 }}>
            Cancelar
          </Button>
          <Button type="submit" form="tx-form" disabled={isSaving} style={{ flex: 1.4, height: 42 }}>
            {isSaving ? 'Guardando…' : 'Guardar transacción'}
          </Button>
        </div>
      }
    >
      <form id="tx-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--muted)', marginBottom: 8 }}>Tipo</div>
          <SegmentedTabs
            fullWidth
            value={type}
            onChange={(value) => {
              setType(value)
              setCategoryId('')
            }}
            options={[
              { value: 'expense', label: 'Gasto', activeColor: 'var(--neg)' },
              { value: 'income', label: 'Ingreso', activeColor: 'var(--pos)' },
            ]}
          />
        </div>

        <div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--muted)', marginBottom: 8 }}>Monto</div>
          <div style={{ display: 'flex', alignItems: 'center', height: 52, border: `1px solid ${fieldErrors.amount ? 'var(--neg)' : 'var(--border-strong)'}`, borderRadius: 10, background: 'var(--field)', padding: '0 16px' }}>
            <span style={{ fontSize: 24, fontWeight: 500, color: 'var(--muted)' }}>$</span>
            <input
              ref={register('amount')}
              value={formatThousands(amount)}
              onChange={(event) => {
                setAmount(event.target.value.replace(/\D/g, ''))
                clearFieldError('amount')
              }}
              inputMode="numeric"
              placeholder="0"
              required
              style={{
                flex: 1,
                border: 'none',
                background: 'none',
                outline: 'none',
                fontFamily: 'inherit',
                fontSize: 24,
                fontWeight: 600,
                color: 'var(--text)',
                marginLeft: 6,
                fontVariantNumeric: 'tabular-nums',
              }}
            />
          </div>
        </div>

        <Select
          ref={register('fundId')}
          label="Fondo de origen"
          placeholder="Selecciona un fondo"
          value={fundId}
          onChange={(event) => {
            setFundId(event.target.value)
            clearFieldError('fundId')
          }}
          options={activeFunds(funds ?? []).map((fund) => ({ value: fund.id, label: fund.name }))}
          required
          error={fieldErrors.fundId}
          style={{ height: 44, borderRadius: 10 }}
        />

        <Select
          ref={register('categoryId')}
          label="Categoría"
          placeholder="Selecciona una categoría"
          value={categoryId}
          onChange={(event) => {
            setCategoryId(event.target.value)
            clearFieldError('categoryId')
          }}
          options={filteredCategories.map((category) => ({ value: category.id, label: category.name }))}
          required
          error={fieldErrors.categoryId}
          style={{ height: 44, borderRadius: 10 }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <DateInput
            ref={register('occurredOn')}
            label="Fecha"
            value={occurredOn}
            onChange={(event) => {
              setOccurredOn(event.target.value)
              clearFieldError('occurredOn')
            }}
            required
            error={fieldErrors.occurredOn}
            maxDate={new Date().toISOString().slice(0, 10)}
          />
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--muted)', marginBottom: 8 }}>Descripción</div>
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Opcional"
              style={fieldStyle}
            />
          </div>
        </div>

        {selectedFund && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, padding: '12px 14px', background: 'var(--tint)', border: '1px solid var(--border)', borderRadius: 10 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--info)" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', marginTop: 1 }}>
              <circle cx="12" cy="12" r="9"></circle>
              <path d="M12 16v-5M12 8h.01"></path>
            </svg>
            <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5 }}>
              {type === 'expense' ? 'Este gasto saldrá de ' : 'Este ingreso entrará a '}
              <b style={{ color: 'var(--text)' }}>{selectedFund.name}</b>
              {type === 'expense' ? ', reduciendo su saldo disponible.' : ', aumentando su saldo disponible.'}
            </div>
          </div>
        )}

        {error && <div style={{ fontSize: 12.5, color: 'var(--neg)' }}>{error}</div>}
      </form>
    </Modal>

    {showConfirmDelete && transaction && (
      <ConfirmDialog
        title="Eliminar transacción"
        description="Esta acción no se puede deshacer. La transacción se eliminará permanentemente."
        isPending={deleteMutation.isPending}
        onConfirm={handleDelete}
        onClose={() => setShowConfirmDelete(false)}
      />
    )}
  </>
  )
}
