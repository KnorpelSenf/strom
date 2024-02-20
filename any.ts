export function makeAny<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return async (): Promise<boolean> => {
    for await (const element of source) {
      if (element.done) break;
      if (element.value) return true;
    }
    return false;
  };
}
