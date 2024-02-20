export function makeZip<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return <T>(
    other: Iterable<Promise<IteratorResult<T>>>,
  ): Iterable<Promise<IteratorResult<[E, T]>>> => {
    return {
      [Symbol.iterator]() {
        const left = source[Symbol.iterator]();
        const right = other[Symbol.iterator]();
        async function both(): Promise<IteratorResult<[E, T]>> {
          const [l, r] = [left.next(), right.next()];
          if (l.done || r.done) return { done: true, value: undefined };
          const [lv, rv] = await Promise.all([l.value, r.value]);
          if (lv.done || rv.done) return { done: true, value: undefined };
          return { done: false, value: [lv.value, rv.value] };
        }
        return {
          next() {
            return { done: false, value: both() };
          },
        };
      },
    };
  };
}
