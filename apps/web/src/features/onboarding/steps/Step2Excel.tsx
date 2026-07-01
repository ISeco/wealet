import { UploadStep } from '../../import-export/components/UploadStep'
import { PreviewStep } from '../../import-export/components/PreviewStep'
import { YearPromptStep } from '../../import-export/components/YearPromptStep'
import type { ExcelImportFlow } from '../../import-export/useExcelImportFlow'

interface Props {
  flow: ExcelImportFlow
  onCommitSuccess: () => void
}

export function Step2Excel({ flow, onCommitSuccess }: Props) {
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--muted)' }}>
          Paso 2 · Importar historial
        </div>
        <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-.02em', color: 'var(--text)', marginTop: 10 }}>
          Importar Excel
        </div>
        <div style={{ fontSize: 15, color: 'var(--muted)', marginTop: 8 }}>
          Sube tu archivo para detectar fondos y transacciones automáticamente.
        </div>
      </div>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {flow.phase === 'upload' && (
          <UploadStep
            onFileReady={flow.submitFile}
            isPending={flow.isPreviewPending}
            error={flow.previewError}
          />
        )}
        {flow.phase === 'year' && flow.pendingFile && (
          <YearPromptStep
            fileName={flow.pendingFile.name}
            value={flow.yearInput}
            onChange={flow.setYearInput}
            isPending={flow.isPreviewPending}
            error={flow.previewError}
          />
        )}
        {flow.phase === 'preview' && flow.previewData && (
          <PreviewStep
            previewData={flow.previewData}
            approvedFunds={flow.approvedFunds}
            onToggleFund={flow.toggleFund}
            onBack={flow.back}
            onConfirm={() => flow.commit(() => onCommitSuccess())}
            isPending={flow.isCommitPending}
            error={flow.commitError}
          />
        )}
      </div>
    </div>
  )
}
