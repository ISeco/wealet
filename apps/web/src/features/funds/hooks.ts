import { useQuery } from '@tanstack/react-query'
import { listFunds } from './api'

export function useFunds() {
  return useQuery({
    queryKey: ['funds'],
    queryFn: listFunds,
  })
}
