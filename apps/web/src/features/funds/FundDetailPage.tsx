// apps/web/src/features/funds/FundDetailPage.tsx
import { useNavigate, useParams } from 'react-router-dom'
import { FundDetail } from './FundDetail'

export function FundDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  if (!id) return null

  return <FundDetail fundId={id} onBack={() => navigate('/fondos')} />
}
