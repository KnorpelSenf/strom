export function makeZipWith<E>(source: AsyncIterable<E>) {
  return <T, U>(
    other: AsyncIterable<T>,
    zipper: (element: E, other: T) => U | Promise<U>,
  ): AsyncIterable<U> => {
    async function* zipWith() {
      const left = source[Symbol.asyncIterator]();
      const right = other[Symbol.asyncIterator]();
      async function both(): Promise<IteratorResult<U>> {
        const [l, r] = await Promise.all([left.next(), right.next()]);
        return l.done || r.done
          ? { done: true, value: undefined }
          : { value: await zipper(l.value, r.value) };
      }
      let res: IteratorResult<U>;
      while (!(res = await both()).done) yield res.value;
    }
    return zipWith();
  };
}
