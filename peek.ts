export function makepeek<E>(source: AsyncIterable<E>) {
  return (callback: (element: E) => unknown): AsyncIterable<E> => {
    async function* loop() {
      for await (const element of source) {
        await callback(element);
        yield element;
      }
    }
    return loop();
  };
}
