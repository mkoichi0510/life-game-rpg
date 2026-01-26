/**
 * Check if the given path exactly matches the target path.
 */
export function exactMatch(path: string, target: string): boolean {
  return path === target;
}

/**
 * Check if the given path starts with the target prefix.
 */
export function prefixMatch(path: string, prefix: string): boolean {
  return path.startsWith(prefix);
}
