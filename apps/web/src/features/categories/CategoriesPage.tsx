import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EditIcon, LockIcon, PlusIcon, TrashIcon } from '../../components/ui/icons'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { CategoryFormDrawer } from './components/CategoryFormDrawer'
import { useCategories, useDeleteCategory } from './hooks'
import type { Category } from './types'

type Scope = 'all' | 'mine' | 'system'

const SCOPE_TABS: { value: Scope; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'mine', label: 'Mías' },
  { value: 'system', label: 'Sistema' },
]

export function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories()
  const deleteMutation = useDeleteCategory()

  const [scope, setScope] = useState<Scope>('all')
  // null = closed, 'new' = create, Category = edit
  const [editing, setEditing] = useState<Category | 'new' | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setEditing('new') // eslint-disable-line react-hooks/set-state-in-effect
      setSearchParams(  
        prev => { const n = new URLSearchParams(prev); n.delete('action'); return n },
        { replace: true },
      )
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const [deleteTarget, setDeleteTarget] = useState<Category | undefined>()
  const [deleteError, setDeleteError] = useState(false)

  const mine = categories.filter((c) => !c.isSystem)
  const system = categories.filter((c) => c.isSystem)
  const scopeCounts = { all: categories.length, mine: mine.length, system: system.length }

  const filtered = scope === 'mine' ? mine : scope === 'system' ? system : categories
  const expenses = filtered.filter((c) => c.type === 'expense')
  const incomes = filtered.filter((c) => c.type === 'income')

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      setDeleteTarget(undefined)
    } catch {
      setDeleteError(true)
    }
  }

  if (isLoading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ height: 62, borderRadius: 12, background: 'var(--card-2)', animation: 'wl-shimmer 1.2s infinite linear', backgroundSize: '800px 100%', backgroundImage: 'linear-gradient(90deg, var(--card-2) 0%, var(--border) 50%, var(--card-2) 100%)' }} />
        ))}
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 13.5, color: 'var(--muted)', maxWidth: 560 }}>
          Las categorías son una dimensión de análisis del gasto — no reemplazan a los fondos.
        </div>
        <button
          type="button"
          onClick={() => setEditing('new')}
          style={{ display: 'flex', alignItems: 'center', gap: 7, height: 36, padding: '0 14px', border: 'none', borderRadius: 9, background: 'var(--grad)', color: '#fff', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: 'var(--shadow)', flexShrink: 0 }}
        >
          <PlusIcon />
          Nueva categoría
        </button>
      </div>

      <div style={{ display: 'inline-flex', padding: 3, background: 'var(--card-2)', border: '1px solid var(--border)', borderRadius: 10, gap: 3, marginBottom: 22 }}>
        {SCOPE_TABS.map((tab) => {
          const active = scope === tab.value
          return (
            <div
              key={tab.value}
              onClick={() => setScope(tab.value)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '6px 13px', borderRadius: 7,
                fontSize: 13, cursor: 'pointer', transition: 'all .15s',
                background: active ? 'var(--card)' : 'transparent',
                color: active ? 'var(--text)' : 'var(--muted)',
                boxShadow: active ? 'var(--shadow)' : undefined,
                fontWeight: active ? 600 : 400,
              }}
            >
              {tab.label}
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', background: 'var(--bg)', borderRadius: 20, padding: '1px 7px', fontVariantNumeric: 'tabular-nums' }}>
                {scopeCounts[tab.value]}
              </span>
            </div>
          )
        })}
      </div>

      <CategorySection
        label="Gastos"
        categories={expenses}
        emptyText="No hay categorías de gasto en este grupo."
        bottomGap
        onEdit={(c) => setEditing(c)}
        onDelete={setDeleteTarget}
      />
      <CategorySection
        label="Ingresos"
        categories={incomes}
        emptyText="No hay categorías de ingreso en este grupo."
        onEdit={(c) => setEditing(c)}
        onDelete={setDeleteTarget}
      />

      {editing !== null && (
        <CategoryFormDrawer
          category={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title={`Eliminar «${deleteTarget.name}»`}
          description={
            <>Esta categoría se quitará de tu lista. Tus movimientos <b style={{ color: 'var(--text)', fontWeight: 600 }}>no se borran</b>: quedarán sin categoría hasta que les asignes otra.{deleteError && <span style={{ display: 'block', color: 'var(--neg)', marginTop: 6 }}>Error al eliminar. Intenta nuevamente.</span>}</>
          }
          isPending={deleteMutation.isPending}
          onConfirm={handleDelete}
          onClose={() => { setDeleteTarget(undefined); setDeleteError(false) }}
        />
      )}
    </div>
  )
}

function CategorySection({ label, categories, emptyText, bottomGap, onEdit, onDelete }: {
  label: string
  categories: Category[]
  emptyText: string
  bottomGap?: boolean
  onEdit: (c: Category) => void
  onDelete: (c: Category) => void
}) {
  return (
    <div style={{ marginBottom: bottomGap ? 26 : 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>· {categories.length}</span>
      </div>
      {categories.length === 0 ? (
        <div style={{ fontSize: 13, color: 'var(--muted)', padding: '14px 0' }}>{emptyText}</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  )
}

function CategoryCard({ category, onEdit, onDelete }: { category: Category; onEdit: (c: Category) => void; onDelete: (c: Category) => void }) {
  const swatchColor = category.color ?? 'var(--border-strong)'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: 'var(--shadow)', padding: '13px 15px', transition: 'border-color .15s' }}>
      <span style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: swatchColor }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{category.name}</div>
        <div style={{ fontSize: 12, color: category.type === 'income' ? 'var(--pos)' : 'var(--muted)' }}>
          {category.type === 'expense' ? 'Gasto' : 'Ingreso'}
        </div>
      </div>
      {category.isSystem ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0, fontSize: 10.5, fontWeight: 600, color: 'var(--muted)', background: 'var(--card-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 7px' }}>
          <LockIcon color="var(--muted)" />
          Sistema
        </span>
      ) : (
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => onEdit(category)}
            aria-label="Editar"
            style={{ width: 30, height: 30, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--card)', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <EditIcon />
          </button>
          <button
            type="button"
            onClick={() => onDelete(category)}
            aria-label="Eliminar"
            style={{ width: 30, height: 30, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--card)', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <TrashIcon />
          </button>
        </div>
      )}
    </div>
  )
}
