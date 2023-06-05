export function makepeek<E>(source: AsyncIterable<E>) {
  return (peek: (element: E) => unknown): AsyncIterable<E> => {
    async function* loop() {
      for await (const element of source) {
        await peek(element);
        yield element;
      }
    }
    return loop();
  };
}
