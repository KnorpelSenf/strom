export function makePrepend<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return (
    ...others: Iterable<Promise<IteratorResult<E>>>[]
  ): Iterable<Promise<IteratorResult<E>>> => {
    return {
      [Symbol.iterator]() {
        const its = [...others, source].map((it) => it[Symbol.iterator]());
        let i = 0;
        async function nextElem(): Promise<IteratorResult<E>> {
          for (; i < its.length; i++) {
            const it = its[i].next();
            if (it.done) continue;
            const elem = await it.value;
            if (elem.done) continue;
            return elem;
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
