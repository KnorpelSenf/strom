export function makeZip<E>(source: AsyncIterable<E>) {
  return <T>(other: AsyncIterable<T>): AsyncIterable<[E, T]> => {
    async function* zip() {
      const left = source[Symbol.asyncIterator]();
      const right = other[Symbol.asyncIterator]();
      async function both(): Promise<IteratorResult<[E, T]>> {
        const [l, r] = await Promise.all([left.next(), right.next()]);
        return l.done || r.done
          ? { done: true, value: undefined }
          : { value: [l.value, r.value] };
      }
      let res: IteratorResult<[E, T]>;
      while (!(res = await both()).done) yield res.value;
    }
    return zip();
  };
}
