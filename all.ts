export function makeAll<E>(source: AsyncIterable<E>) {
  return async (): Promise<boolean> => {
    for await (const element of source) if (!element) return false;
    return true;
  };
}
