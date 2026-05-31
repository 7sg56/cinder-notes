/**
 * Bridge module to break the circular dependency between useAppStore and useSplitStore.
 *
 * Both stores need to call each other's methods. Since ES modules don't allow
 * circular imports at the top level, this module provides a lazy accessor pattern.
 * Each store registers itself here at creation time, and the other store accesses
 * it through the getter.
 */

import type { StoreApi } from 'zustand';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let splitStoreRef: StoreApi<any> | null = null;

export function registerSplitStore(store: StoreApi<unknown>): void {
  splitStoreRef = store;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSplitStore(): StoreApi<any> {
  if (!splitStoreRef) {
    throw new Error(
      'SplitStore not yet registered. This is a startup race condition.'
    );
  }
  return splitStoreRef;
}
