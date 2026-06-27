import { useState } from 'react'
import { useAuth } from '../../auth'
import { useUpdateProfile } from '../hooks'
import { card } from '../styles'

export function ProfileCard() {
  const { user, refetchUser } = useAuth()
  const { mutateAsync, isPending } = useUpdateProfile()

  const [nameValue, setNameValue] = useState(user?.displayName ?? '')
  const nameChanged = nameValue !== (user?.displayName ?? '')

  const initials = (user?.displayName ?? user?.email ?? '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  async function handleSave() {
    await mutateAsync({ displayName: nameValue })
    await refetchUser()
  }

  return (
    <div style={card}>
      <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 18 }}>Perfil</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'var(--grad)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 600,
            fontSize: 22,
            flex: 'none',
          }}
        >
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Nombre</div>
              <input
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                style={{
                  width: '100%',
                  height: 42,
                  border: '1px solid var(--border)',
                  borderRadius: 9,
                  background: 'var(--field)',
                  padding: '0 12px',
                  fontSize: 14,
                  color: 'var(--text)',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Email</div>
              <div
                style={{
                  height: 42,
                  border: '1px solid var(--border)',
                  borderRadius: 9,
                  background: 'var(--field)',
                  padding: '0 12px',
                  fontSize: 14,
                  color: 'var(--muted)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {user?.email}
              </div>
            </div>
          </div>
          {nameChanged && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleSave}
                disabled={isPending}
                style={{
                  height: 34,
                  padding: '0 14px',
                  borderRadius: 7,
                  border: 'none',
                  background: 'var(--grad)',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: isPending ? 'default' : 'pointer',
                  opacity: isPending ? 0.7 : 1,
                  fontFamily: 'inherit',
                }}
              >
                {isPending ? 'Guardando…' : 'Guardar'}
              </button>
              <button
                onClick={() => setNameValue(user?.displayName ?? '')}
                disabled={isPending}
                style={{
                  height: 34,
                  padding: '0 14px',
                  borderRadius: 7,
                  border: '1px solid var(--border)',
                  background: 'var(--card)',
                  color: 'var(--text)',
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
