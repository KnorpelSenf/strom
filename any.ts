export function makeAny<E>(source: AsyncIterable<E>) {
  return async (): Promise<boolean> => {
    for await (const element of source) if (element) return true;
    return false;
  };
}
