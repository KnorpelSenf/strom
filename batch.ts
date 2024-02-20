export function makeBatch<E>(source: Iterable<Promise<IteratorResult<E>>>) {
  return (count: number): Iterable<Promise<IteratorResult<E[]>>> => {
    return {
      [Symbol.iterator]() {
        const itr = source[Symbol.iterator]();
        let complete = false;
        return {
          next() {
            if (complete) return { done: true, value: undefined };
            const promises = Array<Promise<IteratorResult<E>>>(count);
            let tupleSize = 0;
            for (; tupleSize < count; tupleSize++) {
              const res = itr.next();
              if (res.done) {
                promises.length = tupleSize;
                complete = true;
                break;
              }
              promises[tupleSize] = res.value;
            }
            return {
              done: false,
              value: Promise.all(promises).then((elems) => {
                const tuple = Array<E>(tupleSize);
                for (let i = 0; i < tupleSize; i++) {
                  const elem = elems[i];
                  if (elem.done) {
                    tuple.length = i;
                    break;
                  }
                  tuple[i] = elem.value;
                }
                return tuple.length === 0
                  ? { done: true, value: undefined }
                  : { done: false, value: tuple };
              }),
            };
          },
        };
      },
    };
  };
}
