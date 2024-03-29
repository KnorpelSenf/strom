export function makeTake<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return (count: number): Iterable<Promise<IteratorResult<E>>> => {
    return {
      [Symbol.iterator]() {
        let remaining = count;
        const itr = source[Symbol.iterator]();
        return {
          next() {
            if (remaining === 0) return { done: true, value: undefined };
            remaining--;
            return itr.next();
          },
        };
      },
    };
  };
}
