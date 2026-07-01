/**
 * Object.assign(target, dto) is unsafe for partial-update DTOs: TS class fields
 * declared without an initializer still become own properties set to `undefined`
 * when the DTO is instantiated (useDefineForClassFields), so omitted fields would
 * silently overwrite the target with `undefined`. This copies only defined keys.
 */
export function assignDefined<T extends object>(
  target: T,
  dto: Partial<Record<keyof T, unknown>>,
): T {
  for (const key of Object.keys(dto) as Array<keyof T>) {
    const value = dto[key];
    if (value !== undefined) {
      target[key] = value as T[keyof T];
    }
  }
  return target;
}
