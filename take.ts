export function makeTake<E>(source: AsyncIterable<E>) {
  return (count: number): AsyncIterable<E> => {
    async function* take() {
      for await (const element of source) {
        if (count-- <= 0) break;
        yield element;
      }
    }
    return take();
  };
}
