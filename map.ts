export function makeMap<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return <T>(
    transform: (element: E, index: number) => T | Promise<T>,
  ): Iterable<Promise<IteratorResult<T>>> => {
    return {
      [Symbol.iterator]() {
        const it = source[Symbol.iterator]();
        let index = 0;
        return {
          next() {
            const i = index++;
            const res = it.next();
            if (res.done) return res;
            return {
              done: false,
              value: res.value.then(async (r): Promise<IteratorResult<T>> => {
                if (r.done) return r;
                else return { done: false, value: await transform(r.value, i) };
              }),
            };
          },
        };
      },
    };
  };
}
