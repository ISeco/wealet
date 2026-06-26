import { useState } from 'react'
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
  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<Category | undefined>()

  const filtered = categories.filter((c) => {
    if (scope === 'mine') return !c.isSystem
    if (scope === 'system') return c.isSystem
    return true
  })

  const expenses = filtered.filter((c) => c.type === 'expense')
  const incomes = filtered.filter((c) => c.type === 'income')

  function countFor(scope: Scope) {
    return categories.filter((c) => {
      if (scope === 'mine') return !c.isSystem
      if (scope === 'system') return c.isSystem
      return true
    }).length
  }

  function openCreate() {
    setEditingCategory(undefined)
    setFormOpen(true)
  }

  function openEdit(cat: Category) {
    setEditingCategory(cat)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingCategory(undefined)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await deleteMutation.mutateAsync(deleteTarget.id)
    setDeleteTarget(undefined)
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
          onClick={openCreate}
          style={{ display: 'flex', alignItems: 'center', gap: 7, height: 36, padding: '0 14px', border: 'none', borderRadius: 9, background: 'var(--grad)', color: '#fff', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: 'var(--shadow)', flexShrink: 0 }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
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
                {countFor(tab.value)}
              </span>
            </div>
          )
        })}
      </div>

      <SectionLabel label="Gastos" count={expenses.length} />
      {expenses.length === 0 ? (
        <div style={{ fontSize: 13, color: 'var(--muted)', padding: '14px 0 26px' }}>
          No hay categorías de gasto en este grupo.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, marginBottom: 26 }}>
          {expenses.map((cat) => (
            <CategoryCard key={cat.id} category={cat} onEdit={openEdit} onDelete={setDeleteTarget} />
          ))}
        </div>
      )}

      <SectionLabel label="Ingresos" count={incomes.length} />
      {incomes.length === 0 ? (
        <div style={{ fontSize: 13, color: 'var(--muted)', padding: '14px 0' }}>
          No hay categorías de ingreso en este grupo.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {incomes.map((cat) => (
            <CategoryCard key={cat.id} category={cat} onEdit={openEdit} onDelete={setDeleteTarget} />
          ))}
        </div>
      )}

      {formOpen && (
        <CategoryFormDrawer
          category={editingCategory}
          onClose={closeForm}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title={`Eliminar «${deleteTarget.name}»`}
          description={
            <>Esta categoría se quitará de tu lista. Tus movimientos <b style={{ color: 'var(--text)', fontWeight: 600 }}>no se borran</b>: quedarán sin categoría hasta que les asignes otra.</>
          }
          isPending={deleteMutation.isPending}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(undefined)}
        />
      )}
    </div>
  )
}

function SectionLabel({ label, count }: { label: string; count: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>· {count}</span>
    </div>
  )
}

function CategoryCard({ category, onEdit, onDelete }: { category: Category; onEdit: (c: Category) => void; onDelete: (c: Category) => void }) {
  const typeLabel = category.type === 'expense' ? 'Gasto' : 'Ingreso'
  const swatchColor = category.color ?? 'var(--border-strong)'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: 'var(--shadow)', padding: '13px 15px', transition: 'border-color .15s' }}>
      <span style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: swatchColor }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{category.name}</div>
        <div style={{ fontSize: 12, color: category.type === 'income' ? 'var(--pos)' : 'var(--muted)' }}>{typeLabel}</div>
      </div>
      {category.isSystem ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0, fontSize: 10.5, fontWeight: 600, color: 'var(--muted)', background: 'var(--card-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 7px' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onDelete(category)}
            aria-label="Eliminar"
            style={{ width: 30, height: 30, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--card)', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
