import { useMutation } from '@tanstack/react-query'
import { importCommit, importPreview } from './api'

export function useImportPreview() {
  return useMutation({
    mutationFn: ({ file, year }: { file: File; year?: number }) => importPreview(file, year),
  })
}

export function useImportCommit() {
  return useMutation({
    mutationFn: importCommit,
  })
}
