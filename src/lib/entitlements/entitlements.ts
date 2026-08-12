export type EntitlementKey =
  'advanced_presets' | 'large_batches' | 'priority_processing' | 'ad_free'

export type EntitlementContext = {
  userId?: string
}

export interface EntitlementProvider {
  hasEntitlement(key: EntitlementKey, context?: EntitlementContext): boolean | Promise<boolean>
}

const freeProvider: EntitlementProvider = {
  hasEntitlement: () => false,
}

let activeProvider: EntitlementProvider = freeProvider

export function setEntitlementProvider(provider: EntitlementProvider): void {
  activeProvider = provider
}

export function hasEntitlement(
  key: EntitlementKey,
  context?: EntitlementContext,
): boolean | Promise<boolean> {
  return activeProvider.hasEntitlement(key, context)
}
