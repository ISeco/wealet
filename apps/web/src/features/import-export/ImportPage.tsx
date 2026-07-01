// apps/web/src/features/import-export/ImportPage.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { Button } from '../../components/ui/Button'
import { useExcelImportFlow } from './useExcelImportFlow'
import type { ImportCommitResultDto } from './types'
import { StepIndicator } from './components/StepIndicator'
import { UploadStep } from './components/UploadStep'
import { PreviewStep } from './components/PreviewStep'
import { SuccessStep } from './components/SuccessStep'
import { YearPromptStep } from './components/YearPromptStep'

export function ImportPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const flow = useExcelImportFlow()
  const [commitResult, setCommitResult] = useState<ImportCommitResultDto | null>(null)

  function handleReset() {
    flow.back()
    setCommitResult(null)
  }

  const currentStep = commitResult ? 3 : flow.phase === 'preview' ? 2 : 1

  return (
    <div style={{ maxWidth: 920, margin: '0 auto' }}>
      <StepIndicator currentStep={currentStep} />

      {flow.phase === 'upload' && (
        <UploadStep
          onFileReady={flow.submitFile}
          isPending={flow.isPreviewPending}
          error={flow.previewError}
        />
      )}

      {flow.phase === 'year' && flow.pendingFile && (
        <div>
          <YearPromptStep
            fileName={flow.pendingFile.name}
            value={flow.yearInput}
            onChange={flow.setYearInput}
            isPending={flow.isPreviewPending}
            error={flow.previewError}
          />
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 16 }}>
            <Button variant="secondary" size="sm" onClick={flow.back} disabled={flow.isPreviewPending}>
              ← Volver
            </Button>
            <Button
              size="sm"
              onClick={flow.submitYear}
              disabled={!flow.isYearValid || flow.isPreviewPending}
            >
              {flow.isPreviewPending ? 'Analizando…' : 'Continuar'}
            </Button>
          </div>
        </div>
      )}

      {flow.phase === 'preview' && flow.previewData && !commitResult && (
        <PreviewStep
          previewData={flow.previewData}
          approvedFunds={flow.approvedFunds}
          onToggleFund={flow.toggleFund}
          onBack={flow.back}
          onConfirm={() => flow.commit(setCommitResult)}
          isPending={flow.isCommitPending}
          error={flow.commitError}
        />
      )}

      {commitResult && (
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
