export function makeSequential<E>(
  source: Iterable<Promise<IteratorResult<E>>>,
) {
  return (): Iterable<Promise<IteratorResult<E>>> => {
    async function* seq() {
      for await (const elem of source) {
        if (elem.done) break;
        yield elem.value;
      }
    }
    return {
      [Symbol.iterator]() {
        const it = seq();
        return {
          next() {
            return { done: false, value: it.next() };
          },
        };
      },
    };
  };
}
