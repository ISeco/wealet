import { useQuery } from '@tanstack/react-query'
import { listCategories } from './api'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: listCategories,
  })
}
