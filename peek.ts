export function makepeek<E>(source: AsyncIterable<E>) {
  return (
    callback: (element: E, index: number) => unknown,
  ): AsyncIterable<E> => {
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
