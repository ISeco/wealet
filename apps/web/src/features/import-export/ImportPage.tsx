// apps/web/src/features/import-export/ImportPage.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { useImportCommit, useImportPreview } from './hooks'
import type { ImportCommitResultDto, ImportPreviewResponseDto } from './types'
import { StepIndicator } from './components/StepIndicator'
import { UploadStep } from './components/UploadStep'
import { PreviewStep } from './components/PreviewStep'
import { SuccessStep } from './components/SuccessStep'

export function ImportPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [previewData, setPreviewData] = useState<ImportPreviewResponseDto | null>(null)
  const [approvedFunds, setApprovedFunds] = useState<Set<string>>(new Set())
  const [commitResult, setCommitResult] = useState<ImportCommitResultDto | null>(null)

  const previewMutation = useImportPreview()
  const commitMutation = useImportCommit()

  function handleFileReady(file: File) {
    previewMutation.mutate(file, {
      onSuccess: (data) => {
        setPreviewData(data)
        setApprovedFunds(new Set(data.unknownFunds))
        setStep(2)
      },
    })
  }

  function handleToggleFund(name: string) {
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

  function handleBack() {
    previewMutation.reset()
    setPreviewData(null)
    setApprovedFunds(new Set())
    setStep(1)
  }

  function handleConfirm() {
    if (!previewData) return
    const rowsToCommit = previewData.rows.filter(
      (row) =>
        !row.duplicate &&
        (!previewData.unknownFunds.includes(row.fundName) || approvedFunds.has(row.fundName)),
    )
    commitMutation.mutate(rowsToCommit, {
      onSuccess: (result) => {
        setCommitResult(result)
        setStep(3)
      },
    })
  }

  function handleReset() {
    previewMutation.reset()
    commitMutation.reset()
    setPreviewData(null)
    setApprovedFunds(new Set())
    setCommitResult(null)
    setStep(1)
  }

  return (
    <div style={{ maxWidth: 920, margin: '0 auto' }}>
      <StepIndicator currentStep={step} />

      {step === 1 && (
        <UploadStep
          onFileReady={handleFileReady}
          isPending={previewMutation.isPending}
          error={previewMutation.error?.message ?? null}
        />
      )}

      {step === 2 && previewData && (
        <PreviewStep
          previewData={previewData}
          approvedFunds={approvedFunds}
          onToggleFund={handleToggleFund}
          onBack={handleBack}
          onConfirm={handleConfirm}
          isPending={commitMutation.isPending}
        />
      )}

      {step === 3 && commitResult && (
        <SuccessStep
          result={commitResult}
          displayName={user?.displayName ?? null}
          onImportAnother={handleReset}
          onGoToTransactions={() => navigate('/transacciones')}
        />
      )}
    </div>
  )
}
