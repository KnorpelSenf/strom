export function makeZip<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return <T>(
    other: Iterable<Promise<IteratorResult<T>>>,
  ): Iterable<Promise<IteratorResult<[E, T]>>> => {
    return {
      [Symbol.iterator]() {
        const left = source[Symbol.iterator]();
        const right = other[Symbol.iterator]();
        return {
          next() {
            const [l, r] = [left.next(), right.next()];
            if (l.done || r.done) return { done: true, value: undefined };
            return {
              done: false,
              value: Promise.all([l.value, r.value]).then(([lv, rv]) => {
                if (lv.done || rv.done) return { done: true, value: undefined };
                return { done: false, value: [lv.value, rv.value] };
              }),
            };
          },
        };
      },
    };
  };
}
