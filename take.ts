export function makeTake<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return (count: number): Iterable<Promise<IteratorResult<E>>> => {
    return {
      [Symbol.iterator]() {
        const itr = source[Symbol.iterator]();
        async function takeNext(): Promise<IteratorResult<E>> {
          if (count-- === 0) return { done: true, value: undefined };
          const result = itr.next();
          if (result.done) return { done: true, value: undefined };
          const res = await result.value;
          if (res.done) return { done: true, value: undefined };
          return res;
        }
        return {
          next() {
            return { done: false, value: takeNext() };
          },
        };
      },
    };
  };
}
