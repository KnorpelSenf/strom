export function makeTake<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return (count: number): Iterable<Promise<IteratorResult<E>>> => {
    async function* take() {
      for await (const element of source) {
        if (count-- <= 0) break;
        yield element;
      }
    }
    return take();
  };
}
