export function makePop<E>(source: AsyncIterable<E>) {
  return async (): Promise<[E | undefined, AsyncIterable<E>]> => {
    const itr = source[Symbol.asyncIterator]();
    const head = await itr.next();
    const rest = { [Symbol.asyncIterator]: () => itr };
    return [head.done ? undefined : head.value, rest];
  };
}
