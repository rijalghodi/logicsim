/**
 * Stable, globally-unique IDs for anything that needs to be referenced
 * across serialization boundaries (components, ports, gate definitions).
 * Using randomUUID keeps IDs opaque and collision-free without the core
 * depending on any storage layer to hand out sequential IDs.
 */
export function createId(prefix?: string): string {
  const uuid = crypto.randomUUID();
  return prefix ? `${prefix}_${uuid}` : uuid;
}
