import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../features/auth'
import { WealetIcon } from '../components/ui/WealetIcon'
import { navMain, navSys, type NavItem } from './navConfig'
import { ChevronRightIcon } from './icons'

function NavRow({ item, active }: { item: NavItem; active: boolean }) {
  const navigate = useNavigate()
  const Icon = item.icon

  return (
    <div
      onClick={item.disabled ? undefined : () => navigate(item.path)}
      className={`nav-row${item.disabled ? ' nav-row--disabled' : ''}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: '9px 12px',
        borderRadius: 9,
        cursor: item.disabled ? 'default' : 'pointer',
        fontSize: 13.5,
        position: 'relative',
        fontWeight: active ? 600 : 500,
        background: active ? 'var(--nav-active)' : 'transparent',
        color: item.disabled ? 'var(--muted)' : active ? 'var(--text)' : 'var(--muted)',
        opacity: item.disabled ? 0.55 : 1,
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: -12,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 3,
          height: 18,
          borderRadius: '0 3px 3px 0',
          background: 'var(--grad)',
          opacity: active ? 1 : 0,
        }}
      />
      <span style={{ width: 18, height: 18, display: 'flex', flex: 'none' }}>
        <Icon color={active ? 'var(--text)' : 'var(--muted)'} />
      </span>
      <span>{item.label}</span>
    </div>
  )
}

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const initials = (user?.displayName ?? user?.email ?? '?')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <aside
      style={{
        width: 252,
        flex: 'none',
        borderRight: '1px solid var(--border)',
        background: 'var(--card)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '20px 20px 18px' }}>
        <div style={{ width: 36, height: 36, flex: 'none' }}>
          <WealetIcon size={36} />
        </div>
        <div style={{ fontWeight: 600, fontSize: 18, letterSpacing: '-.02em', color: 'var(--text)' }}>Wealet</div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '6px 12px', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--muted)', padding: '12px 12px 6px', opacity: 0.8 }}>
          General
        </div>
        {navMain.map((item) => (
          <NavRow key={item.key} item={item} active={location.pathname === item.path} />
        ))}
        <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--muted)', padding: '16px 12px 6px', opacity: 0.8 }}>
          Sistema
        </div>
        {navSys.map((item) => (
          <NavRow key={item.key} item={item} active={location.pathname === item.path} />
        ))}
      </nav>

      <div style={{ borderTop: '1px solid var(--border)', padding: 12 }}>
        <div
          onClick={() => navigate('/ajustes')}
          className="user-row"
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8, borderRadius: 10, cursor: 'pointer' }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              flex: 'none',
              background: 'var(--grad)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.displayName ?? user?.email}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </div>
          </div>
          <ChevronRightIcon color="var(--muted)" />
        </div>
      </div>
    </aside>
  )
}
