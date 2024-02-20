export function makeFlatMap<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return <T>(
    transform: (
      element: E,
      index: number,
    ) => Iterable<Promise<IteratorResult<T>>>,
  ): Iterable<Promise<IteratorResult<T>>> => {
    return {
      [Symbol.iterator]() {
        const it = source[Symbol.iterator]();
        let index = 0;
        async function nextIter(): Promise<
          IteratorResult<Iterator<Promise<IteratorResult<T>>>>
        > {
          const cur = it.next();
          if (cur.done) return cur;
          const res = await cur.value;
          if (res.done) return res;
          const elem = res.value;
          const nested = transform(elem, index++);
          return { done: false, value: nested[Symbol.iterator]() };
        }
        let last:
          | IteratorResult<Iterator<Promise<IteratorResult<T>>>>
          | undefined;
        async function nextElem(): Promise<IteratorResult<T>> {
          while (!(last ??= await nextIter()).done) {
            const elem = last.value.next();
            if (!elem.done) {
              const val = await elem.value;
              if (!val.done) {
                return val;
              }
            }
            // current iterator is exhausted, reset
            last = undefined;
          }
          return { done: true, value: undefined };
        }
        return {
          next() {
            return { done: false, value: nextElem() };
          },
        };
      },
    };
  };
}
