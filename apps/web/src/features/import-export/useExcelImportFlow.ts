import { useState } from 'react'
import { useImportCommit, useImportPreview } from './hooks'
import { deriveRowsToCommit, isValidYear } from './importFlow.utils'
import type { ImportCommitResultDto, ImportPreviewResponseDto } from './types'

export type ExcelImportPhase = 'upload' | 'year' | 'preview'

export interface ExcelImportFlow {
  phase: ExcelImportPhase
  pendingFile: File | null
  yearInput: string
  setYearInput: (value: string) => void
  isYearValid: boolean
  previewData: ImportPreviewResponseDto | null
  approvedFunds: Set<string>
  isPreviewPending: boolean
  previewError: string | null
  isCommitPending: boolean
  commitError: string | null
  submitFile: (file: File) => void
  submitYear: () => void
  toggleFund: (name: string) => void
  back: () => void
  commit: (onSuccess: (result: ImportCommitResultDto) => void) => void
}

const CURRENT_YEAR = new Date().getFullYear()

export function useExcelImportFlow(): ExcelImportFlow {
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [yearInput, setYearInput] = useState(String(CURRENT_YEAR))
  const [awaitingYear, setAwaitingYear] = useState(false)
  const [previewData, setPreviewData] = useState<ImportPreviewResponseDto | null>(null)
  const [approvedFunds, setApprovedFunds] = useState<Set<string>>(new Set())

  const previewMutation = useImportPreview()
  const commitMutation = useImportCommit()

  const phase: ExcelImportPhase = awaitingYear ? 'year' : previewData ? 'preview' : 'upload'

  function submitFile(file: File) {
    setPendingFile(file)
    previewMutation.mutate({ file }, {
      onSuccess: (data) => {
        if (data.needsYear) {
          setAwaitingYear(true)
          return
        }
        setPreviewData(data)
        setApprovedFunds(new Set(data.unknownFunds))
      },
    })
  }

  function submitYear() {
    if (!pendingFile || !isValidYear(yearInput)) return
    previewMutation.mutate({ file: pendingFile, year: Number(yearInput) }, {
      onSuccess: (data) => {
        setAwaitingYear(false)
        setPreviewData(data)
        setApprovedFunds(new Set(data.unknownFunds))
      },
    })
  }

  function toggleFund(name: string) {
    setApprovedFunds((prev) => {
      const next = new Set(prev)
      if (next.has(name)) {
        next.delete(name)
      } else {
        next.add(name)
      }
      return next
    })
  }

  function back() {
    previewMutation.reset()
    commitMutation.reset()
    setPendingFile(null)
    setYearInput(String(CURRENT_YEAR))
    setAwaitingYear(false)
    setPreviewData(null)
    setApprovedFunds(new Set())
  }

  function commit(onSuccess: (result: ImportCommitResultDto) => void) {
    if (!previewData) return
    const rowsToCommit = deriveRowsToCommit(previewData.rows, approvedFunds, previewData.unknownFunds)
    commitMutation.mutate(rowsToCommit, { onSuccess })
  }

  return {
    phase,
    pendingFile,
    yearInput,
    setYearInput,
    isYearValid: isValidYear(yearInput),
    previewData,
    approvedFunds,
    isPreviewPending: previewMutation.isPending,
    previewError: previewMutation.error?.message ?? null,
    isCommitPending: commitMutation.isPending,
    commitError: commitMutation.error?.message ?? null,
    submitFile,
    submitYear,
    toggleFund,
    back,
    commit,
  }
}
