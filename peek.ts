export function makepeek<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return (
    callback: (element: E, index: number) => unknown,
  ): Iterable<Promise<IteratorResult<E>>> => {
    async function* loop() {
      let index = 0;
      for await (const element of source) {
        await callback(element, index++);
        yield element;
      }
    }
    return loop();
  };
}
