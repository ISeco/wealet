import { useCallback, useRef, useState } from 'react'

/**
 * Tracks per-field validation errors and focuses/scrolls to the first invalid
 * field on validation. Works with both native inputs and custom controls
 * (e.g. `Select`) as long as they forward a ref to a focusable element.
 */
export function useFormFieldErrors<T extends string>(fields: readonly T[]) {
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<T, boolean>>>({})
  const elementsRef = useRef({} as Record<T, HTMLElement | null>)

  const register = useCallback(
    (field: T) => (el: HTMLElement | null) => {
      elementsRef.current[field] = el
    },
    [],
  )

  const clearFieldError = useCallback((field: T) => {
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: false } : prev))
  }, [])

  /** Sets the given field errors and, if any, focuses + scrolls to the first invalid field. Returns whether all fields are valid. */
  const validate = useCallback(
    (invalid: Partial<Record<T, boolean>>) => {
      setFieldErrors(invalid)
      const firstInvalidField = fields.find((field) => invalid[field])
      if (firstInvalidField) {
        const el = elementsRef.current[firstInvalidField]
        el?.focus()
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return !firstInvalidField
    },
    [fields],
  )

  return { fieldErrors, register, clearFieldError, validate }
}
